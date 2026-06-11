export function format_table(counts, top) {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, top)
    .map(([word, n]) => `${String(n).padStart(6)}  ${word}`)
    .join('\n');
}
