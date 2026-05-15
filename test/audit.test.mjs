import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { audit } from '../lib/audit.mjs';

function tmp() {
  return mkdtempSync(join(tmpdir(), 'ai-kit-audit-test-'));
}

function writeManifest(dir, extra = {}) {
  mkdirSync(join(dir, '.claude'), { recursive: true });
  writeFileSync(join(dir, '.claude', 'ai-kit.json'), JSON.stringify({
    schemaVersion: 1,
    source: { repo: 'test', commit: 'abc1234', commitShort: 'abc1234', installedAt: '', updatedAt: '' },
    mode: 'full',
    installed: { baseSkills: [], baseAgents: [], skills: [], agents: [] },
    files: {},
    pendingIntegration: [],
    preexistingUnmanaged: [],
    ...extra,
  }));
}

test('audit — no manifest returns empty report', async () => {
  const dir = tmp();
  const report = await audit({ _consumerRoot: dir });
  assert.equal(report.findings.length, 0);
  assert.equal(report.summary.filesScanned, 0);
});

test('audit — clean repo returns no findings', async () => {
  const dir = tmp();
  writeManifest(dir);
  writeFileSync(join(dir, 'AGENTS.md'), '# Project\n\n## Overview\nShort.\n\n## Do Not\n- No secrets.\n');
  const report = await audit({ _consumerRoot: dir });
  assert.equal(report.summary.error, 0);
  assert.equal(report.summary.warning, 0);
});

test('audit — agents-md-over-two-pages triggered', async () => {
  const dir = tmp();
  writeManifest(dir);
  const longContent = '# Project\n\n## Do Not\n- No secrets.\n\n' +
    Array.from({ length: 130 }, (_, i) => `Rule ${i + 1}: do something specific.`).join('\n');
  writeFileSync(join(dir, 'AGENTS.md'), longContent);
  const report = await audit({ _consumerRoot: dir });
  const ids = report.findings.map(f => f.id);
  assert.ok(ids.includes('agents-md-over-two-pages'), `Expected agents-md-over-two-pages, got: ${ids}`);
});

test('audit — agents-md-missing-do-not-section triggered', async () => {
  const dir = tmp();
  writeManifest(dir);
  writeFileSync(join(dir, 'AGENTS.md'), '# Project\n\n## Overview\nShort content here.\n');
  const report = await audit({ _consumerRoot: dir });
  const ids = report.findings.map(f => f.id);
  assert.ok(ids.includes('agents-md-missing-do-not-section'), `Expected finding, got: ${ids}`);
});

test('audit — agents-md-unfilled-todo triggered', async () => {
  const dir = tmp();
  writeManifest(dir);
  writeFileSync(join(dir, 'AGENTS.md'), '# Project\n\n## Do Not\n- No.\n\n<!-- TODO: Fill this in -->');
  const report = await audit({ _consumerRoot: dir });
  const ids = report.findings.map(f => f.id);
  assert.ok(ids.includes('agents-md-unfilled-todo'), `Expected finding, got: ${ids}`);
});

test('audit — nested-agents-md-missing-sibling-claude triggered', async () => {
  const dir = tmp();
  writeManifest(dir);
  writeFileSync(join(dir, 'AGENTS.md'), '# Project\n\n## Do Not\n- No.\n');
  mkdirSync(join(dir, 'src'), { recursive: true });
  writeFileSync(join(dir, 'src', 'AGENTS.md'), '# Src rules\n');
  const report = await audit({ _consumerRoot: dir });
  const ids = report.findings.map(f => f.id);
  assert.ok(ids.includes('nested-agents-md-missing-sibling-claude'), `Expected finding, got: ${ids}`);
});

test('audit — nested-agents-md-missing-sibling-claude not triggered when CLAUDE.md present', async () => {
  const dir = tmp();
  writeManifest(dir);
  writeFileSync(join(dir, 'AGENTS.md'), '# Project\n\n## Do Not\n- No.\n');
  mkdirSync(join(dir, 'src'), { recursive: true });
  writeFileSync(join(dir, 'src', 'AGENTS.md'), '# Src rules\n');
  writeFileSync(join(dir, 'src', 'CLAUDE.md'), '@AGENTS.md\n');
  const report = await audit({ _consumerRoot: dir });
  const ids = report.findings.map(f => f.id);
  assert.ok(!ids.includes('nested-agents-md-missing-sibling-claude'), `Should not trigger, got: ${ids}`);
});

