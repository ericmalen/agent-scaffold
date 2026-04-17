# Prompts

## Purpose

Saved entry-point commands. Typing `/name` in chat runs the prompt with the
current editor context (active file, selection) and optional user input.

## When to create a prompt

Create one when:

- You describe a task the same way repeatedly.
- A task should route to a specific agent with minimal ceremony.
- You want a slash command as the friction-free entry point to a workflow.

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

See the
[full variable list](../../docs/copilot-customization-reference.md#level-2-prompt-files)
in the reference doc.

## Good example

See [`_example.prompt.md`](./_example.prompt.md) for an annotated prompt that
routes to the `example-reviewer` agent and uses both a file-context variable
and a user-input variable.

## Filename convention

`{command}.prompt.md` — e.g., `review-file.prompt.md`, `test-and-fix.prompt.md`.
