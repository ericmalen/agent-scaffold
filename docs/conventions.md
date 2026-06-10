# Conventions

The do-and-don't sheet for ai-kit. One page. Read once, then refer back.

This repo is wired for both GitHub Copilot and Claude Code — see
[`cross-tool-setup.md`](./cross-tool-setup.md) for how one set of files serves
both. For the underlying Copilot features these conventions sit on top of, see
[`copilot-customization-reference.md`](./copilot-customization-reference.md).

## Lazy-load over eager-load

Context relevance beats context volume.

- **Agent `## Documents` sections use plain-text paths** — not Markdown links.
  The agent reads them on demand via the Read tool, never up-front. This
  keeps the agent's always-on context small.
- **Skill `SKILL.md` bodies link sibling files with Markdown links** — that is
  the intended path for progressive disclosure. The router (SKILL.md) stays
  lean; detail loads only when referenced.
- The two styles are deliberately different so the link form signals which
  loading model is at play, and aids visual scanning.

## Single source of truth

`docs/copilot-customization-reference.md` is authoritative for Copilot features,
frontmatter fields, settings, and behavior. READMEs and meta-skills **link** to
its sections rather than restating them.

## One responsibility per file

- Agents have one role.
- Skills have one workflow.
- Rules files have one scope — one `.claude/rules/<scope>.md` per concern (R-52).
- Nested `AGENTS.md` files (compat variant) have one scope — the subtree they
  sit in.

No "do everything" assets. If a file is doing two jobs, split it.

## Minimal always-on content

Keep `AGENTS.md` under two pages. It loads on every interaction — inflation
degrades quality for every task, not just the ones that need the content.

## Minimal tool lists

Agents only get the tools they need. Use Claude tool names (Copilot maps them):

- Read-only: `Read, Grep, Glob`
- Editor: add `Edit, Write`
- Executor: add `Bash`
- Orchestrator: also allow delegating to subagents (`Task` in Claude Code;
  Copilot maps it to `agent/runSubagent`)

## File-naming conventions

| Asset type | Pattern                          | Example                 |
| ---------- | -------------------------------- | ----------------------- |
| Agents     | `{name}.md` in `.claude/agents/` | `code-reviewer.md`      |
| Skills     | `{kebab-case-name}/SKILL.md`     | `tdd-workflow/SKILL.md` |
| Rules      | `{scope}.md` in `.claude/rules/` | `tests.md`              |

To add a new skill or agent to ai-kit and have the CLI distribute it,
see the "Adding skills" and "Adding agents" sections in
[`.claude/skills/README.md`](../.claude/skills/README.md) and
[`.claude/agents/README.md`](../.claude/agents/README.md).

Directory- or layer-scoped conventions go in a path-scoped rules file at
`.claude/rules/<scope>.md` with `paths:` glob frontmatter (R-52) — the default
mechanism. Repos that opted into the nested-AGENTS.md compat variant use a
nested `AGENTS.md` (plus a sibling `CLAUDE.md` shim) instead — one mechanism
per repo, never both (R-53). See
[`cross-tool-setup.md#path-scoped-instructions`](./cross-tool-setup.md#path-scoped-instructions).

## One README per asset folder, not per asset

`.claude/agents/`, `.claude/skills/`, and `.claude/rules/` (when present) each
have a single `README.md` that explains the pattern (R-48). Individual asset
files stay lean.

## Checking conformance

Run the `ai-kit-check` skill at any time to audit the repo's AI configuration
against these conventions (it runs `node <kit>/scripts/audit.mjs --root .` and
fixes findings by rule ID).
