import { posix } from 'node:path';

// Rewrites relative markdown link paths in `content` so a link that resolved
// from `fromRel` resolves identically from `toRel`. Both paths are
// consumer-root-relative (e.g. `.cursor/rules/foo.md`, `AGENTS.md`).
//
// Only paths starting with `./` or `../` are rewritten. URLs, anchors, mailto,
// filesystem-absolute paths, and consumer-root-absolute paths (e.g.
// `.claude/skills/foo/SKILL.md`, `docs/migration.md`) are left untouched —
// those stay valid through any move within the consumer root.
//
// Handles inline links `[label](path)`, image links `![alt](path)`, and
// reference-style definitions `[ref]: path`. Preserves optional title
// attributes.
export function rewriteMarkdownRefs(content, fromRel, toRel) {
  if (fromRel === toRel) return content;
  const fromDir = posix.dirname(fromRel);
  const toDir = posix.dirname(toRel);

  let out = content.replace(LINK_RE, (match, bang, label, inner) => {
    const { path, title } = splitTitle(inner);
    const next = rewritePath(path, fromDir, toDir);
    if (next === null) return match;
    return `${bang}[${label}](${next}${title})`;
  });

  out = out
    .split('\n')
    .map((line) => {
      const m = line.match(REF_DEF_RE);
      if (!m) return line;
      const next = rewritePath(m[2], fromDir, toDir);
      if (next === null) return line;
      return line.replace(m[2], next);
    })
    .join('\n');

  return out;
}

const LINK_RE = /(!?)\[([^\]]*)\]\(([^)]+)\)/g;
const REF_DEF_RE = /^\s*\[([^\]]+)\]:\s+(\S+)/;

function splitTitle(inner) {
  const m = inner.match(/^(\S+)(\s+["'(].*["')])\s*$/);
  if (m) return { path: m[1], title: m[2] };
  return { path: inner, title: '' };
}

function rewritePath(p, fromDir, toDir) {
  if (!p.startsWith('./') && !p.startsWith('../')) return null;
  const abs = posix.resolve('/' + fromDir, p);
  let rel = posix.relative('/' + toDir, abs);
  if (rel === '') rel = '.';
  // Always prefix `./` unless the result already starts with `../`. Without
  // this, a result like `.cursor/rules/foo.md` looks like a consumer-root
  // absolute path even though it's still a relative reference.
  if (!rel.startsWith('../') && !rel.startsWith('/')) rel = './' + rel;
  return rel;
}
