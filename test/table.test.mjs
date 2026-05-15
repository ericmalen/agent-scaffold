import { test } from 'node:test';
import assert from 'node:assert/strict';
import { table } from '../lib/table.mjs';

test('table — renders header, rules, and rows', () => {
  const out = table(['file', 'dest'], [['a.md', 'a.md.ai-kit']]);
  const lines = out.split('\n');
  assert.equal(lines.length, 5); // top rule, header, mid rule, 1 row, bottom rule
  assert.ok(lines[0].startsWith('┌') && lines[0].endsWith('┐'));
  assert.ok(lines[1].includes('file') && lines[1].includes('dest'));
  assert.ok(lines[2].startsWith('├') && lines[2].endsWith('┤'));
  assert.ok(lines[3].includes('a.md') && lines[3].includes('a.md.ai-kit'));
  assert.ok(lines[4].startsWith('└') && lines[4].endsWith('┘'));
});

test('table — every line is the same visible width', () => {
  const out = table(['x'], [['short'], ['muchlongervalue']]);
  const lines = out.split('\n');
  const w = lines[0].length;
  assert.ok(lines.every(l => l.length === w));
});

test('table — column width fits the widest cell, header included', () => {
  const out = table(['a-long-header'], [['v']]);
  const lines = out.split('\n');
  // header is wider than the cell, so the column sizes to the header
  assert.ok(lines[1].includes('a-long-header'));
  assert.equal(lines[0].length, lines[3].length);
});

test('table — indent prefixes every line', () => {
  const out = table(['h'], [['v']], { indent: 3 });
  assert.ok(out.split('\n').every(l => l.startsWith('   ')));
});

test('table — handles multiple columns and rows', () => {
  const out = table(['c1', 'c2'], [['a', 'b'], ['cc', 'dd']]);
  const lines = out.split('\n');
  assert.equal(lines.length, 6); // top, header, mid, 2 rows, bottom
});
