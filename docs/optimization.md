# Optimization guide

`ai-kit audit` scans your installed AI assets for convention violations and
reports findings by file and severity.

## What `ai-kit audit` reports

The audit checks:

**Root AGENTS.md** — over two pages, missing Do Not section, unfilled TODO
placeholders, directory-scoped rules that belong in a nested file.

**Nested AGENTS.md** — too long, contains frontmatter, missing sibling
`CLAUDE.md`.

**Agents** — grants all tools (no `tools:` frontmatter), `## Documents` uses
Markdown links instead of plain paths, missing `## Never` or `## Procedures`
sections, missing role statement, weak description.

**Skills** — `name:` doesn't match folder, description over 1024 chars,
`SKILL.md` over ~200 lines, weak description, relative plain-text paths in body.

**Cross-file** — pending migration (redirects to `/migrate`), AGENTS.md
content duplicated in an installed skill.

See the full per-check details in
[`.claude/skills/optimize/references/check-catalog.md`](./.claude/skills/optimize/references/check-catalog.md).

## Running the audit

```bash
# Human-readable output (exits 1 on error-severity findings)
ai-kit audit

# Machine-readable JSON
ai-kit audit --json
```

Exit code 1 is only set for `error`-severity findings
(`skill-name-folder-mismatch`, `skill-description-too-long`). Warnings and
info are reported but do not fail the exit code, making the audit safe to add
to CI without blocking on style findings.

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
