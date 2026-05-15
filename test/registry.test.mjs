import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { loadRegistry } from '../lib/registry.mjs';

const aiKitRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

test('loadRegistry — loads the real ai-kit.config.json without errors', () => {
  const registry = loadRegistry(aiKitRoot);
  assert.ok(registry);
  assert.ok(registry.baseFiles().length > 0);
  assert.ok(registry.baseSkills().length > 0);
  assert.ok(typeof registry.manifestName === 'string');
  assert.ok(typeof registry.sourceRepo === 'string');
});

test('loadRegistry — all declared base files exist', () => {
  // loadRegistry throws if any file is missing; reaching here means they all exist
  loadRegistry(aiKitRoot);
  assert.ok(true);
});

test('loadRegistry — opt-in skills accessible', () => {
  const registry = loadRegistry(aiKitRoot);
  const skills = registry.optInSkills();
  assert.ok(Array.isArray(skills));
  assert.ok(skills.some(s => s.id === 'git-conventions'));
});

test('loadRegistry — isWiringFile identifies wiring files', () => {
  const registry = loadRegistry(aiKitRoot);
  assert.equal(registry.isWiringFile('AGENTS.md'), true);
  assert.equal(registry.isWiringFile('CLAUDE.md'), true);
  assert.equal(registry.isWiringFile('.claude/skills/README.md'), false);
});

test('loadRegistry — hasSkill / hasAgent', () => {
  const registry = loadRegistry(aiKitRoot);
  assert.equal(registry.hasSkill('git-conventions'), true);
  assert.equal(registry.hasSkill('does-not-exist'), false);
  assert.equal(registry.hasAgent('example-reviewer'), true);
  assert.equal(registry.hasAgent('nope'), false);
});

test('loadRegistry — throws on missing file in base.files', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ai-kit-reg-'));
  writeFileSync(join(dir, 'ai-kit.config.json'), JSON.stringify({
    schemaVersion: 1,
    manifestName: '.claude/ai-kit.json',
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
  const dir = mkdtempSync(join(tmpdir(), 'ai-kit-reg2-'));
  writeFileSync(join(dir, 'ai-kit.config.json'), JSON.stringify({ schemaVersion: 99 }));
  assert.throws(() => loadRegistry(dir), /schemaVersion/);
});

test('loadRegistry — baseAgents includes migrator', () => {
  const registry = loadRegistry(aiKitRoot);
  assert.ok(Array.isArray(registry.baseAgents()));
  assert.ok(registry.baseAgents().includes('migrator'));
});

test('loadRegistry — base agent resolves to an existing file via agents{}', () => {
  const registry = loadRegistry(aiKitRoot);
  const info = registry.getAgentInfo('migrator');
  assert.ok(info);
  assert.ok(typeof info.path === 'string' && info.path.length > 0);
});

test('loadRegistry — migrate is a base skill', () => {
  const registry = loadRegistry(aiKitRoot);
  assert.ok(registry.baseSkills().includes('migrate'));
});

test('loadRegistry — optInAgents excludes base agents', () => {
  const registry = loadRegistry(aiKitRoot);
  const ids = registry.optInAgents().map(a => a.id);
  assert.ok(!ids.includes('migrator'));
  assert.ok(ids.includes('example-reviewer'));
});

test('loadRegistry — throws on base agent with no agents{} entry', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ai-kit-reg3-'));
  writeFileSync(join(dir, 'ai-kit.config.json'), JSON.stringify({
    schemaVersion: 1,
    manifestName: '.claude/ai-kit.json',
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

test('loadRegistry — opt-in skill at nested path resolves', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ai-kit-reg-nested-'));
  mkdirSync(join(dir, '.claude', 'skills', 'terraform', 'refactor-module'), { recursive: true });
  writeFileSync(join(dir, '.claude', 'skills', 'terraform', 'refactor-module', 'SKILL.md'), '---\nname: refactor-module\ndescription: x\n---\n');
  writeFileSync(join(dir, 'ai-kit.config.json'), JSON.stringify({
    schemaVersion: 1,
    manifestName: '.claude/ai-kit.json',
    source: { repo: 'x' },
    base: { files: [], skills: [] },
    skills: {
      'refactor-module': {
        path: '.claude/skills/terraform/refactor-module',
        description: 'nested skill',
      },
    },
    agents: {},
    wiringFiles: [],
    brownfieldScanPaths: [],
    vscodeAiKeys: [],
  }));
  const registry = loadRegistry(dir);
  const skills = registry.optInSkills();
  assert.equal(skills.length, 1);
  assert.equal(skills[0].id, 'refactor-module');
  assert.equal(skills[0].path, '.claude/skills/terraform/refactor-module');
  assert.equal(registry.hasSkill('refactor-module'), true);
});

test('loadRegistry — throws when nested opt-in skill path is missing on disk', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ai-kit-reg-nested-missing-'));
  writeFileSync(join(dir, 'ai-kit.config.json'), JSON.stringify({
    schemaVersion: 1,
    manifestName: '.claude/ai-kit.json',
    source: { repo: 'x' },
    base: { files: [], skills: [] },
    skills: {
      'ghost': { path: '.claude/skills/category/ghost', description: 'x' },
    },
    agents: {},
    wiringFiles: [],
    brownfieldScanPaths: [],
    vscodeAiKeys: [],
  }));
  assert.throws(() => loadRegistry(dir), /\.claude\/skills\/category\/ghost/);
});

test('loadRegistry — throws on base agent path not found', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ai-kit-reg4-'));
  writeFileSync(join(dir, 'ai-kit.config.json'), JSON.stringify({
    schemaVersion: 1,
    manifestName: '.claude/ai-kit.json',
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
