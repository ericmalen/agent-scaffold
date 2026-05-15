import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { resolveTarget, findPreexistingUnmanaged } from '../lib/brownfield.mjs';

function tmp() {
  return mkdtempSync(join(tmpdir(), 'ai-kit-bf-'));
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
  assert.equal(resolveTarget('AGENTS.md', true, dir), 'AGENTS.md.ai-kit');
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
  assert.equal(result, '.claude/skills/git-conventions/SKILL.md.ai-kit');
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

test('findPreexistingUnmanaged — scopes .github/.vscode to AI surfaces only', () => {
  const dir = tmp();
  // Non-AI files in shared dirs — must NOT be flagged.
  mkdirSync(join(dir, '.github', 'workflows'), { recursive: true });
  writeFileSync(join(dir, '.github', 'workflows', 'deploy.yml'), '');
  mkdirSync(join(dir, '.vscode'), { recursive: true });
  writeFileSync(join(dir, '.vscode', 'launch.json'), '');
  writeFileSync(join(dir, '.vscode', 'tasks.json'), '');
  // docs/ is general-purpose — not scanned at all.
  mkdirSync(join(dir, 'docs'), { recursive: true });
  writeFileSync(join(dir, 'docs', 'architecture.md'), '');
  // Genuine AI surfaces — must be flagged.
  writeFileSync(join(dir, '.github', 'copilot-instructions.md'), '');
  writeFileSync(join(dir, '.vscode', 'settings.json'), '{}');
  mkdirSync(join(dir, '.claude'), { recursive: true });
  writeFileSync(join(dir, '.claude', 'settings.local.json'), '{}');
  const result = findPreexistingUnmanaged(dir, new Set());

  assert.ok(result.includes('.github/copilot-instructions.md'), 'flags copilot-instructions.md');
  assert.ok(result.includes('.vscode/settings.json'), 'flags unmanaged .vscode/settings.json');
  assert.ok(result.includes('.claude/settings.local.json'), 'flags .claude/settings.local.json');
  assert.ok(!result.includes('.github/workflows/deploy.yml'), 'does NOT flag CI workflows');
  assert.ok(!result.includes('.vscode/launch.json'), 'does NOT flag launch.json');
  assert.ok(!result.includes('.vscode/tasks.json'), 'does NOT flag tasks.json');
  assert.ok(!result.some((p) => p.startsWith('docs/')), 'does NOT scan docs/');
});

test('findPreexistingUnmanaged — scans .github/instructions and prompts subtrees', () => {
  const dir = tmp();
  mkdirSync(join(dir, '.github', 'instructions'), { recursive: true });
  writeFileSync(join(dir, '.github', 'instructions', 'api.instructions.md'), '');
  mkdirSync(join(dir, '.github', 'prompts'), { recursive: true });
  writeFileSync(join(dir, '.github', 'prompts', 'custom.prompt.md'), '');
  const result = findPreexistingUnmanaged(dir, new Set());
  assert.ok(result.includes('.github/instructions/api.instructions.md'));
  assert.ok(result.includes('.github/prompts/custom.prompt.md'));
});
