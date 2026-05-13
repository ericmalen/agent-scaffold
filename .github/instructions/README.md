# Path Instructions

## Purpose

Layer- and directory-scoped conventions. Instructions in this folder load
automatically when Copilot edits files whose paths match their `applyTo` glob.

## When to create a path instruction

Create one when:

- The rule applies only to a specific directory (e.g., `src/api/**`).
- A convention differs between layers (the API layer validates differently than
  the worker layer).
- You're seeing wrong suggestions in a specific folder and a universal rule
  would be too broad.

If the rule applies to almost every file in the repo, it belongs in
`AGENTS.md` instead.

## Anatomy

Each file has YAML frontmatter with an `applyTo` field (glob, or
comma-separated globs) and a Markdown body with the scoped conventions.

See
[`copilot-customization-reference.md#level-1-instructions-start-here`](../../docs/copilot-customization-reference.md#level-1-instructions-start-here)
for full detail on frontmatter and glob behavior.

## Good example

See [`_example.instructions.md`](./_example.instructions.md) for an annotated
file showing correct frontmatter, scoping, and boundaries.

## Filename convention

`{scope}.instructions.md` — e.g., `api.instructions.md`,
`frontend.instructions.md`, `migrations.instructions.md`.
