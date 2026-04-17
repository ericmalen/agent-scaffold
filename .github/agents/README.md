# Custom Agents

## Purpose

Specialized personas invoked deliberately — for a specific role, with a defined
procedure and an explicit tool boundary.

## When to create an agent

Create one when:

- A role should have **restricted tools** (e.g., a reviewer that can read but
  not edit).
- A workflow benefits from **explicit procedures** the agent must follow.
- A task is **repeated often enough** that you want a consistent persona rather
  than re-prompting each time.

## Anatomy

An agent file has frontmatter (`name`, `description`, `tools`, optional
`model` and `hooks`) and a Markdown body with these sections:

- **Role statement** — one line: what the agent does and what it never does.
- **Procedures** — numbered steps the agent follows.
- **Never** — explicit boundaries.
- **Documents** — paths the agent may consult.

See
[`copilot-customization-reference.md#level-3-custom-agents`](../../docs/copilot-customization-reference.md#level-3-custom-agents)
for full detail on the anatomy and the `tools` array.

## Lazy-load convention (project-specific)

The `## Documents` section **must use plain-text paths, not Markdown links**.

Plain text forces the agent to load docs on demand via the `read` tool.
Markdown links can trigger eager loading via the
`chat.includeReferencedInstructions` setting. Keep context lean — use plain
text.

## Flat orchestration

Copilot subagents cannot invoke other subagents. If you build an orchestrator,
it must call every specialist directly. See
[`docs/why-this-way.md`](../../docs/why-this-way.md) for the rationale.

## Good example

See [`_example.agent.md`](./_example.agent.md) for an annotated read-only
reviewer showing correct frontmatter, a tight tools array, and a lazy-load
`## Documents` section.

## Filename convention

`{name}.agent.md` — e.g., `code-reviewer.agent.md`, `release-agent.agent.md`.
