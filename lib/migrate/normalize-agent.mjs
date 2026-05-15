// Normalizes `.agent.md` frontmatter to Claude Code's expected shape.
// Agent files imported from other AI frameworks (Copilot, Cursor, internal
// tooling) often carry invalid values like `model: [...]` arrays or verbose
// model names ("Claude Sonnet 4.6"). Claude Code rejects anything that isn't
// a single scalar from {sonnet, opus, haiku, inherit}.

const CANONICAL_MODELS = new Set(['sonnet', 'opus', 'haiku', 'inherit']);

// Map verbose / branded names to canonical slugs. Match by first family token.
function toCanonicalModel(value) {
  if (!value) return 'inherit';
  const lower = String(value).toLowerCase().trim();
  if (CANONICAL_MODELS.has(lower)) return lower;
  if (lower.includes('sonnet')) return 'sonnet';
  if (lower.includes('opus')) return 'opus';
  if (lower.includes('haiku')) return 'haiku';
  return 'inherit';
}

// Extract first item from a YAML flow-sequence like `[a, "b", c]`.
function firstFlowSeqItem(raw) {
  const inner = raw.trim().replace(/^\[/, '').replace(/\]$/, '');
  const first = inner.split(',')[0]?.trim() ?? '';
  // Strip surrounding quotes (single or double)
  if ((first.startsWith('"') && first.endsWith('"')) ||
      (first.startsWith("'") && first.endsWith("'"))) {
    return first.slice(1, -1);
  }
  return first;
}

// Rewrites the `model:` line in a markdown file's YAML frontmatter to a
// canonical scalar. No-op if frontmatter is absent or `model:` is missing.
// Idempotent.
export function normalizeAgentFrontmatter(content) {
  if (!content.startsWith('---')) return content;
  const rest = content.slice(3);
  const end = rest.indexOf('\n---');
  if (end === -1) return content;

  const fmText = rest.slice(0, end);
  const after = rest.slice(end);

  const lines = fmText.split('\n');
  let touched = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(/^(\s*model\s*:\s*)(.*)$/);
    if (!m) continue;
    const prefix = m[1];
    const raw = m[2].trim();

    let picked;
    if (raw.startsWith('[')) {
      picked = firstFlowSeqItem(raw);
    } else if ((raw.startsWith('"') && raw.endsWith('"')) ||
               (raw.startsWith("'") && raw.endsWith("'"))) {
      picked = raw.slice(1, -1);
    } else {
      picked = raw;
    }

    const canonical = toCanonicalModel(picked);
    const newLine = `${prefix}${canonical}`;
    if (newLine !== line) {
      lines[i] = newLine;
      touched = true;
    }
  }

  if (!touched) return content;
  return '---' + lines.join('\n') + after;
}
