---
name: create-instruction
description: "Walks the user through creating a new path-specific instruction file — constructs the applyTo glob, scopes content correctly, avoids duplication with repo-wide instructions. Use whenever the user wants to create, scaffold, add, or set up a layer-specific, directory-scoped, or language-scoped convention file. Also use when the user says 'Copilot keeps suggesting the wrong thing in this folder' — a scoped instruction is usually the fix."
argument-hint: "[scope and purpose]"
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
3. **Check for duplication.** Ask: does this rule apply to almost every file in
   the repo? If yes, it belongs in `.github/copilot-instructions.md`, not here.
   Ask the user to reconsider the scope before generating the file.
4. **Check for bloat.** Path instructions load automatically for every file in
   the glob — long ones inflate context on every edit. If the content is more
   than ~50 lines of conventions, consider: (a) breaking out detailed
   procedures into a skill that loads on demand, or (b) keeping the instruction
   short and linking out to a fuller doc in `docs/`.
5. Generate the file using
   [`./templates/instruction-template.md`](./templates/instruction-template.md).
6. Name the file `{scope}.instructions.md` (e.g., `api.instructions.md`,
   `migrations.instructions.md`).
7. **Read the generated file back to the user** — especially the `applyTo`
   glob, since a too-broad glob is the usual way path instructions go wrong.
8. Tell the user how to confirm it loaded: edit any file in the glob, then open
   **Chat: Open Diagnostics** from the Command Palette to see whether the
   instruction appears in the loaded list.

## Conventions checklist

- [ ] `applyTo` is as narrow as possible.
- [ ] Content is scoped — no universal rules inside a path instruction.
- [ ] Body is short. Long procedures belong in a skill; long reference material
      belongs in `docs/`.
- [ ] Cross-references to repo-wide instructions (or to
      `docs/conventions.md`) rather than duplicating their content.

## References

- [Path instructions reference](../../../docs/copilot-customization-reference.md#level-1-instructions-start-here)
