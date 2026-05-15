import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { hashFile, copyFile, walkFiles, exists } from '../lib/fsutil.mjs';

function tmp() {
  return mkdtempSync(join(tmpdir(), 'ai-kit-test-'));
}

test('hashFile — deterministic', () => {
  const dir = tmp();
  const f = join(dir, 'a.txt');
  writeFileSync(f, 'hello world');
  const h1 = hashFile(f);
  const h2 = hashFile(f);
  assert.equal(h1, h2);
  assert.match(h1, /^[0-9a-f]{64}$/);
});

test('hashFile — different content differs', () => {
  const dir = tmp();
  const f1 = join(dir, 'a.txt');
  const f2 = join(dir, 'b.txt');
  writeFileSync(f1, 'hello');
  writeFileSync(f2, 'world');
  assert.notEqual(hashFile(f1), hashFile(f2));
});

test('copyFile — creates parent dirs and copies', () => {
  const dir = tmp();
  const src = join(dir, 'src.txt');
  const dst = join(dir, 'nested', 'dir', 'dst.txt');
  writeFileSync(src, 'content');
  copyFile(src, dst);
  assert.equal(hashFile(src), hashFile(dst));
});

test('walkFiles — recurses into subdirectories', () => {
  const dir = tmp();
  mkdirSync(join(dir, 'sub'));
  writeFileSync(join(dir, 'a.txt'), '');
  writeFileSync(join(dir, 'sub', 'b.txt'), '');
  const files = [...walkFiles(dir)];
  assert.equal(files.length, 2);
});

test('exists — true for file, false for missing', () => {
  const dir = tmp();
  const f = join(dir, 'x.txt');
  assert.equal(exists(f), false);
  writeFileSync(f, '');
  assert.equal(exists(f), true);
});
