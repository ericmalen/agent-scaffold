import { readFileSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { parseFrontmatter } from '../../frontmatter.mjs';
import { snapshot } from '../premise.mjs';

const SHIM = '@AGENTS.md\n';

export function stageUnit(unit, consumerRoot) {
  const src0 = unit.sources[0];
  const srcRel = typeof src0 === 'string' ? src0 : src0.path;
  const srcAbs = join(consumerRoot, srcRel);
  const premiseSnapshots = [snapshot(srcAbs)];

  const raw = readFileSync(srcAbs, 'utf8');
  const { frontmatter, body } = parseFrontmatter(raw);

  const targetDir = resolveTargetDir(frontmatter.applyTo, srcRel);

  const agentsMdPath = targetDir ? `${targetDir}/AGENTS.md` : 'AGENTS.md';
  const claudeMdPath = targetDir ? `${targetDir}/CLAUDE.md` : 'CLAUDE.md';

  // Snapshot target files if they exist
  premiseSnapshots.push(snapshot(join(consumerRoot, agentsMdPath)));

  const stagingFiles = [
    { relPath: agentsMdPath, content: body.trim() + '\n' },
    { relPath: claudeMdPath, content: SHIM },
  ];

  return { stagingFiles, premiseSnapshots };
}

// Derive target directory from the applyTo: glob.
// e.g. 'src/**/*.cs' → 'src'   'src/api/*.ts' → 'src/api'
function resolveTargetDir(applyTo, fallbackSrc) {
  if (!applyTo) return deriveFromFilename(fallbackSrc);
  const parts = applyTo.replace(/\\/g, '/').split('/');
  const staticParts = [];
  for (const part of parts) {
    if (part.includes('*') || part.includes('?')) break;
    staticParts.push(part);
  }
  return staticParts.length > 0 ? staticParts.join('/') : null;
}

// Fallback: derive from the instructions filename if no applyTo glob.
// e.g. '.github/instructions/backend.instructions.md' → 'src' (can't infer, use null)
function deriveFromFilename(_srcRel) {
  return null; // safe default: fold into root AGENTS.md
}
