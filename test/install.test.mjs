import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const aiKitRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const cli = join(aiKitRoot, 'bin', 'ai-kit.mjs');

function tmp() {
  return mkdtempSync(join(tmpdir(), 'ai-kit-install-test-'));
}

function runInit(consumerDir, skillsArg) {
  const args = [cli, 'init', '--yes'];
  if (skillsArg) args.push('--skills', skillsArg);
  return spawnSync('node', args, {
    cwd: consumerDir,
    encoding: 'utf8',
  });
}

function readManifest(consumerDir) {
  const path = join(consumerDir, '.claude', 'ai-kit.json');
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf8'));
}

test('init --skills <category> expands to all skills in that category', () => {
  const dir = tmp();
  const result = runInit(dir, 'terraform');
  assert.equal(result.status, 0, `init failed: ${result.stderr}\n${result.stdout}`);
  const manifest = readManifest(dir);
  assert.ok(manifest, 'manifest written');
  const tfSkills = ['terraform-search-import', 'terraform-style-guide', 'terraform-test', 'refactor-module', 'terrashark'];
  for (const s of tfSkills) {
    assert.ok(manifest.installed.skills.includes(s), `Expected ${s} installed; got: ${manifest.installed.skills}`);
  }
});

test('init --skills mixes individual IDs and category names', () => {
  const dir = tmp();
  const result = runInit(dir, 'terraform,prompt-engineer');
  assert.equal(result.status, 0, `init failed: ${result.stderr}\n${result.stdout}`);
  const manifest = readManifest(dir);
  assert.ok(manifest.installed.skills.includes('terraform-test'));
  assert.ok(manifest.installed.skills.includes('prompt-engineer'));
});

test('init --skills with unknown token exits non-zero with helpful message', () => {
  const dir = tmp();
  const result = runInit(dir, 'definitely-not-a-real-skill-or-category');
  assert.notEqual(result.status, 0, 'should exit non-zero on unknown token');
  const combined = (result.stdout || '') + (result.stderr || '');
  assert.match(combined, /Unknown skill or category/);
  assert.match(combined, /Categories:/);
  assert.match(combined, /Skill IDs:/);
});

test('init --skills dedupes when category and individual id overlap', () => {
  const dir = tmp();
  // refactor-module is in the terraform category — listing both should not double-install
  const result = runInit(dir, 'terraform,refactor-module');
  assert.equal(result.status, 0);
  const manifest = readManifest(dir);
  const count = manifest.installed.skills.filter(s => s === 'refactor-module').length;
  assert.equal(count, 1, 'refactor-module should appear exactly once');
});
