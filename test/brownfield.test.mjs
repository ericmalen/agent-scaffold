import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { resolveTarget, findPreexistingUnmanaged } from '../lib/brownfield.mjs';

function tmp() {
  return mkdtempSync(join(tmpdir(), 'scaffold-bf-'));
}

// resolveTarget matrix: {greenfield, brownfield} x {target-exists, target-missing}

test('resolveTarget — greenfield always returns srcRel unchanged', () => {
  const dir = tmp();
  writeFileSync(join(dir, 'AGENTS.md'), '');
  assert.equal(resolveTarget('AGENTS.md', false, dir), 'AGENTS.md');
});

test('resolveTarget — brownfield + file exists => sidecar', () => {
  const dir = tmp();
  writeFileSync(join(dir, 'AGENTS.md'), 'existing');
  assert.equal(resolveTarget('AGENTS.md', true, dir), 'AGENTS.md.scaffold');
});

test('resolveTarget — brownfield + file missing => normal path', () => {
  const dir = tmp();
  assert.equal(resolveTarget('AGENTS.md', true, dir), 'AGENTS.md');
});

test('resolveTarget — brownfield + non-wiring file exists => sidecar', () => {
  const dir = tmp();
  mkdirSync(join(dir, '.claude', 'skills', 'git-conventions'), { recursive: true });
  writeFileSync(join(dir, '.claude', 'skills', 'git-conventions', 'SKILL.md'), '');
  const result = resolveTarget('.claude/skills/git-conventions/SKILL.md', true, dir);
  assert.equal(result, '.claude/skills/git-conventions/SKILL.md.scaffold');
});

test('findPreexistingUnmanaged — finds files not in shippedTargets', () => {
  const dir = tmp();
  mkdirSync(join(dir, '.claude', 'agents'), { recursive: true });
  writeFileSync(join(dir, '.claude', 'agents', 'my-agent.md'), '');
  const knownPaths = new Set(['.claude/agents/README.md']);
  const result = findPreexistingUnmanaged(dir, knownPaths);
  assert.ok(result.includes('.claude/agents/my-agent.md'));
});

test('findPreexistingUnmanaged — excludes known shipped paths', () => {
  const dir = tmp();
  mkdirSync(join(dir, '.claude', 'agents'), { recursive: true });
  writeFileSync(join(dir, '.claude', 'agents', 'README.md'), '');
  const knownPaths = new Set(['.claude/agents/README.md']);
  const result = findPreexistingUnmanaged(dir, knownPaths);
  assert.ok(!result.includes('.claude/agents/README.md'));
});

test('findPreexistingUnmanaged — empty when no managed dirs exist', () => {
  const dir = tmp();
  const result = findPreexistingUnmanaged(dir, new Set());
  assert.deepEqual(result, []);
});
