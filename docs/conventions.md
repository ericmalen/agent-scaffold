# Conventions

The do-and-don't sheet for this scaffold. One page. Read once, then refer back.

For the underlying Copilot features these conventions sit on top of, see
[`copilot-customization-reference.md`](./copilot-customization-reference.md).

## Lazy-load over eager-load

Context relevance beats context volume.

- **Agent `## Documents` sections use plain-text paths** — not Markdown links.
  The agent reads them on demand via the `read` tool, never up-front. This
  keeps the agent's always-on context small.
- **Skill `SKILL.md` bodies link sibling files with Markdown links** — that is
  the intended path for progressive disclosure. The router (SKILL.md) stays
  lean; detail loads only when referenced.
- The two styles are deliberately different so the link form signals which
  loading model is at play. (VS Code does not currently follow Markdown links
  inside `.agent.md` files automatically — the convention is defensive against
  possible future behavior and aids visual scanning.)

## Single source of truth

`docs/copilot-customization-reference.md` is authoritative for Copilot features,
frontmatter fields, settings, and behavior. READMEs and meta-skills **link** to
its sections rather than restating them.

## One responsibility per file

- Agents have one role.
- Skills have one workflow.
- Path instructions have one scope.

No "do everything" assets. If a file is doing two jobs, split it.

## Minimal always-on content

Keep `AGENTS.md` under two pages. It loads on every interaction — inflation
degrades quality for every task, not just the ones that need the content.

## Minimal tool arrays

Agents only get the tools they need.

- Read-only: `["read", "search"]`
- Editor: `["read", "search", "edit", "todo"]`
- Executor: add `"execute"` (or `"runCommands"`)
- Orchestrator: add `"agent"`

## Prompts that route to agents omit `model` and `tools`

When a prompt has `agent:` in frontmatter, the agent is the source of truth for
model and tools. Duplicating them is a code smell — drift is inevitable.

## File-naming conventions

| Asset type      | Pattern                        | Example                   |
| --------------- | ------------------------------ | ------------------------- |
| Instructions    | `{scope}.instructions.md`      | `api.instructions.md`     |
| Agents          | `{name}.agent.md`              | `code-reviewer.agent.md`  |
| Prompts         | `{command}.prompt.md`          | `review-file.prompt.md`   |
| Skills          | `{kebab-case-name}/SKILL.md`   | `tdd-workflow/SKILL.md`   |
| Examples / meta | prefix with `_`                | `_example.agent.md`       |

The underscore prefix sorts these first in file listings and visually separates
teaching material from real assets.

## One README per asset folder, not per asset

`instructions/`, `agents/`, `prompts/`, and `skills/` each have a single
`README.md` that explains the pattern. Individual asset files stay lean.
