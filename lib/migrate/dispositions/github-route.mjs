import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { snapshot } from '../premise.mjs';

// Routes a `.github/skills/<name>/` or `.github/agents/<name>.agent.md`
// asset to its `.claude/` equivalent by copying each source file into
// staging at the target path. Apply will rename staging → target and delete
// the original sources.
//
// Units with `hasCollision: true` (target already exists) skip staging so
// nothing gets clobbered. Their sources stay put and the user resolves
// manually.
export function stageUnit(unit, consumerRoot) {
  if (unit.hasCollision) {
    return { stagingFiles: [], premiseSnapshots: [] };
  }
  const stagingFiles = [];
  const premiseSnapshots = [];
  for (const { src, dst } of unit.files ?? []) {
    const srcAbs = join(consumerRoot, src);
    const content = readFileSync(srcAbs, 'utf8');
    stagingFiles.push({ relPath: dst, content });
    premiseSnapshots.push(snapshot(srcAbs));
  }
  return { stagingFiles, premiseSnapshots };
}
