import { readFileSync } from 'node:fs';

// Strip JSONC comments while respecting string boundaries so URLs like
// "https://example.com" survive intact. Scans char-by-char; tracks whether
// we are inside a double-quoted string (with `\"` escaping) and only strips
// `//…\n` line comments or `/* … */` block comments when outside a string.
export function parseJsonc(text) {
  let out = '';
  let i = 0;
  let inString = false;
  const len = text.length;
  while (i < len) {
    const ch = text[i];
    if (inString) {
      out += ch;
      if (ch === '\\' && i + 1 < len) {
        out += text[i + 1];
        i += 2;
        continue;
      }
      if (ch === '"') inString = false;
      i += 1;
      continue;
    }
    if (ch === '"') {
      inString = true;
      out += ch;
      i += 1;
      continue;
    }
    if (ch === '/' && i + 1 < len) {
      const next = text[i + 1];
      if (next === '/') {
        i += 2;
        while (i < len && text[i] !== '\n') i += 1;
        continue;
      }
      if (next === '*') {
        i += 2;
        while (i < len && !(text[i] === '*' && text[i + 1] === '/')) i += 1;
        i += 2;
        continue;
      }
    }
    out += ch;
    i += 1;
  }
  return JSON.parse(out);
}

export function readJsonConfig(absPath) {
  try {
    return parseJsonc(readFileSync(absPath, 'utf8'));
  } catch {
    return null;
  }
}
