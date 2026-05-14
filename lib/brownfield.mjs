import { existsSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { walkFiles } from './fsutil.mjs';

const MANAGED_SUBDIRS = ['.claude', '.github', '.vscode', 'docs'];

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
  if (existsSync(join(consumerRoot, srcRel))) return srcRel + '.scaffold';
  return srcRel;
}

export function findPreexistingUnmanaged(consumerRoot, knownConsumerPaths) {
  const unmanaged = [];
  for (const dir of MANAGED_SUBDIRS) {
    const absDir = join(consumerRoot, dir);
    if (!existsSync(absDir)) continue;
    for (const absFile of walkFiles(absDir)) {
      const rel = relative(consumerRoot, absFile).replace(/\\/g, '/');
      if (!knownConsumerPaths.has(rel)) unmanaged.push(rel);
    }
  }
  return unmanaged;
}
