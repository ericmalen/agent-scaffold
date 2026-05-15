import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, cpSync, readFileSync, writeFileSync, existsSync, rmSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

import { validateRouting } from '../lib/migrate/routing.mjs';
import { snapshot, verifyAll } from '../lib/migrate/premise.mjs';
import { applyDeltas } from '../lib/migrate/manifest-resolve.mjs';
import { stageUnit as stageMarkdownFold } from '../lib/migrate/dispositions/markdown-fold.mjs';
import { stageUnit as stageJsonMerge } from '../lib/migrate/dispositions/json-merge.mjs';
import { stageUnit as stageLeaveAsIs } from '../lib/migrate/dispositions/leave-as-is.mjs';
import { stageUnit as stageInstructions } from '../lib/migrate/dispositions/instructions-fold.mjs';
import { clear as clearStaging, write as writeStaging, STAGING_DIR } from '../lib/migrate/staging.mjs';
import { buildAndWrite, parsePlan, PLAN_FILE } from '../lib/migrate/plan.mjs';
import { applyMigration } from '../lib/migrate/apply-exec.mjs';
import { enumerate } from '../lib/migrate/work-units.mjs';
import { buildManifest, addFileEntry, addPendingIntegration, addPreexistingUnmanaged } from '../lib/manifest.mjs';
import { loadRegistry } from '../lib/registry.mjs';
import { getScaffoldRoot } from '../lib/paths.mjs';

const FIXTURE = join(fileURLToPath(import.meta.url), '../../test/fixtures/rr-api-mini');
const MANIFEST_NAME = '.claude/ai-kit.json';

function tmp() {
  return mkdtempSync(join(tmpdir(), 'ai-kit-migrate-'));
}

function copyFixture(dir = 'pre') {
  const dest = tmp();
  cpSync(join(FIXTURE, dir), dest, { recursive: true });
  return dest;
}

function readJson(p) {
  return JSON.parse(readFileSync(p, 'utf8'));
}

// ── routing.mjs ──────────────────────────────────────────────────────────────

test('validateRouting — accepts valid routing JSON', () => {
  const routing = readJson(join(FIXTURE, 'routing.json'));
  assert.doesNotThrow(() => validateRouting(routing));
});

test('validateRouting — rejects missing schemaVersion', () => {
  assert.throws(() => validateRouting({ workUnits: [] }), /schemaVersion/);
});

test('validateRouting — rejects unknown unit type', () => {
  assert.throws(() => validateRouting({
    schemaVersion: 1,
    workUnits: [{ id: 'x', type: 'unknown', manifestDelta: [], deletions: [] }],
  }), /Unknown unit type/);
});

test('validateRouting — rejects markdown-fold missing h2Routing', () => {
  assert.throws(() => validateRouting({
    schemaVersion: 1,
    workUnits: [{
      id: 'x', type: 'markdown-fold', target: 'AGENTS.md', manifestDelta: [], deletions: [],
      sources: [{ path: 'CLAUDE.md' }], // missing h2Routing
    }],
  }), /h2Routing/);
});

// ── premise.mjs ──────────────────────────────────────────────────────────────

test('snapshot — existing file', () => {
  const dir = tmp();
  writeFileSync(join(dir, 'foo.md'), 'line1\nline2\nline3\n');
  const snap = snapshot(join(dir, 'foo.md'));
  assert.equal(snap.exists, true);
  assert.equal(snap.lines, 3);
  assert.equal(snap.first, 'line1');
  assert.equal(snap.last, 'line3');
});

test('snapshot — absent file', () => {
  const snap = snapshot('/nonexistent/path/foo.md');
  assert.equal(snap.exists, false);
  assert.equal(snap.lines, 0);
});

test('verifyAll — ok when nothing drifted', () => {
  const dir = tmp();
  writeFileSync(join(dir, 'f.md'), 'a\nb\n');
  const snap = snapshot(join(dir, 'f.md'));
  const { ok, drifted } = verifyAll([snap]);
  assert.equal(ok, true);
  assert.equal(drifted.length, 0);
});

test('verifyAll — detects drift', () => {
  const dir = tmp();
  writeFileSync(join(dir, 'f.md'), 'a\nb\n');
  const snap = snapshot(join(dir, 'f.md'));
  writeFileSync(join(dir, 'f.md'), 'a\nb\nc\n');
  const { ok, drifted } = verifyAll([snap]);
  assert.equal(ok, false);
  assert.equal(drifted.length, 1);
});

// ── manifest-resolve.mjs ─────────────────────────────────────────────────────

