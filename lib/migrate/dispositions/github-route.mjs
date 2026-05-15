import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { snapshot } from '../premise.mjs';
import { normalizeAgentFrontmatter } from '../normalize-agent.mjs';

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
    let content = readFileSync(srcAbs, 'utf8');
    // Coerce frontmatter `model:` to Claude Code's expected scalar form
    // (sonnet/opus/haiku/inherit) for routed `.agent.md` files. SKILL.md files
    // ship under .claude/skills/... where the same field meaning applies, so
    // normalize them too.
    if (dst.endsWith('.agent.md') || dst.endsWith('/SKILL.md')) {
      content = normalizeAgentFrontmatter(content);
    }
    stagingFiles.push({ relPath: dst, content });
    premiseSnapshots.push(snapshot(srcAbs));
  }
  return { stagingFiles, premiseSnapshots };
}
