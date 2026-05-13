---
name: create-prompt
description: "Walks the user through creating a new prompt file — routing, variables, and frontmatter. Use whenever the user wants to create, scaffold, add, or save a slash-command, reusable prompt, saved chat, or 'thing I type the same way every time.' Also use when the user asks 'can we make a shortcut for this?' or wants to turn a repeated task into one command."
argument-hint: "[task the prompt performs]"
---

# Create Prompt

## Purpose

Scaffold a new prompt file that conforms to this project's conventions — no
duplication of agent-controlled fields, right variables for the task.

## Workflow

1. Ask the user:
   1. **What does the prompt do?** (one sentence — becomes the
      `description`).
   2. **Does it route to a specific agent?** If yes, which one?
2. Generate the file using
   [`./templates/prompt-template.md`](./templates/prompt-template.md).
3. If it routes to an agent → set `agent:` in frontmatter and **omit `model`
   and `tools`**. The agent is the source of truth for those — duplicating them
   creates drift the first time the agent's tools change.
4. If it does not route to an agent → leave `agent` off entirely. Include
   `model` or `tools` only if you need to override defaults.
5. Use `${input:name:placeholder}` for values the user should supply at
   invocation time.
6. Use file-context variables where they fit: `${file}`, `${fileBasename}`,
   `${fileDirname}`, `${selection}`.
7. **Read the generated file back to the user** and confirm the routing is
   right (or absent) before saving.
8. Tell the user how to invoke it: type `/` in chat and pick the new command,
   or type `/<command-name>` directly.

## Key rule

**When `agent:` is set, omit `model` and `tools`.** This is non-negotiable for
this scaffold. Duplicating fields the agent already defines is a code smell and
will drift out of sync the moment the agent's tools change.

## References

- [Prompt Files reference](../../../docs/copilot-customization-reference.md#level-2-prompt-files)
