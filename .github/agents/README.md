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

The `## Documents` section **uses plain-text paths, not Markdown links**.

The agent reads them on demand via the `read` tool, never up-front. This keeps
the agent's always-on context small. Plain-text paths also visually distinguish
agent `## Documents` sections from skill bodies (which intentionally use
Markdown links for progressive disclosure).

## Flat orchestration (preferred default)

The scaffold prefers flat orchestration: orchestrators call every specialist
directly. Nested subagents are enabled here
(`chat.subagents.allowInvocationsFromSubagents`) up to a depth cap of 5, with
no cycle detection and compounding token cost — reach for nesting only when
a specialist genuinely needs its own helpers. See
[`docs/why-this-way.md`](../../docs/why-this-way.md) for the rationale.

## Good example

See [`_example.agent.md`](./_example.agent.md) for an annotated read-only
reviewer showing correct frontmatter, a tight tools array, and a lazy-load
`## Documents` section.

## Filename convention

`{name}.agent.md` — e.g., `code-reviewer.agent.md`, `release-agent.agent.md`.
