import { test } from 'node:test';
import assert from 'node:assert/strict';
import { confirm, multiSelect, choice } from '../lib/prompt.mjs';

// In `node --test` stdin is not a TTY, so every prompt takes the
// non-interactive fallback path. These assertions lock that behavior in —
// the --yes / CI paths depend on it.

test('confirm — non-TTY returns the default', async () => {
  assert.equal(await confirm('proceed?'), true);
  assert.equal(await confirm('proceed?', false), false);
});

test('multiSelect — non-TTY returns empty array', async () => {
  const result = await multiSelect('pick skills', [
    { id: 'git-conventions', description: 'x' },
  ]);
  assert.deepEqual(result, []);
});

test('multiSelect — empty choices returns empty array', async () => {
  assert.deepEqual(await multiSelect('pick', []), []);
});

test('choice — non-TTY returns the first option', async () => {
  assert.equal(await choice('resolve?', ['sidecar', 'keep', 'take-upstream']), 'sidecar');
});
