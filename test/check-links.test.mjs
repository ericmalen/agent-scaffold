import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { checkLinks } from '../.claude/skills/docs/scripts/check-links.mjs';

function makeRepo(files) {
  const dir = mkdtempSync(join(tmpdir(), 'aikit-links-'));
  for (const [rel, content] of Object.entries(files)) {
    const abs = join(dir, rel);
    mkdirSync(join(abs, '..'), { recursive: true });
    writeFileSync(abs, content);
  }
  return dir;
}

test('check-links: resolving links pass, broken relative link is reported', () => {
  const repo = makeRepo({
    'README.md': '[ok](docs/how-to/a.md) and [bad](docs/missing.md)\n',
    'docs/how-to/a.md': '[up](../../README.md) [ext](https://x.example) [anchor](#h)\n',
  });
  try {
    const f = checkLinks(repo);
    assert.equal(f.length, 1, JSON.stringify(f));
    assert.equal(f[0].file, 'README.md');
    assert.equal(f[0].target, 'docs/missing.md');
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('check-links: external URLs, anchors, and inline-code paths are skipped', () => {
  const repo = makeRepo({
    'README.md': 'code `[x](nope.md)` and [real](sub/r.md)\n',
    'sub/r.md': 'ok\n',
  });
  try {
    assert.deepEqual(checkLinks(repo), []);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});
