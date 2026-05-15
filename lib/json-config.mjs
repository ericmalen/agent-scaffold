import { readFileSync } from 'node:fs';

export function parseJsonc(text) {
  // Strip block and line comments, then parse as JSON.
  // Assumes no "//" or "/*" inside string values — safe for our config files.
  const stripped = text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '');
  return JSON.parse(stripped);
}

export function readJsonConfig(absPath) {
  try {
    return parseJsonc(readFileSync(absPath, 'utf8'));
  } catch {
    return null;
  }
}