test('applyDeltas — resolvePending removes entry, flips installedAs, drops sidecar', () => {
  const m = buildManifest({ sourceRepo: 'r', commit: null, mode: 'brownfield',
    installedBaseSkills: [], installedBaseAgents: [], installedSkills: [], installedAgents: [] });
  addFileEntry(m, 'CLAUDE.md', { sourceHash: 'abc', installedAs: 'CLAUDE.md.ai-kit', role: 'wiring', sidecar: true });
  addPendingIntegration(m, { managedPath: 'CLAUDE.md', sidecarPath: 'CLAUDE.md.ai-kit', reason: 'test' });

  applyDeltas(m, [{ kind: 'resolvePending', managedPath: 'CLAUDE.md' }]);

  assert.equal(m.pendingIntegration.length, 0);
  assert.equal(m.files['CLAUDE.md'].installedAs, 'CLAUDE.md');
  assert.equal(m.files['CLAUDE.md'].sidecar, undefined);
  assert.equal(m.files['CLAUDE.md'].sourceHash, 'abc');
});

test('applyDeltas — never touches sacred fields', () => {
  const m = buildManifest({ sourceRepo: 'http://example.com', commit: 'deadbeef', mode: 'brownfield',
    installedBaseSkills: [], installedBaseAgents: [], installedSkills: [], installedAgents: [] });
  addPendingIntegration(m, { managedPath: 'CLAUDE.md', sidecarPath: 'CLAUDE.md.ai-kit', reason: 'test' });

  const sacredBefore = JSON.stringify({ schemaVersion: m.schemaVersion, source: m.source, mode: m.mode, installed: m.installed });
  applyDeltas(m, [{ kind: 'resolvePending', managedPath: 'CLAUDE.md' }]);
  const sacredAfter = JSON.stringify({ schemaVersion: m.schemaVersion, source: m.source, mode: m.mode, installed: m.installed });

  assert.equal(sacredBefore, sacredAfter);
});

test('applyDeltas — resolveUnmanaged removes from preexistingUnmanaged', () => {
  const m = buildManifest({ sourceRepo: 'r', commit: null, mode: 'brownfield',
    installedBaseSkills: [], installedBaseAgents: [], installedSkills: [], installedAgents: [] });
  addPreexistingUnmanaged(m, '.claude/settings.local.json');

  applyDeltas(m, [{ kind: 'resolveUnmanaged', path: '.claude/settings.local.json' }]);

  assert.equal(m.preexistingUnmanaged.length, 0);
});

// ── markdown-fold disposition ────────────────────────────────────────────────

test('markdown-fold — routes H2s, demotes headings, preserves body', () => {
  const dir = copyFixture();
  const routing = readJson(join(FIXTURE, 'routing.json'));
  const unit = routing.workUnits.find(u => u.id === 'root-agents-md');

  const { stagingFiles, premiseSnapshots } = stageMarkdownFold(unit, dir);

  assert.ok(stagingFiles.length >= 1, 'should produce at least one staging file');
  const agentsMdFile = stagingFiles.find(f => f.relPath === 'AGENTS.md');
  assert.ok(agentsMdFile, 'should produce AGENTS.md staging file');

  const content = agentsMdFile.content;

  // Check canonical H2s present
  assert.ok(content.includes('## Overview'), 'has ## Overview');
  assert.ok(content.includes('## Architecture'), 'has ## Architecture');
  assert.ok(content.includes('## Conventions'), 'has ## Conventions');
  assert.ok(content.includes('## Do Not'), 'has ## Do Not');

  // Consumer body preserved verbatim
  assert.ok(content.includes('A REST API for managing widgets'), 'Overview body preserved');
  assert.ok(content.includes('dotnet run --project src/Api'), 'Common Commands body preserved');
  assert.ok(content.includes('Never call external APIs'), 'Critical Notes body preserved');

  // Heading demotion: ## Architecture sub-heading becomes ###
  assert.ok(content.includes('### Layers'), 'Architecture sub-heading demoted');

  // keepOriginalHeading=true for Common Commands → appears as ### Common Commands
  assert.ok(content.includes('### Common Commands'), 'keepOriginalHeading preserves as H3');

  // keepOriginalHeading=false for Project Overview → body only, no ### Project Overview
  assert.ok(!content.includes('### Project Overview'), 'Project Overview heading dropped');

  // Shim file produced
  const shimFile = stagingFiles.find(f => f.relPath === 'CLAUDE.md');
  assert.ok(shimFile, 'should produce CLAUDE.md shim staging file');
  assert.ok(shimFile.content.includes('@AGENTS.md'), 'CLAUDE.md shim contains @AGENTS.md');

  // Premise snapshots include source + target
  assert.ok(premiseSnapshots.some(s => s.file.endsWith('CLAUDE.md')), 'snapshots CLAUDE.md');
  assert.ok(premiseSnapshots.some(s => s.file.endsWith('AGENTS.md')), 'snapshots AGENTS.md');
});

