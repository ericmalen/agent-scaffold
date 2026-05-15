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
