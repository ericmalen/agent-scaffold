# Conventions

The do-and-don't sheet for this scaffold. One page. Read once, then refer back.

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
- Nested `AGENTS.md` files have one scope — the subtree they sit in.

No "do everything" assets. If a file is doing two jobs, split it.

## Minimal always-on content

Keep `AGENTS.md` under two pages. It loads on every interaction — inflation
degrades quality for every task, not just the ones that need the content.

## Minimal tool lists

Agents only get the tools they need. Use Claude tool names (Copilot maps them):

- Read-only: `Read, Grep, Glob`
- Editor: add `Edit, Write`
- Executor: add `Bash`
- Orchestrator: also allow delegating to sub-agents

## Prompts that route to agents omit `model` and `tools` (Copilot-only)

When a Copilot prompt has `agent:` in frontmatter, the agent is the source of
truth for model and tools. Duplicating them is a code smell — drift is
inevitable. (Prompts are a Copilot-only surface — see `.github/prompts/README.md`.)

## File-naming conventions

| Asset type        | Pattern                      | Example                 |
| ----------------- | ---------------------------- | ----------------------- |
| Agents            | `{name}.md` in `.claude/agents/` | `code-reviewer.md`  |
| Skills            | `{kebab-case-name}/SKILL.md`  | `tdd-workflow/SKILL.md` |
| Prompts (Copilot) | `{command}.prompt.md`         | `review-file.prompt.md` |
| Examples / meta   | prefix with `_`               | `_example.prompt.md`    |

The underscore prefix sorts teaching material first in file listings and
visually separates it from real assets.

Directory-scoped conventions go in a nested `AGENTS.md` (plus a sibling
`CLAUDE.md` that imports it, for Claude Code) placed in that directory — no
special filename, no frontmatter. See
[`cross-tool-setup.md#nested-scoping`](./cross-tool-setup.md#nested-scoping).

## One README per asset folder, not per asset

`.claude/agents/`, `.claude/skills/`, and `.github/prompts/` each have a single
`README.md` that explains the pattern. Individual asset files stay lean.