test('markdown-fold — code blocks not split as H2', () => {
  const dir = tmp();
  // Create a CLAUDE.md with ## inside a fenced code block
  writeFileSync(join(dir, 'CLAUDE.md'), [
    '# My Project',
    '',
    '## Architecture',
    '',
    'Example:',
    '```yaml',
    '## this is not a heading',
    '  key: value',
    '```',
    '',
    'Real content here.',
  ].join('\n') + '\n');
  writeFileSync(join(dir, 'AGENTS.md'), [
    '# Project',
    '',
    '## Overview',
    '',
    '## Architecture',
    '',
    '## Conventions',
    '',
    '## Do Not',
    '',
    '## More Context',
    '',
  ].join('\n') + '\n');

  const unit = {
    type: 'markdown-fold',
    target: 'AGENTS.md',
    shimInstall: null,
    sources: [{
      path: 'CLAUDE.md',
      h2Routing: [{
        sourceHeading: '## Architecture',
        sourceLineRange: [3, 11],
        targetHeading: '## Architecture',
        demote: false,
        keepOriginalHeading: false,
      }],
    }],
  };

  const { stagingFiles } = stageMarkdownFold(unit, dir);
  const out = stagingFiles.find(f => f.relPath === 'AGENTS.md').content;

  // The ## inside the code block should NOT create a separate section
  assert.ok(out.includes('## this is not a heading'), 'code block content preserved verbatim');
  assert.ok(out.includes('Real content here'), 'body after code block preserved');
});

// ── json-merge disposition ───────────────────────────────────────────────────

test('json-merge — aikit-wins-on-conflict: consumer keys preserved, ai-kit overwrites on conflict', () => {
  const dir = copyFixture();
  const routing = readJson(join(FIXTURE, 'routing.json'));
  const unit = routing.workUnits.find(u => u.id === 'vscode-settings');

  const { stagingFiles } = stageJsonMerge(unit, dir);
  const merged = JSON.parse(stagingFiles[0].content);

  // Consumer-only key preserved
  assert.equal(merged['editor.formatOnSave'], true);
  assert.equal(merged['editor.tabSize'], 2);

  // ai-kit keys present
  assert.equal(merged['chat.tools.autoApprove'], false);
  assert.equal(merged['chat.agent.enabled'], true);
  assert.ok('github.copilot.enable' in merged);
});

test('json-merge — JSONC comments stripped before parse', () => {
  const dir = tmp();
  writeFileSync(join(dir, 'consumer.json'), '{"a": 1}\n');
  writeFileSync(join(dir, 'aikit.json'), '{\n  // a comment\n  "b": 2\n}\n');

  const unit = {
    type: 'json-merge',
    mergeStrategy: 'aikit-wins-on-conflict',
    target: 'consumer.json',
    sources: ['consumer.json', 'aikit.json'],
    deletions: ['aikit.json'],
    manifestDelta: [],
  };

  const { stagingFiles } = stageJsonMerge(unit, dir);
  const merged = JSON.parse(stagingFiles[0].content);
  assert.equal(merged.a, 1);
  assert.equal(merged.b, 2);
});

test('json-merge — deny-union-allow-keep-hooks-merge: deny is union', () => {
  const dir = tmp();
  writeFileSync(join(dir, 'consumer.json'), JSON.stringify({
    permissions: { deny: ['Bash(rm -rf *)'], allow: ['Bash(git*)'] },
  }) + '\n');
  writeFileSync(join(dir, 'aikit.json'), JSON.stringify({
    permissions: { deny: ['Read(.env)', 'Bash(rm -rf *)'] },
  }) + '\n');

  const unit = {
    type: 'json-merge',
    mergeStrategy: 'deny-union-allow-keep-hooks-merge',
    target: 'consumer.json',
    sources: ['consumer.json', 'aikit.json'],
    deletions: ['aikit.json'],
    manifestDelta: [],
  };

  const { stagingFiles } = stageJsonMerge(unit, dir);
  const merged = JSON.parse(stagingFiles[0].content);

  // Union: consumer first, ai-kit novel entries appended, no duplicates
  assert.deepEqual(merged.permissions.deny, ['Bash(rm -rf *)', 'Read(.env)']);
  // allow kept from consumer only
  assert.deepEqual(merged.permissions.allow, ['Bash(git*)']);
});

