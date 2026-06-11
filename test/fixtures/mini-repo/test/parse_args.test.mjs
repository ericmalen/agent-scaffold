import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parse_args } from '../src/parse_args.mjs';
import { word_count } from '../src/word_count.mjs';

test('parse_args reads --top and positional files', () => {
  assert.deepEqual(parse_args(['--top', '5', 'a.txt', 'b.txt']),
    { top: 5, files: ['a.txt', 'b.txt'] });
});

test('word_count tallies case-insensitively', () => {
  assert.deepEqual([...word_count('Tag tag TAG asset').entries()],
    [['tag', 3], ['asset', 1]]);
});
