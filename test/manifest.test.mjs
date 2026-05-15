import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  buildManifest,
  writeManifest,
  readManifest,
  addFileEntry,
  addPendingIntegration,
} from '../lib/manifest.mjs';

function tmp() {
  return mkdtempSync(join(tmpdir(), 'ai-kit-manifest-'));
}

const MANIFEST_NAME = '.claude/ai-kit.json';

test('buildManifest — shape is correct', () => {
  const m = buildManifest({
    sourceRepo: 'https://example.com/repo',
    commit: 'abc1234def5678',
    mode: 'greenfield',
    installedBaseSkills: ['new-agent'],
    installedSkills: [],
    installedAgents: [],
  });
  assert.equal(m.schemaVersion, 1);
  assert.equal(m.mode, 'greenfield');
  assert.equal(m.source.repo, 'https://example.com/repo');
  assert.equal(m.source.commitShort, 'abc1234');
  assert.deepEqual(m.pendingIntegration, []);
  assert.deepEqual(m.preexistingUnmanaged, []);
});

test('writeManifest + readManifest — round-trip', () => {
  const dir = tmp();
  const m = buildManifest({
    sourceRepo: 'repo',
    commit: 'deadbeef',
    mode: 'brownfield',
    installedBaseSkills: ['new-skill'],
    installedSkills: ['git-conventions'],
    installedAgents: [],
  });
  addFileEntry(m, 'AGENTS.md', {
    sourceHash: 'aaaa',
    installedAs: 'AGENTS.md',
    role: 'wiring',
  });
  writeManifest(dir, m, MANIFEST_NAME);
  const loaded = readManifest(dir, MANIFEST_NAME);
  assert.equal(loaded.mode, 'brownfield');
  assert.equal(loaded.files['AGENTS.md'].sourceHash, 'aaaa');
  assert.equal(loaded.installed.skills[0], 'git-conventions');
});

test('readManifest — returns null when file missing', () => {
  const dir = tmp();
  assert.equal(readManifest(dir, MANIFEST_NAME), null);
});

test('readManifest — throws on future schemaVersion', () => {
  const dir = tmp();
  const m = buildManifest({ sourceRepo: 'r', commit: null, mode: 'greenfield',
    installedBaseSkills: [], installedSkills: [], installedAgents: [] });
  m.schemaVersion = 99;
  writeManifest(dir, m, MANIFEST_NAME);
  assert.throws(() => readManifest(dir, MANIFEST_NAME), /schemaVersion 99/);
});

test('addPendingIntegration — appends entry', () => {
  const m = buildManifest({ sourceRepo: 'r', commit: null, mode: 'brownfield',
    installedBaseSkills: [], installedSkills: [], installedAgents: [] });
  addPendingIntegration(m, { managedPath: 'CLAUDE.md', sidecarPath: 'CLAUDE.md.ai-kit', reason: 'test' });
  assert.equal(m.pendingIntegration.length, 1);
  assert.equal(m.pendingIntegration[0].managedPath, 'CLAUDE.md');
});
