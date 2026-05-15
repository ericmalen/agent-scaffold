import { join } from 'node:path';
import { exists } from '../../fsutil.mjs';
import { readText, finding as _finding } from '../finding.mjs';

const f = (p) => _finding({ surface: 'gitignore', ...p });

const REQUIRED_ENTRIES = [
  '.claude/settings.local.json',
  '.claude/ai-kit-audit-report.json',
];

function parseEntries(text) {
  return new Set(text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#')));
}

export function checkGitignore(consumerRoot) {
  const absPath = join(consumerRoot, '.gitignore');
  const rel = '.gitignore';

  if (!exists(absPath)) {
    // Only flag if this is a git repo (has .git/)
    if (!exists(join(consumerRoot, '.git'))) return [];
    return [f({
      id: 'gitignore-missing',
      severity: 'info',
      file: rel,
      message: 'No .gitignore found.',
      detail: 'A .gitignore should ignore .claude/settings.local.json and .claude/ai-kit-audit-report.json.',
      fixable: 'deterministic',
    })];
  }

  const text = readText(absPath) ?? '';
  const entries = parseEntries(text);
  const missing = REQUIRED_ENTRIES.filter(e => !entries.has(e));

  return missing.map(entry => f({
    id: 'gitignore-missing-ai-kit-entries',
    severity: 'info',
    file: rel,
    message: `.gitignore is missing the entry "${entry}".`,
    detail: `This file should be gitignored to avoid accidentally committing ${entry.includes('local') ? 'personal settings' : 'auto-generated audit reports'}.`,
    fixable: 'deterministic',
    suggestedFix: `Add "${entry}" to .gitignore`,
  }));
}
