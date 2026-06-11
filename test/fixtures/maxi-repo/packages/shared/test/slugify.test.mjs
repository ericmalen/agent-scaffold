import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slugify } from '../src/slugify.mjs';

test('slugify lowercases and strips punctuation', () => {
  assert.equal(slugify('Bilingual Toggle!'), 'bilingual-toggle');
});
