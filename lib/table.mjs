// Render a bordered table as a single string. Box-drawing characters; each
// column is sized to its widest cell (header included). `columns` is an array
// of header strings; `rows` is an array of arrays of cell strings.
export function table(columns, rows, { indent = 0 } = {}) {
  const widths = columns.map((h, i) =>
    Math.max(h.length, ...rows.map(r => String(r[i] ?? '').length))
  );
  const pad = ' '.repeat(indent);
  const rule = (l, m, r) =>
    pad + l + widths.map(w => '─'.repeat(w + 2)).join(m) + r;
  const row = cells =>
    pad + '│ ' +
    cells.map((cell, i) => String(cell ?? '').padEnd(widths[i])).join(' │ ') +
    ' │';
  return [
    rule('┌', '┬', '┐'),
    row(columns),
    rule('├', '┼', '┤'),
    ...rows.map(row),
    rule('└', '┴', '┘'),
  ].join('\n');
}
