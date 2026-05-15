import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rewriteMarkdownRefs } from '../lib/migrate/rewrite-refs.mjs';

test('rewriteMarkdownRefs — relative sibling rewritten across move', () => {
  const out = rewriteMarkdownRefs(
    'See [helper](./helper.md).',
    '.cursor/rules/foo.md',
    'AGENTS.md',
  );
  assert.equal(out, 'See [helper](./.cursor/rules/helper.md).');
});

test('rewriteMarkdownRefs — sibling extracted into deeper file gets ../', () => {
  const out = rewriteMarkdownRefs(
    'Try [example](./examples/x.md) for context.',
    '.claude/skills/foo/SKILL.md',
    '.claude/skills/foo/references/topic.md',
  );
  assert.equal(out, 'Try [example](../examples/x.md) for context.');
});

test('rewriteMarkdownRefs — parent walk shortens when target is closer', () => {
  const out = rewriteMarkdownRefs(
    '[cfg](../config/foo.md)',
    'src/api/AGENTS.md',
    'AGENTS.md',
  );
  assert.equal(out, '[cfg](./src/config/foo.md)');
});

test('rewriteMarkdownRefs — leaves consumer-root absolute paths alone', () => {
  const input = 'See [docs](docs/migration.md) and [skill](.claude/skills/foo/SKILL.md).';
  const out = rewriteMarkdownRefs(input, 'src/api/AGENTS.md', 'AGENTS.md');
  assert.equal(out, input);
});

test('rewriteMarkdownRefs — leaves URLs and anchors alone', () => {
  const input = '[home](https://example.com) and [top](#intro) and [mail](mailto:x@y.z)';
  const out = rewriteMarkdownRefs(input, 'a/b.md', 'c/d.md');
  assert.equal(out, input);
});

test('rewriteMarkdownRefs — handles image links', () => {
  const out = rewriteMarkdownRefs(
    '![diagram](./img/diag.png)',
    'docs/spec.md',
    'README.md',
  );
  assert.equal(out, '![diagram](./docs/img/diag.png)');
});

test('rewriteMarkdownRefs — preserves title attribute', () => {
  const out = rewriteMarkdownRefs(
    '[x](./y.md "the y file")',
    'a/b.md',
    'c/d.md',
  );
  assert.equal(out, '[x](../a/y.md "the y file")');
});

test('rewriteMarkdownRefs — rewrites reference-style definitions', () => {
  const input = 'See [the helper][h].\n\n[h]: ./helper.md\n';
  const out = rewriteMarkdownRefs(input, 'sub/file.md', 'top.md');
  assert.equal(out, 'See [the helper][h].\n\n[h]: ./sub/helper.md\n');
});

test('rewriteMarkdownRefs — same source and target is no-op', () => {
  const input = 'See [x](./foo.md).';
  assert.equal(rewriteMarkdownRefs(input, 'a.md', 'a.md'), input);
});

test('rewriteMarkdownRefs — multiple links on one line', () => {
  const out = rewriteMarkdownRefs(
    '[a](./a.md) and [b](../b.md)',
    'sub/file.md',
    'top.md',
  );
  assert.equal(out, '[a](./sub/a.md) and [b](./b.md)');
});

test('rewriteMarkdownRefs — leaves filesystem-absolute paths alone', () => {
  const input = '[x](/etc/foo)';
  assert.equal(rewriteMarkdownRefs(input, 'a.md', 'b.md'), input);
});
