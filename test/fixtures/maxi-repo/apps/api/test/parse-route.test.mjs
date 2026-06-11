import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseRoute } from '../src/parse-route.mjs';

test('parseRoute splits literals and params', () => {
  assert.deepEqual(parseRoute('/assets/:id/tags'), [
    { literal: 'assets' }, { param: 'id' }, { literal: 'tags' },
  ]);
});
