import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { loadRegistry } from '../lib/registry.mjs';

const scaffoldRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

test('loadRegistry — loads the real scaffold.config.json without errors', () => {
  const registry = loadRegistry(scaffoldRoot);
  assert.ok(registry);
  assert.ok(registry.baseFiles().length > 0);
  assert.ok(registry.baseSkills().length > 0);
  assert.ok(typeof registry.manifestName === 'string');
  assert.ok(typeof registry.sourceRepo === 'string');
});

test('loadRegistry — all declared base files exist', () => {
  // loadRegistry throws if any file is missing; reaching here means they all exist
  loadRegistry(scaffoldRoot);
  assert.ok(true);
});

test('loadRegistry — opt-in skills accessible', () => {
  const registry = loadRegistry(scaffoldRoot);
  const skills = registry.optInSkills();
  assert.ok(Array.isArray(skills));
  assert.ok(skills.some(s => s.id === 'git-conventions'));
});

test('loadRegistry — isWiringFile identifies wiring files', () => {
  const registry = loadRegistry(scaffoldRoot);
  assert.equal(registry.isWiringFile('AGENTS.md'), true);
  assert.equal(registry.isWiringFile('CLAUDE.md'), true);
  assert.equal(registry.isWiringFile('.claude/skills/README.md'), false);
});

test('loadRegistry — hasSkill / hasAgent', () => {
  const registry = loadRegistry(scaffoldRoot);
  assert.equal(registry.hasSkill('git-conventions'), true);
  assert.equal(registry.hasSkill('does-not-exist'), false);
  assert.equal(registry.hasAgent('example-reviewer'), true);
  assert.equal(registry.hasAgent('nope'), false);
});

test('loadRegistry — throws on missing file in base.files', () => {
  const dir = mkdtempSync(join(tmpdir(), 'scaffold-reg-'));
  writeFileSync(join(dir, 'scaffold.config.json'), JSON.stringify({
    schemaVersion: 1,
    manifestName: '.ai-scaffold.json',
    source: { repo: 'x' },
    base: { files: ['MISSING.md'], skills: [] },
    skills: {},
    agents: {},
    wiringFiles: [],
    brownfieldScanPaths: [],
    vscodeAiKeys: [],
  }));
  assert.throws(() => loadRegistry(dir), /MISSING\.md/);
});

test('loadRegistry — throws on unknown schemaVersion', () => {
  const dir = mkdtempSync(join(tmpdir(), 'scaffold-reg2-'));
  writeFileSync(join(dir, 'scaffold.config.json'), JSON.stringify({ schemaVersion: 99 }));
  assert.throws(() => loadRegistry(dir), /schemaVersion/);
});

test('loadRegistry — baseAgents includes scaffold-migrator', () => {
  const registry = loadRegistry(scaffoldRoot);
  assert.ok(Array.isArray(registry.baseAgents()));
  assert.ok(registry.baseAgents().includes('scaffold-migrator'));
});

test('loadRegistry — base agent resolves to an existing file via agents{}', () => {
  const registry = loadRegistry(scaffoldRoot);
  const info = registry.getAgentInfo('scaffold-migrator');
  assert.ok(info);
  assert.ok(typeof info.path === 'string' && info.path.length > 0);
});

test('loadRegistry — scaffold-migrate is a base skill', () => {
  const registry = loadRegistry(scaffoldRoot);
  assert.ok(registry.baseSkills().includes('scaffold-migrate'));
});

test('loadRegistry — optInAgents excludes base agents', () => {
  const registry = loadRegistry(scaffoldRoot);
  const ids = registry.optInAgents().map(a => a.id);
  assert.ok(!ids.includes('scaffold-migrator'));
  assert.ok(ids.includes('example-reviewer'));
});

test('loadRegistry — throws on base agent with no agents{} entry', () => {
  const dir = mkdtempSync(join(tmpdir(), 'scaffold-reg3-'));
  writeFileSync(join(dir, 'scaffold.config.json'), JSON.stringify({
    schemaVersion: 1,
    manifestName: '.ai-scaffold.json',
    source: { repo: 'x' },
    base: { files: [], skills: [], agents: ['ghost'] },
    skills: {},
    agents: {},
    wiringFiles: [],
    brownfieldScanPaths: [],
    vscodeAiKeys: [],
  }));
  assert.throws(() => loadRegistry(dir), /ghost/);
});

test('loadRegistry — throws on base agent path not found', () => {
  const dir = mkdtempSync(join(tmpdir(), 'scaffold-reg4-'));
  writeFileSync(join(dir, 'scaffold.config.json'), JSON.stringify({
    schemaVersion: 1,
    manifestName: '.ai-scaffold.json',
    source: { repo: 'x' },
    base: { files: [], skills: [], agents: ['ghost'] },
    skills: {},
    agents: { ghost: { path: 'MISSING-agent.md', description: 'x' } },
    wiringFiles: [],
    brownfieldScanPaths: [],
    vscodeAiKeys: [],
  }));
  assert.throws(() => loadRegistry(dir), /MISSING-agent\.md/);
});
