import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatDate } from '../src/format-date.mjs';

test('formatDate renders dd/mm/yyyy', () => {
  assert.equal(formatDate('2026-06-11T00:00:00Z'), '11/06/2026');
});
