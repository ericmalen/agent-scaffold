import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { walkFiles } from './fsutil.mjs';

// Where to look for pre-existing unmanaged AI-config files.
// `.claude/` is AI-config-exclusive — scan the whole subtree.
// `.github/` and `.vscode/` are shared with CI and editor tooling — scan only the
// specific AI surfaces, never the whole directory, or every CI workflow and editor
// config file gets flagged as "unmanaged AI config".
// `docs/` is general-purpose: ai-kit adds named files there but never owns
// the directory, so it is not scanned at all.
const UNMANAGED_SCAN = [
  { base: '.claude' },
  { base: '.github', only: ['copilot-instructions.md', 'instructions', 'prompts', 'chatmodes', 'skills', 'agents'] },
  { base: '.vscode', only: ['settings.json'] },
];

// Directories to skip when walking the repo for nested CLAUDE.md / AGENTS.md
const NESTED_SCAN_EXCLUDES = new Set([
  '.git', 'node_modules', '.claude', '.ai-kit-staging',
  'dist', 'build', 'bin', 'obj', 'coverage', '.next', '.venv', 'target', 'out',
]);

function* walkNestedInstructions(dir) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const entry of entries) {
    if (NESTED_SCAN_EXCLUDES.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkNestedInstructions(full);
    } else if (entry.isFile() && (entry.name === 'CLAUDE.md' || entry.name === 'AGENTS.md')) {
      yield full;
    }
  }
}

export function scan(consumerRoot, registry) {
  const existingPaths = [];

  for (const scanPath of registry.brownfieldScanPaths) {
    if (existsSync(join(consumerRoot, scanPath))) {
      existingPaths.push(scanPath);
    }
  }

  // Check .vscode/settings.json separately for AI-specific keys
  const vscodePath = join(consumerRoot, '.vscode', 'settings.json');
  if (existsSync(vscodePath) && !existingPaths.includes('.vscode/settings.json')) {
    try {
      const vsSettings = JSON.parse(readFileSync(vscodePath, 'utf8'));
      if (registry.vscodeAiKeys.some(k => k in vsSettings)) {
        existingPaths.push('.vscode/settings.json');
      }
    } catch {}
  }

  return { isBrownfield: existingPaths.length > 0, existingPaths };
}

export function resolveTarget(srcRel, isBrownfield, consumerRoot) {
  if (!isBrownfield) return srcRel;
  if (existsSync(join(consumerRoot, srcRel))) return srcRel + '.ai-kit';
  return srcRel;
}

export function findPreexistingUnmanaged(consumerRoot, knownConsumerPaths) {
  const unmanaged = [];
  for (const { base, only } of UNMANAGED_SCAN) {
    const roots = only
      ? only.map((p) => join(consumerRoot, base, p))
      : [join(consumerRoot, base)];
    for (const absRoot of roots) {
      if (!existsSync(absRoot)) continue;
      const files = statSync(absRoot).isDirectory() ? walkFiles(absRoot) : [absRoot];
      for (const absFile of files) {
        const rel = relative(consumerRoot, absFile).replace(/\\/g, '/');
        if (!knownConsumerPaths.has(rel)) unmanaged.push(rel);
      }
    }
  }
  // Walk repo for nested CLAUDE.md / AGENTS.md (excludes root and known paths)
  for (const absFile of walkNestedInstructions(consumerRoot)) {
    const rel = relative(consumerRoot, absFile).replace(/\\/g, '/');
    if (rel === 'CLAUDE.md' || rel === 'AGENTS.md') continue;
    if (!knownConsumerPaths.has(rel)) unmanaged.push(rel);
  }

  return unmanaged;
}
