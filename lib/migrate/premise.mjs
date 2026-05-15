import { readFileSync, existsSync } from 'node:fs';

export function snapshot(absPath) {
  if (!existsSync(absPath)) {
    return { file: absPath, exists: false, lines: 0, first: '', last: '' };
  }
  const text = readFileSync(absPath, 'utf8');
  const rawLines = text.split('\n');
  const lines = text.endsWith('\n') ? rawLines.length - 1 : rawLines.length;
  return {
    file: absPath,
    exists: true,
    lines,
    first: rawLines[0] ?? '',
    last: rawLines[lines - 1] ?? '',
  };
}

export function verifyAll(snapshots) {
  const drifted = [];
  for (const snap of snapshots) {
    const current = snapshot(snap.file);
    if (
      current.exists !== snap.exists ||
      current.lines !== snap.lines ||
      current.first !== snap.first ||
      current.last !== snap.last
    ) {
      drifted.push({ file: snap.file, expected: snap, actual: current });
    }
  }
  return { ok: drifted.length === 0, drifted };
}
