#!/usr/bin/env node
// build-starter — emit a clean greenfield starter repo (the target state,
// nothing else). Used by kit CI to publish the "clone and go" starter, and
// runnable directly. Usage: node scripts/build-starter.mjs <dir> [--git]

import { resolve, dirname, join } from 'node:path';
import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const kitRoot = resolve(dirname(new URL(import.meta.url).pathname), '..');
const SLOT_RE = /^[ \t]*<!--\s*ai-kit:slot:([a-z0-9-]+)\s*-->[ \t]*\r?\n?/gm;

const [dir, ...flags] = process.argv.slice(2);
if (!dir) {
  console.error('usage: node scripts/build-starter.mjs <dir> [--git]');
  process.exit(1);
}
const target = resolve(dir);
if (existsSync(target) && readdirSync(target).length > 0) {
  console.error(`refusing to write into non-empty directory: ${target}`);
  process.exit(1);
}

const tpl = (rel) => readFileSync(join(kitRoot, 'templates', rel), 'utf8');
const instantiate = (rel) => tpl(rel).replace(SLOT_RE, '');
// ai-kit-check is a permanent baseline skill — its source of truth is .claude/skills/,
// not templates/ (it ships verbatim, like docs/git-conventions).
const skill = (rel) => readFileSync(join(kitRoot, '.claude/skills', rel), 'utf8');

const kitSha = spawnSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: kitRoot, encoding: 'utf8' })
  .stdout?.trim() || 'unknown';

const files = {
  'AGENTS.md': instantiate('AGENTS.md'),
  'CLAUDE.md': tpl('CLAUDE.md'),
  '.gitignore': tpl('gitignore'),
  '.claude/settings.json': tpl('claude-settings.json'),
  '.vscode/settings.json': tpl('vscode-settings.json'),
  '.claude/skills/README.md': tpl('skills-README.md'),
  '.claude/skills/ai-kit-check/SKILL.md': skill('ai-kit-check/SKILL.md'),
  '.claude/skills/ai-kit-check/references/rubric.md': skill('ai-kit-check/references/rubric.md'),
  '.claude/ai-kit.json': JSON.stringify({
    kit: kitSha,
    kitRepo: 'https://dev.azure.com/ericmalen/ai-kit/_git/ai-kit',
    adoptedAt: new Date().toISOString().slice(0, 10),
    githubCodeReview: false,
  }, null, 2) + '\n',
  'README.md': `# New Project

Started from the ai-kit starter — this repo is pre-wired for AI-assisted
coding with Claude Code and VS Code Copilot.

Next steps: fill in AGENTS.md (keep it under two pages), then delete this
section. If your team uses GitHub.com Copilot code review, set
\`githubCodeReview: true\` in \`.claude/ai-kit.json\` and add a short
\`.github/copilot-instructions.md\` pointing at AGENTS.md.
Run the \`ai-kit-check\` skill any time to verify conventions.
`,
};

for (const [rel, content] of Object.entries(files)) {
  const abs = join(target, rel);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, content);
}

if (flags.includes('--git')) {
  const g = (args) => spawnSync('git', args, { cwd: target, encoding: 'utf8' });
  g(['init', '-q', '-b', 'main']);
  g(['add', '-A']);
  g(['-c', 'user.email=starter@ai-kit', '-c', 'user.name=ai-kit', 'commit', '-qm', `chore: ai-kit starter (${kitSha})`]);
}
console.log(`starter → ${target} (kit ${kitSha})`);
