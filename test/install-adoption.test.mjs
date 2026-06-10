// install-adoption tests: the permanent baseline skills (notably ai-kit-check)
// ship verbatim from the kit's .claude/skills/, not via the manifest.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';

const KIT = process.cwd();

function makeGitRepo() {
  const dir = mkdtempSync(join(tmpdir(), 'aikit-install-'));
  const g = (args) => {
    const r = spawnSync('git', args, { cwd: dir, encoding: 'utf8' });
    assert.equal(r.status, 0, `git ${args.join(' ')}: ${r.stderr}`);
  };
  g(['init', '-q']);
  return dir;
}

test('install-adoption ships ai-kit-check verbatim from .claude/skills', () => {
  const target = makeGitRepo();
  try {
    const r = spawnSync(process.execPath,
      [join(KIT, 'scripts/install-adoption.mjs'), target], { encoding: 'utf8' });
    assert.equal(r.status, 0, `install-adoption failed: ${r.stderr}`);

    const skill = '.claude/skills/ai-kit-check/SKILL.md';
    const rubric = '.claude/skills/ai-kit-check/references/rubric.md';
    assert.ok(existsSync(join(target, skill)), 'SKILL.md installed');
    assert.ok(existsSync(join(target, rubric)), 'rubric.md installed');

    // byte-identical to the source of truth under the kit's .claude/skills
    assert.equal(readFileSync(join(target, skill), 'utf8'),
      readFileSync(join(KIT, skill), 'utf8'), 'SKILL.md matches kit source');
    assert.equal(readFileSync(join(target, rubric), 'utf8'),
      readFileSync(join(KIT, rubric), 'utf8'), 'rubric.md matches kit source');
  } finally {
    rmSync(target, { recursive: true, force: true });
  }
});
