#!/usr/bin/env node
/**
 * End-to-end demo: brownfield init → status → (simulated migrate) → audit
 *
 * Creates a temp "consumer" repo with pre-existing AI config, runs ai-kit init,
 * shows the brownfield state, simulates what the migrate skill would do, then
 * runs audit to show convention findings.
 *
 * Run from anywhere inside the ai-kit clone:
 *   node scratch/e2e-demo.mjs
 *
 * No files are written outside the system temp directory.
 */

import { mkdtempSync, writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { init } from '../lib/install.mjs';
import { status } from '../lib/status.mjs';
import { audit } from '../lib/audit.mjs';
import { getScaffoldRoot } from '../lib/paths.mjs';

// ── Helpers ───────────────────────────────────────────────────────────────────

const BOLD  = '\x1b[1m';
const DIM   = '\x1b[2m';
const CYAN  = '\x1b[36m';
const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';

function section(title) {
  console.log(`\n${BOLD}${CYAN}${'═'.repeat(60)}${RESET}`);
  console.log(`${BOLD}${CYAN}  ${title}${RESET}`);
  console.log(`${BOLD}${CYAN}${'═'.repeat(60)}${RESET}\n`);
}

function note(msg) {
  console.log(`${DIM}  ▸ ${msg}${RESET}`);
}

// ── Build the "brownfield" consumer repo ──────────────────────────────────────

const consumerRoot = mkdtempSync(join(tmpdir(), 'ai-kit-e2e-'));
note(`Consumer repo: ${consumerRoot}`);

// Root AGENTS.md — large, root-only, has directory-scoped rules, no Do Not section
const rootAgentsMd = `# Project: acme-api

## Overview

The acme-api service handles all business logic for the acme platform.
It is a Node.js Express API backed by PostgreSQL.

## Tech Stack

- Node.js 20 (ESM)
- Express 4
- PostgreSQL 15 via pg
- Jest for testing

## General Rules

Always prefer async/await over callbacks.
Never use \`var\`; use \`const\` or \`let\`.
Keep functions under 40 lines.
Prefer early returns over deeply nested conditionals.
Add JSDoc to all exported functions.

## Backend (src/api/)

Always validate input at the controller level using Joi schemas.
Never expose raw SQL errors to the client — map to HTTP status codes.
Use the service layer for all business logic; controllers are thin.
Return JSON from every endpoint; never plain text.
Log at INFO level for request lifecycle; ERROR for unhandled exceptions.
Use transactions for any multi-step DB operation.
Never write raw SQL in controllers — use the DAL layer.
Always index foreign keys.

## Frontend (src/ui/)

Prefer server-rendered pages over client-side hydration where possible.
Always add loading states; never show an empty UI while data fetches.
Never ship console.log in production bundles.
Use CSS modules, not global styles.
Accessible markup is required: every interactive element needs an aria-label
or visible label. Use semantic HTML (button, not div with onclick).

## Testing

All new code requires tests before merging.
Unit tests live next to the file they test (\`*.test.js\`).
Integration tests live in \`test/integration/\`.
Minimum coverage 80% for branches and lines.
Never mock the database in integration tests — use a test DB.
Test failure messages must be descriptive enough to diagnose without a debugger.
Snapshot tests require a comment explaining what property is being tested.

## Deployment

Never merge to main without a passing CI run.
Migrations must be backward-compatible.
Feature flags go in \`config/flags.js\` — never hardcode.
Secrets come from env vars only; never hardcode credentials.

## Code Review

Reviewers: approve only when you'd be comfortable being on-call for this code.
Authors: PRs should be small (<400 lines diff). Split large changes.
Always squash-merge feature branches.
`.repeat(1); // ~130+ non-blank lines

mkdirSync(join(consumerRoot, '.github'), { recursive: true });
mkdirSync(join(consumerRoot, '.claude', 'agents'), { recursive: true });

// Existing AGENTS.md (real project content — brownfield)
writeFileSync(join(consumerRoot, 'AGENTS.md'), rootAgentsMd);

// Existing CLAUDE.md with project-specific Claude notes (not just @AGENTS.md)
writeFileSync(join(consumerRoot, 'CLAUDE.md'), `# Claude Notes for acme-api

Always think step-by-step before writing code.
Prefer editing existing files over creating new ones.
When refactoring, show the before/after diff first.

@AGENTS.md
`);

// Existing .github/copilot-instructions.md (will become a brownfield conflict)
writeFileSync(join(consumerRoot, '.github', 'copilot-instructions.md'), `# Copilot Instructions

Follow all rules in AGENTS.md.
When generating SQL, always use parameterized queries.
Never suggest \`eval\` or \`Function()\` usage.
`);

// Existing agent with no tools: field
writeFileSync(join(consumerRoot, '.claude', 'agents', 'code-reviewer.md'), `---
name: code-reviewer
description: Reviews pull requests.
---

# Code Reviewer

Reviews staged changes for bugs and security issues.

## Procedures

1. Run \`git diff --staged\` to get the diff.
2. Analyze for bugs, security issues, and logic errors.
3. Report findings grouped by severity.
`);

note('Brownfield repo created with: AGENTS.md (large, root-only), CLAUDE.md (has real content),');
note('.github/copilot-instructions.md, .claude/agents/code-reviewer.md (no tools:)');

// ── Phase 1: ai-kit init ──────────────────────────────────────────────────────

section('Phase 1: ai-kit init (brownfield detection)');
note('Running: ai-kit init --yes');
console.log();

const aiKitRoot = getScaffoldRoot(import.meta.url);
await init({ yes: true, force: false, skills: null, agents: null, _consumerRoot: consumerRoot }, aiKitRoot);

// ── Phase 2: ai-kit status ───────────────────────────────────────────────────

section('Phase 2: ai-kit status (brownfield state)');
note('Shows pending integrations and file drift after init');
console.log();

status({ _consumerRoot: consumerRoot }, aiKitRoot);

// ── Phase 3: Simulate migrate (what the migrate skill + migrator agent do) ───

section('Phase 3: Simulate migrate (normally done by /migrate + @migrator)');
note('The real migrate is an agent-driven workflow — too interactive to run here.');
note('Simulating: merge sidecars, clear pendingIntegration array.');
console.log();

const manifestPath = join(consumerRoot, '.claude', 'ai-kit.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

const pending = manifest.pendingIntegration ?? [];
if (pending.length === 0) {
  note('No pending integrations found — repo was greenfield.');
} else {
  note(`Found ${pending.length} pending integration(s):`);
  for (const p of pending) {
    note(`  ${p.managedPath}  ←  ${p.sidecarPath}`);
  }

  // For demo purposes: just clear pendingIntegration (the real migrator would
  // semantically merge each pair and then clear the array).
  manifest.pendingIntegration = [];
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  note('Cleared pendingIntegration (simulating a completed migrate).');
}

// ── Phase 4: ai-kit audit ────────────────────────────────────────────────────

section('Phase 4: ai-kit audit (convention lint)');
note('Now that migration is complete, audit checks convention conformance.');
note('Expect: agents-md-over-two-pages, missing Do Not section, agent-grants-all-tools, etc.');
console.log();

const report = await audit({ _consumerRoot: consumerRoot });

// ── Summary ──────────────────────────────────────────────────────────────────

section('Summary');
console.log(`  ${GREEN}${BOLD}Consumer root:${RESET}  ${consumerRoot}`);
console.log(`  ${BOLD}Files scanned:${RESET}  ${report.summary.filesScanned}`);
console.log(`  ${BOLD}Errors:${RESET}         ${report.summary.error}`);
console.log(`  ${BOLD}Warnings:${RESET}       ${report.summary.warning}`);
console.log(`  ${BOLD}Info:${RESET}           ${report.summary.info}`);
console.log();
console.log(`  ${DIM}Findings above are what /optimize would fix.${RESET}`);
console.log(`  ${DIM}Run /optimize in Claude Code or Copilot to apply fixes.${RESET}`);
console.log();
console.log(`  ${DIM}Temp dir will be cleaned up by the OS; or:${RESET}`);
console.log(`  ${DIM}rm -rf ${consumerRoot}${RESET}`);
console.log();