test('audit — agent-grants-all-tools triggered', async () => {
  const dir = tmp();
  writeManifest(dir);
  mkdirSync(join(dir, '.claude', 'agents'), { recursive: true });
  writeFileSync(join(dir, '.claude', 'agents', 'my-agent.md'),
    '---\nname: my-agent\ndescription: Does stuff when needed\n---\n# My Agent\nDoes things.\n## Procedures\n1. Do it.\n## Never\n- Never break.');
  const report = await audit({ _consumerRoot: dir });
  const ids = report.findings.map(f => f.id);
  assert.ok(ids.includes('agent-grants-all-tools'), `Expected finding, got: ${ids}`);
});

test('audit — agent-grants-all-tools not triggered when tools set', async () => {
  const dir = tmp();
  writeManifest(dir);
  mkdirSync(join(dir, '.claude', 'agents'), { recursive: true });
  writeFileSync(join(dir, '.claude', 'agents', 'my-agent.md'),
    '---\nname: my-agent\ndescription: Does stuff when the user asks about X\ntools: Read, Bash\n---\n# My Agent\nDoes things.\n## Procedures\n1. Do it.\n## Never\n- Never break.');
  const report = await audit({ _consumerRoot: dir });
  const ids = report.findings.map(f => f.id);
  assert.ok(!ids.includes('agent-grants-all-tools'), `Should not trigger, got: ${ids}`);
});

test('audit — skill-name-folder-mismatch is error severity', async () => {
  const dir = tmp();
  writeManifest(dir);
  mkdirSync(join(dir, '.claude', 'skills', 'my-skill'), { recursive: true });
  writeFileSync(join(dir, '.claude', 'skills', 'my-skill', 'SKILL.md'),
    '---\nname: wrong-name\ndescription: A skill that does things when you ask it\n---\n# My Skill\nContent.\n');
  const report = await audit({ _consumerRoot: dir });
  const errFindings = report.findings.filter(f => f.id === 'skill-name-folder-mismatch');
  assert.equal(errFindings.length, 1);
  assert.equal(errFindings[0].severity, 'error');
  assert.equal(report.summary.error, 1);
});

test('audit — skill-description-too-long is error severity', async () => {
  const dir = tmp();
  writeManifest(dir);
  mkdirSync(join(dir, '.claude', 'skills', 'my-skill'), { recursive: true });
  const longDesc = 'x'.repeat(1025);
  writeFileSync(join(dir, '.claude', 'skills', 'my-skill', 'SKILL.md'),
    `---\nname: my-skill\ndescription: "${longDesc}"\n---\n# My Skill\nContent.\n`);
  const report = await audit({ _consumerRoot: dir });
  const errFindings = report.findings.filter(f => f.id === 'skill-description-too-long');
  assert.equal(errFindings.length, 1);
  assert.equal(errFindings[0].severity, 'error');
});

test('audit — pending-integration-present emitted when manifest has entries', async () => {
  const dir = tmp();
  writeManifest(dir, { pendingIntegration: [{ managedPath: 'AGENTS.md', sidecarPath: 'AGENTS.md.ai-kit', reason: 'conflict' }] });
  const report = await audit({ _consumerRoot: dir });
  const ids = report.findings.map(f => f.id);
  assert.ok(ids.includes('pending-integration-present'), `Expected finding, got: ${ids}`);
  assert.equal(report.findings.find(f => f.id === 'pending-integration-present').severity, 'info');
});

test('audit — --json flag returns report object (no console output tested via return value)', async () => {
  const dir = tmp();
  writeManifest(dir);
  const report = await audit({ _consumerRoot: dir, json: true });
  assert.equal(typeof report, 'object');
  assert.ok('schemaVersion' in report);
  assert.ok('findings' in report);
  assert.ok('summary' in report);
});

test('audit — README.md in agents dir is skipped', async () => {
  const dir = tmp();
  writeManifest(dir);
  mkdirSync(join(dir, '.claude', 'agents'), { recursive: true });
  writeFileSync(join(dir, '.claude', 'agents', 'README.md'), '# Agents\n\nDocumentation.\n');
  const report = await audit({ _consumerRoot: dir, json: true });
  const agentFindings = report.findings.filter(f => f.file.includes('README.md'));
  assert.equal(agentFindings.length, 0);
});

// ── Item 4: skill-name-has-namespace-separator ────────────────────────────────

