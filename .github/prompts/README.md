# Prompts (Copilot-only)

## Status

Prompt files are a **GitHub Copilot–only** surface. Claude Code has no
equivalent — its `agent:` routing, `${input:…}` variables, and `.prompt.md`
format don't port.

**For a cross-tool `/command`, write a `user-invocable` skill instead** — both
Claude Code and Copilot expose those in the `/` menu. Run `/new-skill` to
scaffold one. This folder is kept only as an optional extra for teams that are
Copilot-only and want prompt-specific features (agent routing, editor-context
variables).

## Purpose

Saved entry-point commands. Typing `/name` in Copilot Chat runs the prompt with
the current editor context (active file, selection) and optional user input.

## Anatomy

Frontmatter fields:

- `description` — shown in the `/` menu.
- `agent` — routes to a specific agent (built-in or custom).
- `model` — lock to a specific model.
- `tools` — restrict tools for this prompt.

**Key rule:** when a prompt routes to an agent (has `agent:` set), **omit
`model` and `tools`**. The agent is the source of truth for those — duplicating
them is a code smell and will drift.

See
[`copilot-customization-reference.md#level-2-prompt-files`](../../docs/copilot-customization-reference.md#level-2-prompt-files)
for frontmatter details.

## Variables

Use `${input:name:placeholder}` to ask the user at invocation time.
File-context variables (`${file}`, `${fileBasename}`, `${fileDirname}`,
`${selection}`) pull from the active editor.

## Good example

See [`_example.prompt.md`](./_example.prompt.md) for an annotated prompt that
routes to the `example-reviewer` agent (in `.claude/agents/`) and uses both a
file-context variable and a user-input variable.

## Filename convention

`{command}.prompt.md` — e.g., `review-file.prompt.md`, `test-and-fix.prompt.md`.
