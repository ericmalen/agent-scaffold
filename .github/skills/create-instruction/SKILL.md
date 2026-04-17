---
name: create-instruction
description: "Walks the user through creating a new path-specific instruction file. Determines the applyTo glob, scopes content correctly, and avoids duplication with repo-wide instructions. Activate when the user wants to create a layer-specific or path-scoped instruction."
argument-hint: "[scope and purpose]"
user-invocable: true
disable-model-invocation: false
---

# Create Instruction

## Purpose

Scaffold a new path-scoped instruction file that conforms to this project's
conventions — narrow glob, scoped content, no duplication with repo-wide rules.

## Workflow

1. Ask the user:
   1. **What paths do the instructions apply to?** (directory, layer, or file
      pattern).
   2. **What's the convention?** (what should Copilot do differently in these
      paths).
2. Construct the `applyTo` glob. Keep it as narrow as possible. Use
   comma-separated globs if multiple paths share the same rules
   (`"src/api/**,src/server/**"`).
3. **Check for duplication.** If the rule applies to almost every file in the
   repo, it belongs in `.github/copilot-instructions.md`, not here. Ask the
   user to reconsider the scope before generating the file.
4. Generate the file using
   [`./templates/instruction-template.md`](./templates/instruction-template.md).
5. Name the file `{scope}.instructions.md` (e.g., `api.instructions.md`,
   `migrations.instructions.md`).

## Conventions checklist

- [ ] `applyTo` is as narrow as possible.
- [ ] Content is scoped — no universal rules inside a path instruction.
- [ ] Cross-references to repo-wide instructions (or to
      `docs/conventions.md`) rather than duplicating their content.

## References

- [Path instructions reference](../../../docs/copilot-customization-reference.md#level-1-instructions-start-here)
