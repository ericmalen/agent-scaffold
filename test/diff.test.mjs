import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lineDiff, render } from '../lib/diff.mjs';

test('lineDiff — identical texts produce only ctx entries', () => {
  const diff = lineDiff('a\nb\nc', 'a\nb\nc');
  assert.ok(diff.every(d => d.type === 'ctx'));
});

test('lineDiff — empty inputs', () => {
  assert.deepEqual(lineDiff('', ''), []);
  const addAll = lineDiff('', 'a\nb');
  assert.ok(addAll.every(d => d.type === 'add'));
  const delAll = lineDiff('a\nb', '');
  assert.ok(delAll.every(d => d.type === 'del'));
});

test('lineDiff — detects single-line change', () => {
  const diff = lineDiff('a\nb\nc', 'a\nX\nc');
  const types = diff.map(d => d.type);
  assert.ok(types.includes('del'));
  assert.ok(types.includes('add'));
});

test('lineDiff — multi-hunk', () => {
  const a = 'a\nb\nc\nd\ne\nf\ng';
  const b = 'A\nb\nc\nd\ne\nf\nG';
  const diff = lineDiff(a, b);
  const dels = diff.filter(d => d.type === 'del');
  const adds = diff.filter(d => d.type === 'add');
  assert.equal(dels.length, 2); // 'a' and 'g'
  assert.equal(adds.length, 2); // 'A' and 'G'
});

test('render — no changes returns sentinel', () => {
  const diff = lineDiff('same', 'same');
  assert.equal(render(diff), '(no changes)');
});

test('render — returns non-empty string for changes', () => {
  const diff = lineDiff('old', 'new');
  const out = render(diff);
  assert.ok(typeof out === 'string' && out.length > 0);
});
