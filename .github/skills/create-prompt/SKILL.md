---
name: create-prompt
description: "Walks the user through creating a new prompt file. Determines agent routing, input variables, and frontmatter. Activate when the user wants to create a new slash-command prompt or save a reusable task."
argument-hint: "[task the prompt performs]"
user-invocable: true
disable-model-invocation: false
---

# Create Prompt

## Purpose

Scaffold a new prompt file that conforms to this project's conventions — no
duplication of agent-controlled fields, right variables for the task.

## Workflow

1. Ask the user:
   1. **What does the prompt do?** (one sentence — becomes the
      `description`).
   2. **Does it route to a specific agent?**
2. If it routes to an agent → set `agent:` in frontmatter and **omit `model`
   and `tools`**. The agent controls those — duplicating them drifts.
3. If it does not route to an agent → include `tools` only if the prompt needs
   a restricted set. Otherwise omit it too.
4. Use `${input:name:placeholder}` for values the user should supply at
   invocation time.
5. Use file-context variables where they fit: `${file}`, `${fileBasename}`,
   `${fileDirname}`, `${selection}`.
6. Generate the file using
   [`./templates/prompt-template.md`](./templates/prompt-template.md).

## Key rule

**When `agent:` is set, omit `model` and `tools`.** This is non-negotiable for
this scaffold. Duplicating fields the agent already defines is a code smell and
will drift out of sync the moment the agent's tools change.

## References

- [Prompt Files reference](../../../docs/copilot-customization-reference.md#level-2-prompt-files)