// ── instructions-fold ────────────────────────────────────────────────────────

test('instructions-fold — creates nested AGENTS.md and CLAUDE.md shim', () => {
  const dir = tmp();
  mkdirSync(join(dir, '.github/instructions'), { recursive: true });
  writeFileSync(join(dir, '.github/instructions/backend.instructions.md'), [
    '---',
    'applyTo: src/api/**',
    '---',
    '',
    '# Backend Instructions',
    '',
    'Use Result<T> for error propagation.',
  ].join('\n') + '\n');

  const unit = {
    type: 'instructions-fold',
    sources: ['.github/instructions/backend.instructions.md'],
    deletions: ['.github/instructions/backend.instructions.md'],
    manifestDelta: [],
  };

  const { stagingFiles } = stageInstructions(unit, dir);

  const agentsMd = stagingFiles.find(f => f.relPath === 'src/api/AGENTS.md');
  const claudeMd = stagingFiles.find(f => f.relPath === 'src/api/CLAUDE.md');

  assert.ok(agentsMd, 'nested AGENTS.md created at correct path');
  assert.ok(claudeMd, 'nested CLAUDE.md shim created');
  assert.ok(agentsMd.content.includes('Use Result<T>'), 'body content preserved');
  assert.equal(claudeMd.content, '@AGENTS.md\n');
});

// ── apply-exec: refuses sacred deletions ─────────────────────────────────────

test('apply-exec — refuses to delete .claude/settings.local.json', () => {
  const dir = tmp();
  // Write a plan that tries to delete the sacred file
  writeFileSync(join(dir, PLAN_FILE), [
    '# Migration plan',
    '',
    '## Summary',
    '',
    '## Moves',
    '',
    '## Premise snapshots',
    '',
    '## Manifest changes',
    '',
    '## Deletions',
    '',
    '- .claude/settings.local.json',
    '',
  ].join('\n'));

  const m = buildManifest({ sourceRepo: 'r', commit: null, mode: 'brownfield',
    installedBaseSkills: [], installedBaseAgents: [], installedSkills: [], installedAgents: [] });
  const aiKitRoot = getScaffoldRoot(import.meta.url);
  const registry = loadRegistry(aiKitRoot);

  assert.throws(
    () => applyMigration(dir, m, registry),
    /Refusing to delete sacred local file/,
  );
});

// ── End-to-end: stage + apply on rr-api-mini ────────────────────────────────

test('e2e — stage + apply on rr-api-mini fixture', async () => {
  const dir = copyFixture();
  const manifestPath = join(dir, MANIFEST_NAME);
  const routing = readJson(join(FIXTURE, 'routing.json'));

  // Write routing JSON to simulate agent output
  writeFileSync(
    join(dir, '.ai-kit-migration-routing.json'),
    JSON.stringify(routing, null, 2) + '\n',
  );

  const manifest = readJson(manifestPath);

  // Stage: read routing, build staging, write plan
  clearStaging(dir);
  const allStageResults = [];
  const allSnapshots = new Map();

  for (const unit of routing.workUnits) {
    let result;
    if (unit.type === 'markdown-fold') result = stageMarkdownFold(unit, dir);
    else if (unit.type === 'json-merge') result = stageJsonMerge(unit, dir);
    else result = stageLeaveAsIs(unit, dir);
    allStageResults.push({ unit, ...result });
    writeStaging(dir, result.stagingFiles);
    for (const s of result.premiseSnapshots) allSnapshots.set(s.file, s);
  }

  buildAndWrite(dir, {
    units: routing.workUnits,
    stageResults: allStageResults,
    premiseSnapshots: [...allSnapshots.values()],
  });

  assert.ok(existsSync(join(dir, PLAN_FILE)), 'plan file written');

  // Apply
  const aiKitRoot = getScaffoldRoot(import.meta.url);
  const registry = loadRegistry(aiKitRoot);
  const freshManifest = readJson(manifestPath);

  applyMigration(dir, freshManifest, registry);

  // Assertions
  assert.ok(!existsSync(join(dir, PLAN_FILE)), 'plan file cleaned up');
  assert.ok(!existsSync(join(dir, '.ai-kit-staging')), 'staging dir cleaned up');
  assert.ok(!existsSync(join(dir, 'CLAUDE.md.ai-kit')), 'sidecar deleted');
  assert.ok(!existsSync(join(dir, '.vscode/settings.json.ai-kit')), '.vscode sidecar deleted');

  // CLAUDE.md should be the shim
  const claudeMd = readFileSync(join(dir, 'CLAUDE.md'), 'utf8');
  assert.ok(claudeMd.includes('@AGENTS.md'), 'CLAUDE.md is the @AGENTS.md shim');

  // AGENTS.md should contain consumer content
  const agentsMd = readFileSync(join(dir, 'AGENTS.md'), 'utf8');
  assert.ok(agentsMd.includes('A REST API for managing widgets'), 'consumer content in AGENTS.md');
  assert.ok(agentsMd.includes('## Overview'), 'canonical sections present');
  assert.ok(agentsMd.includes('## Architecture'), 'canonical sections present');

  // .vscode/settings.json should have both consumer + ai-kit keys
  const vscode = readJson(join(dir, '.vscode/settings.json'));
  assert.equal(vscode['editor.formatOnSave'], true, 'consumer key preserved');
  assert.equal(vscode['chat.tools.autoApprove'], false, 'ai-kit key merged');

  // Manifest: pendingIntegration empty, installedAs flipped, sidecar gone
  const finalManifest = readJson(manifestPath);
  assert.equal(finalManifest.pendingIntegration.length, 0, 'pendingIntegration cleared');
  assert.equal(finalManifest.files['CLAUDE.md'].installedAs, 'CLAUDE.md', 'installedAs flipped');
  assert.equal(finalManifest.files['CLAUDE.md'].sidecar, undefined, 'sidecar field removed');
  assert.equal(finalManifest.files['.vscode/settings.json'].installedAs, '.vscode/settings.json');

  // Sacred file untouched
  assert.ok(existsSync(join(dir, '.claude/settings.local.json')), 'sacred local file untouched');
});

