const CONTEXT = 3;

function computeLCS(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Int32Array(n + 1));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  const lcs = [];
  let i = m, j = n;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) { lcs.unshift([i - 1, j - 1]); i--; j--; }
    else if (dp[i - 1][j] >= dp[i][j - 1]) i--;
    else j--;
  }
  return lcs;
}

export function lineDiff(aText, bText) {
  const aLines = aText === '' ? [] : aText.split('\n');
  const bLines = bText === '' ? [] : bText.split('\n');
  const lcs = computeLCS(aLines, bLines);
  const result = [];
  let ai = 0, bi = 0, li = 0;
  while (li < lcs.length) {
    const [la, lb] = lcs[li];
    while (ai < la) result.push({ type: 'del', line: aLines[ai++] });
    while (bi < lb) result.push({ type: 'add', line: bLines[bi++] });
    result.push({ type: 'ctx', line: aLines[ai++] });
    bi++; li++;
  }
  while (ai < aLines.length) result.push({ type: 'del', line: aLines[ai++] });
  while (bi < bLines.length) result.push({ type: 'add', line: bLines[bi++] });
  return result;
}

export function render(diff) {
  const isTTY = process.stdout.isTTY;
  const addColor = isTTY ? '\x1b[32m' : '';
  const delColor = isTTY ? '\x1b[31m' : '';
  const reset    = isTTY ? '\x1b[0m'  : '';

  if (!diff.some(d => d.type !== 'ctx')) return '(no changes)';

  const show = new Array(diff.length).fill(false);
  for (let i = 0; i < diff.length; i++) {
    if (diff[i].type !== 'ctx') {
      const lo = Math.max(0, i - CONTEXT);
      const hi = Math.min(diff.length - 1, i + CONTEXT);
      for (let j = lo; j <= hi; j++) show[j] = true;
    }
  }

  const lines = [];
  let skipping = false;
  for (let i = 0; i < diff.length; i++) {
    if (!show[i]) {
      if (!skipping) { lines.push('  ...'); skipping = true; }
      continue;
    }
    skipping = false;
    const d = diff[i];
    if (d.type === 'add') lines.push(`${addColor}+ ${d.line}${reset}`);
    else if (d.type === 'del') lines.push(`${delColor}- ${d.line}${reset}`);
    else lines.push(`  ${d.line}`);
  }
  return lines.join('\n');
}
