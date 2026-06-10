import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { stripEmptyOptionalSections, instantiate } from '../scripts/lib/template.mjs';

const KIT_ROOT = new URL('..', import.meta.url).pathname;

const TPL = [
  '# Title',
  '',
  '<!-- ai-kit:slot:intro -->',
  '',
  '## Overview',
  '<!-- ai-kit:optional -->',
  '',
  '<!-- ai-kit:slot:overview -->',
  '',
  '## Do Not',
  '',
  '<!-- ai-kit:slot:do-not -->',
  '',
].join('\n');

test('empty optional section is removed; mandatory section stays', () => {
  const out = instantiate(TPL, () => undefined); // nothing filled
  assert.ok(!out.includes('## Overview'), 'empty optional Overview should be gone');
  assert.ok(out.includes('## Do Not'), 'mandatory Do Not stays even when empty (R-03)');
  assert.ok(!out.includes('ai-kit:optional'), 'optional markers are stripped');
  assert.ok(!out.includes('ai-kit:slot'), 'slot markers are stripped');
});

test('filled optional section is kept with its content and no markers', () => {
  const out = instantiate(TPL, (name) => (name === 'overview' ? 'Real overview text.' : undefined));
  assert.ok(out.includes('## Overview'), 'filled optional section stays');
  assert.ok(out.includes('Real overview text.'));
  assert.ok(!out.includes('ai-kit:optional'));
});

test('stripEmptyOptionalSections preserves byte content of kept sections', () => {
  const filled = new Set(['overview']);
  const pruned = stripEmptyOptionalSections(TPL, filled);
  assert.ok(pruned.includes('## Overview'));
  assert.ok(pruned.includes('## Do Not'));
  // intro/do-not are mandatory (no optional marker) → never removed
  assert.ok(pruned.includes('<!-- ai-kit:slot:intro -->'));
});

test('no optional markers → text is returned unchanged', () => {
  const plain = '# A\n\n## B\n\nbody\n';
  assert.equal(stripEmptyOptionalSections(plain, new Set()), plain);
});

test('greenfield AGENTS template drops Overview/Architecture/More Context, keeps Do Not', () => {
  const tpl = readFileSync(join(KIT_ROOT, 'templates', 'AGENTS.md'), 'utf8');
  const out = instantiate(tpl); // greenfield: nothing filled
  for (const gone of ['## Overview', '## Architecture', '## More Context']) {
    assert.ok(!out.includes(gone), `${gone} should be removed in greenfield`);
  }
  assert.ok(out.includes('## Do Not'), 'Do Not stays (R-03)');
  assert.ok(!out.includes('ai-kit:'), 'no leftover ai-kit markers');
});
