# Optimization guide

`ai-kit audit` scans your installed AI assets for convention violations and
reports findings by file and severity.

## What `ai-kit audit` reports

The audit checks:

**Root AGENTS.md** — over two pages, missing Do Not section, unfilled TODO
placeholders, directory-scoped rules that belong in a nested file.

**Root CLAUDE.md** — absent, or present but missing the `@AGENTS.md` import.

**Nested AGENTS.md** — too long, contains frontmatter, missing sibling
`CLAUDE.md`, sibling `CLAUDE.md` exists but lacks `@AGENTS.md`.

**Agents** — grants all tools (no `tools:` frontmatter; auto-suggests tool
list when Procedures section present), `## Documents` uses Markdown links
instead of plain paths, missing `## Never` or `## Procedures` sections,
missing role statement, weak description, non-kebab-case filename.

**Skills** — `name:` doesn't match folder, description over 1024 chars,
`SKILL.md` over ~200 lines, weak description, no "when" clause, relative
plain-text paths in body, bare sibling paths outside Markdown links, name
collides with VS Code built-in command.

**Prompts** (`.github/prompts/`) — prompt routes to agent but also sets
`model:` or `tools:`, missing description, weak description, non-kebab-case
filename, teaching material missing underscore prefix.

**`.claude/settings.json`** — absent, or missing the required `.env` deny
rules.

**`.vscode/settings.json`** — absent, or missing required Copilot integration
keys.

**`.gitignore`** — absent, or missing `settings.local.json` /
`ai-kit-audit-report.json` entries.

**Cross-file** — audit report on disk but not gitignored, asset folder missing
`README.md`, pending migration (redirects to `/migrate`), AGENTS.md content
duplicated in an installed skill, unregistered skills/agents (scaffold only).

See the full per-check details in
[`.claude/skills/optimize/references/check-catalog.md`](./.claude/skills/optimize/references/check-catalog.md).

## Running the audit

```bash
# Human-readable output (exits 1 on error-severity findings only)
ai-kit audit

# Machine-readable JSON
ai-kit audit --json

# Strict mode — escalates warnings and info, exits 1 on any finding
ai-kit audit --strict
```

Exit code 1 is only set for `error`-severity findings
(`skill-name-folder-mismatch`, `skill-description-too-long`) in normal mode.
Warnings and info are reported but do not fail the exit code, making the audit
safe to add to CI without blocking on style findings.

Use `--strict` in CI when you want to enforce the full standard including
warnings and info. Under `--strict`, checks like `vscode-ai-key-missing-or-wrong`
(normally info) are escalated to warnings and cause the exit code to be non-zero.

## CI integration

```bash
# Lightweight — only blocks on hard errors (broken skill name, over-long description)
ai-kit audit

# Enforcement — blocks on any unresolved finding after initial setup
ai-kit audit --strict
```

## Automated optimization (recommended)

You don't have to fix violations by hand. The `optimizer` agent ships with
every install and applies a batch of fixes on single approval.

Run `/optimize` (or invoke `@optimizer`) in Claude Code or Copilot. It runs
`ai-kit audit --json`, classifies every finding, presents one consolidated
batch plan, and applies every fixable item when you approve.

For findings that require human judgment (`manual` fix class) the agent
documents them in the plan but does not touch them — you handle those
yourself after the automated fixes are applied.

## Manual fixes

If you prefer to fix violations by hand, each finding's `id` maps to a
check entry in
[`check-catalog.md`](./.claude/skills/optimize/references/check-catalog.md)
that describes the canonical fix.

## Relationship to migration

Run `/migrate` before `/optimize`. The audit emits `pending-integration-present`
when `.claude/ai-kit.json` has unresolved sidecars; the optimizer stops and
redirects rather than operating on a partially-migrated repo.