test('e2e — premise drift blocks apply', () => {
  const dir = copyFixture();
  const routing = readJson(join(FIXTURE, 'routing.json'));

  // Build staging
  clearStaging(dir);
  const allStageResults = [];
  const allSnapshots = new Map();

  for (const unit of routing.workUnits) {
    let result;
    if (unit.type === 'markdown-fold') result = stageMarkdownFold(unit, dir);
    else if (unit.type === 'json-merge') result = stageJsonMerge(unit, dir);
    else result = stageLeaveAsIs(unit, dir);
    allStageResults.push({ unit, ...result });
    writeStaging(dir, result.stagingFiles);
    for (const s of result.premiseSnapshots) allSnapshots.set(s.file, s);
  }

  buildAndWrite(dir, {
    units: routing.workUnits,
    stageResults: allStageResults,
    premiseSnapshots: [...allSnapshots.values()],
  });

  // Mutate CLAUDE.md after plan was written
  writeFileSync(join(dir, 'CLAUDE.md'), 'totally different content\n');

  const aiKitRoot = getScaffoldRoot(import.meta.url);
  const registry = loadRegistry(aiKitRoot);
  const manifest = readJson(join(dir, MANIFEST_NAME));

  assert.throws(
    () => applyMigration(dir, manifest, registry),
    /Premise drift/,
  );

  // No real files moved
  assert.ok(!existsSync(join(dir, 'CLAUDE.md.ai-kit')) === false, 'sidecar still present');
});

test('e2e — perf guard: stage + apply < 2s', () => {
  const dir = copyFixture();
  const routing = readJson(join(FIXTURE, 'routing.json'));
  const t0 = Date.now();

  clearStaging(dir);
  const allStageResults = [];
  const allSnapshots = new Map();

  for (const unit of routing.workUnits) {
    let result;
    if (unit.type === 'markdown-fold') result = stageMarkdownFold(unit, dir);
    else if (unit.type === 'json-merge') result = stageJsonMerge(unit, dir);
    else result = stageLeaveAsIs(unit, dir);
    allStageResults.push({ unit, ...result });
    writeStaging(dir, result.stagingFiles);
    for (const s of result.premiseSnapshots) allSnapshots.set(s.file, s);
  }

  buildAndWrite(dir, {
    units: routing.workUnits,
    stageResults: allStageResults,
    premiseSnapshots: [...allSnapshots.values()],
  });

  const aiKitRoot = getScaffoldRoot(import.meta.url);
  const registry = loadRegistry(aiKitRoot);
  const manifest = readJson(join(dir, MANIFEST_NAME));
  applyMigration(dir, manifest, registry);

  const elapsed = Date.now() - t0;
  assert.ok(elapsed < 2000, `stage + apply should complete in < 2s, took ${elapsed}ms`);
});