test('audit — skill-name-has-namespace-separator fires on colon separator', async () => {
  const dir = tmp();
  writeManifest(dir);
  mkdirSync(join(dir, '.claude', 'skills', 'code-review:code-review'), { recursive: true });
  writeFileSync(join(dir, '.claude', 'skills', 'code-review:code-review', 'SKILL.md'),
    '---\nname: code-review:code-review\ndescription: Reviews code when the user asks for a review\n---\n# Code Review\nContent.\n');
  const report = await audit({ _consumerRoot: dir });
  const ids = report.findings.map(f => f.id);
  assert.ok(ids.includes('skill-name-has-namespace-separator'), `Expected finding, got: ${ids}`);
  assert.equal(report.findings.find(f => f.id === 'skill-name-has-namespace-separator').severity, 'warning');
});

test('audit — skill-name-has-namespace-separator does not fire on plain kebab names', async () => {
  const dir = tmp();
  writeManifest(dir);
  mkdirSync(join(dir, '.claude', 'skills', 'new-skill'), { recursive: true });
  writeFileSync(join(dir, '.claude', 'skills', 'new-skill', 'SKILL.md'),
    '---\nname: new-skill\ndescription: Creates new skills when the user requests one\n---\n# New Skill\nContent.\n');
  const report = await audit({ _consumerRoot: dir });
  const ids = report.findings.map(f => f.id);
  assert.ok(!ids.includes('skill-name-has-namespace-separator'), `Should not fire, got: ${ids}`);
});

test('audit — skill-name-has-namespace-separator does not fire on scaffold-migrate style names', async () => {
  const dir = tmp();
  writeManifest(dir);
  mkdirSync(join(dir, '.claude', 'skills', 'scaffold-migrate'), { recursive: true });
  writeFileSync(join(dir, '.claude', 'skills', 'scaffold-migrate', 'SKILL.md'),
    '---\nname: scaffold-migrate\ndescription: Migrates scaffold files when invoked\n---\n# Scaffold Migrate\nContent.\n');
  const report = await audit({ _consumerRoot: dir });
  const ids = report.findings.map(f => f.id);
  assert.ok(!ids.includes('skill-name-has-namespace-separator'), `Should not fire, got: ${ids}`);
});

// ── Item 5: isAiKitOwnAsset exemption ────────────────────────────────────────

test('audit — skill-weak-description not fired for ai-kit-distributed skill', async () => {
  const dir = tmp();
  const skillRelPath = '.claude/skills/my-kit-skill/SKILL.md';
  writeManifest(dir, {
    files: {
      'src/my-kit-skill/SKILL.md': {
        sourceHash: 'abc',
        installedAs: skillRelPath,
        role: 'skill',
      },
    },
  });
  mkdirSync(join(dir, '.claude', 'skills', 'my-kit-skill'), { recursive: true });
  writeFileSync(join(dir, skillRelPath),
    '---\nname: my-kit-skill\ndescription: Short\n---\n# My Kit Skill\nContent.\n');
  const report = await audit({ _consumerRoot: dir });
  const ids = report.findings.map(f => f.id);
  assert.ok(!ids.includes('skill-weak-description'), `Should be exempt, got: ${ids}`);
});

test('audit — skill-weak-description fires for user-authored skill not in manifest', async () => {
  const dir = tmp();
  writeManifest(dir); // empty files map
  mkdirSync(join(dir, '.claude', 'skills', 'my-skill'), { recursive: true });
  writeFileSync(join(dir, '.claude', 'skills', 'my-skill', 'SKILL.md'),
    '---\nname: my-skill\ndescription: Short\n---\n# My Skill\nContent.\n');
  const report = await audit({ _consumerRoot: dir });
  const ids = report.findings.map(f => f.id);
  assert.ok(ids.includes('skill-weak-description'), `Expected finding, got: ${ids}`);
});

test('audit — agent-weak-description not fired for ai-kit-distributed agent', async () => {
  const dir = tmp();
  const agentRelPath = '.claude/agents/my-kit-agent.md';
  writeManifest(dir, {
    files: {
      '.claude/agents/my-kit-agent.md': {
        sourceHash: 'abc',
        installedAs: agentRelPath,
        role: 'agent',
      },
    },
  });
  mkdirSync(join(dir, '.claude', 'agents'), { recursive: true });
  writeFileSync(join(dir, agentRelPath),
    '---\nname: my-kit-agent\ndescription: Short desc\ntools: Read\n---\n# My Kit Agent\nDoes stuff.\n## Procedures\n1. Do it.\n## Never\n- Never break.\n');
  const report = await audit({ _consumerRoot: dir });
  const ids = report.findings.map(f => f.id);
  assert.ok(!ids.includes('agent-weak-description'), `Should be exempt, got: ${ids}`);
  assert.ok(!ids.includes('agent-description-missing-when'), `Should be exempt, got: ${ids}`);
});
