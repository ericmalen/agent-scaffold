// Utilities for resolving applyTo glob values from .instructions.md frontmatter.

// Extracts the static path prefix from a single applyTo glob value.
// 'src/**/*.ts' → 'src'   'src/api/**' → 'src/api'   '**' → null (root)
function deriveStaticPrefix(glob) {
  if (!glob) return null;
  const parts = glob.replace(/\\/g, '/').split('/');
  const staticParts = [];
  for (const part of parts) {
    if (part.includes('*') || part.includes('?')) break;
    staticParts.push(part);
  }
  return staticParts.length > 0 ? staticParts.join('/') : null;
}

// Handles single or multi-glob applyTo values ('src/**,test/**').
// Returns an array of target dirs ('' means root AGENTS.md).
// Returns null if applyTo is absent/empty.
export function deriveTargetDirs(applyTo) {
  if (!applyTo) return null;
  const globs = applyTo.split(',').map(g => g.trim()).filter(Boolean);
  const dirs = new Set();
  for (const glob of globs) {
    dirs.add(deriveStaticPrefix(glob) ?? '');
  }
  return [...dirs];
}

// An instruction file is "unscoped" when it folds to root AGENTS.md by
// default — either because applyTo is missing/empty (no scope at all) or
// because every glob resolves to the repo root (e.g. '**'). Distinguishing
// these from deliberately root-scoped files lets preflight surface them so
// the user knows about cross-cutting `.instructions.md` files.
export function isUnscopedApplyTo(applyTo) {
  const dirs = deriveTargetDirs(applyTo);
  if (dirs === null) return true;
  return dirs.length === 1 && dirs[0] === '';
}
