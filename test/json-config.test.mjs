import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { parseJsonc, readJsonConfig } from '../lib/json-config.mjs';

function tmpFile(contents) {
  const dir = mkdtempSync(join(tmpdir(), 'ai-kit-jsonc-'));
  const p = join(dir, 'cfg.json');
  writeFileSync(p, contents, 'utf8');
  return p;
}

// Regression: the previous comment-stripper used /\/\/[^\n]*/g, which also
// chopped `//` inside a quoted URL like "https://example.com". Bug 4a.
test('parseJsonc — preserves https:// URLs inside string values', () => {
  const text = '{\n  "$schema": "https://json.schemastore.org/claude-code-settings.json",\n  "ok": true\n}\n';
  const parsed = parseJsonc(text);
  assert.equal(parsed.$schema, 'https://json.schemastore.org/claude-code-settings.json');
  assert.equal(parsed.ok, true);
});

test('parseJsonc — strips line comments outside strings', () => {
  const text = '{\n  // a comment\n  "a": 1 // trailing\n}\n';
  assert.deepEqual(parseJsonc(text), { a: 1 });
});

test('parseJsonc — strips block comments outside strings', () => {
  const text = '{\n  /* block\n     spans\n     lines */ "a": 1\n}\n';
  assert.deepEqual(parseJsonc(text), { a: 1 });
});

test('parseJsonc — keeps // and /* */ inside strings intact', () => {
  const text = '{ "comment-looking": "// not a comment", "block": "/* also fine */" }';
  const parsed = parseJsonc(text);
  assert.equal(parsed['comment-looking'], '// not a comment');
  assert.equal(parsed['block'], '/* also fine */');
});

test('parseJsonc — handles escaped quotes inside strings without terminating early', () => {
  const text = '{ "with-quote": "say \\"hi\\" // not a comment" }';
  const parsed = parseJsonc(text);
  assert.equal(parsed['with-quote'], 'say "hi" // not a comment');
});

test('readJsonConfig — returns null on malformed JSON', () => {
  const p = tmpFile('{ "a": 1,, }');
  assert.equal(readJsonConfig(p), null);
});

test('readJsonConfig — parses real claude settings with $schema URL', () => {
  const p = tmpFile(JSON.stringify({
    $schema: 'https://json.schemastore.org/claude-code-settings.json',
    permissions: { deny: [], allow: ['Bash(git*)'] },
  }, null, 2));
  const parsed = readJsonConfig(p);
  assert.ok(parsed);
  assert.equal(parsed.$schema, 'https://json.schemastore.org/claude-code-settings.json');
});
