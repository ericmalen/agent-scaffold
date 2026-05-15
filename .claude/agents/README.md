# Custom Agents

Specialized personas invoked deliberately — for a specific role, with a defined
procedure and an explicit tool boundary.

This folder uses the **Claude sub-agent format** (`.claude/agents/{name}.md`).
Claude Code reads it natively; VS Code Copilot also detects `.md` files here and
maps Claude tool names to its own. One folder, both tools — see
[`docs/cross-tool-setup.md`](../../docs/cross-tool-setup.md).

## When to create an agent

Create one when:

- A role should have **restricted tools** (e.g., a reviewer that can read but
  not edit).
- A workflow benefits from **explicit procedures** the agent must follow.
- A task is **repeated often enough** that you want a consistent persona rather
  than re-prompting each time.

## Anatomy

An agent file has frontmatter and a Markdown body.

Frontmatter:

- `name` — agent identifier, kebab-case (defaults to the filename).
- `description` — what the agent does and what it never does; drives delegation.
- `tools` — comma-separated list, using Claude tool names (`Read, Grep, Glob,
  Bash, Edit, Write`). Copilot maps these to its own tools automatically. Omit
  to grant all tools.
- Optional: `model`, `permissionMode`, and other Claude-specific fields — these
  are ignored by Copilot, so they are safe to include.

Body sections:

- **Role statement** — one line: what the agent does and what it never does.
- **Procedures** — numbered steps the agent follows.
- **Never** — explicit boundaries.
- **Documents** — paths the agent may consult.

## Lazy-load convention (project-specific)

The `## Documents` section **uses plain-text paths, not Markdown links**.

The agent reads them on demand via the Read tool, never up-front. This keeps
the agent's always-on context small. Plain-text paths also visually distinguish
agent `## Documents` sections from skill bodies (which intentionally use
Markdown links for progressive disclosure).

## Flat orchestration (preferred default)

ai-kit prefers flat orchestration: orchestrators call every specialist
directly. Nesting (a sub-agent invoking sub-agents) is possible in both tools
but compounds token cost and is harder to debug — reach for it only when a
specialist genuinely needs its own helpers. See
[`docs/why-this-way.md`](../../docs/why-this-way.md) for the rationale.

## Good example

See [`example-reviewer.md`](./example-reviewer.md) for an annotated read-only
reviewer showing correct frontmatter, a tight tools list, and a lazy-load
`## Documents` section.

## Filename convention

`{name}.md` — e.g., `code-reviewer.md`, `release-agent.md`.
