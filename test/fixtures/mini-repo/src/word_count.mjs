export function word_count(text) {
  const counts = new Map();
  for (const word of text.toLowerCase().split(/[^a-z0-9']+/).filter(Boolean)) {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  return counts;
}
