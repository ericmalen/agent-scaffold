#!/usr/bin/env node
// audit-nudge — optional end-of-session conscience for adopted repos (CC/VS Code
// Stop hook). Mirrors the docs-nudge pattern: no network, never blocks, exits 0
// ALWAYS. One line if the repo has drifted off the ai-kit target state; silent
// when clean or when no kit checkout is reachable.
//
// Opt-in wiring (.claude/settings.json — read by Claude Code AND VS Code):
//   "hooks": { "Stop": [ { "hooks": [ { "type": "command",
//     "command": "node .claude/skills/ai-kit-check/scripts/audit-nudge.mjs" } ] } ] }
//
// Kit lookup order (no clone — speed + offline): $AI_KIT_HOME,
// .claude/ai-kit-adoption (during adoption), ~/tools/ai-kit, then the repo
// itself (the kit is self-adopted). Absent kit → silent.

import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { homedir } from 'node:os';
import { spawnSync } from 'node:child_process';

function findAudit() {
  const candidates = [
    process.env.AI_KIT_HOME && join(process.env.AI_KIT_HOME, 'scripts', 'audit.mjs'),
    resolve('.claude/ai-kit-adoption/scripts/audit.mjs'),
    join(homedir(), 'tools', 'ai-kit', 'scripts', 'audit.mjs'),
    resolve('scripts/audit.mjs'),
  ].filter(Boolean);
  return candidates.find((p) => existsSync(p)) ?? null;
}

try {
  const auditPath = findAudit();
  if (!auditPath) process.exit(0); // kit absent — nothing to nudge against

  const res = spawnSync(process.execPath, [auditPath, '--root', '.', '--json'],
    { encoding: 'utf8', timeout: 10000 });
  if (!res.stdout) process.exit(0);

  let report;
  try { report = JSON.parse(res.stdout); } catch { process.exit(0); }
  const s = report.summary ?? {};
  const errs = s.error ?? 0;
  const warns = s.warning ?? 0;
  if (errs + warns > 0) {
    const parts = [];
    if (errs) parts.push(`${errs} error${errs === 1 ? '' : 's'}`);
    if (warns) parts.push(`${warns} warning${warns === 1 ? '' : 's'}`);
    process.stdout.write(
      `[ai-kit] AI-config audit found ${parts.join(' and ')}. `
      + `Run the ai-kit-check skill to review and fix (rule IDs in spec/rules.md).\n`);
  }
  process.exit(0);
} catch {
  process.exit(0); // a nudge must never break a session
}
