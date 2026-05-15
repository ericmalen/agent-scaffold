---
name: layer-agents
description: "Walks the user through scoping conventions to a subdirectory by creating a nested AGENTS.md. First checks whether the rule actually belongs in the root AGENTS.md, then scaffolds a nested AGENTS.md in the target directory with correctly scoped content. Use whenever the user wants to create, scaffold, add, or set up layer-specific, directory-scoped, or language-scoped conventions. Also use when the user says 'Copilot keeps suggesting the wrong thing in this folder' — a nested AGENTS.md is usually the fix."
argument-hint: "[subdirectory and purpose]"
---

# Create Nested AGENTS.md

## Purpose

Scaffold a nested `AGENTS.md` — the mechanism for scoping conventions to one
subdirectory. Copilot and other AGENTS.md-aware tools load a nested `AGENTS.md`
automatically whenever they work anywhere in that subtree, on top of the root
`AGENTS.md`.

Claude Code reads nested `CLAUDE.md`, not nested `AGENTS.md`, so this skill also
drops a sibling `CLAUDE.md` (`@AGENTS.md`) in the same directory — mirroring the
root-level `AGENTS.md` + `CLAUDE.md` pairing. That makes the nested scope
cross-tool. See [`docs/cross-tool-setup.md`](../../../docs/cross-tool-setup.md).

## Workflow

1. **Route first — root or nested?**
   Ask the user which directory the rule applies to and what the convention is.
   Then decide:
   - **Applies to almost every file in the repo** → it belongs in the root
     `AGENTS.md`, not a nested one. Point the user there and stop.
   - **Applies to one directory or layer** → a nested `AGENTS.md` in that
     directory is correct. Continue.
2. Confirm the target directory path. The file lives at
   `{that-directory}/AGENTS.md` — scope is by *location*, so there is no glob
   and no frontmatter.
3. **Check for bloat.** A nested `AGENTS.md` loads on every interaction within
   its subtree — long ones inflate context on every edit there. If the content
   runs past ~50 lines, consider: (a) breaking detailed procedures into a skill
   that loads on demand, or (b) keeping the file short and linking out to a
   fuller doc in `docs/`.
4. Keep the content *specific to the subtree*. Universal rules belong in the
   root `AGENTS.md` — do not restate them here.
5. Generate the file using
   [`./templates/nested-agents-md-template.md`](./templates/nested-agents-md-template.md).
6. Write it to `{target-directory}/AGENTS.md`.
7. Also create the sibling `{target-directory}/CLAUDE.md` containing a single
   line — `@AGENTS.md` — so Claude Code picks up the same nested scope.
8. **Read the generated `AGENTS.md` back to the user** — confirm the directory
   is right and the content is scoped, not universal.
9. Tell the user how to confirm it loaded: edit any file in that directory.
   Copilot users can check via **Chat: Open Diagnostics**; Claude Code loads the
   nested `CLAUDE.md` automatically when reading files in that subtree.

## Conventions checklist

- [ ] Confirmed this is directory-scoped — not a universal rule that belongs in
      the root `AGENTS.md`.
- [ ] File is at `{directory}/AGENTS.md`; no frontmatter, no glob.
- [ ] Sibling `{directory}/CLAUDE.md` exists with `@AGENTS.md` (Claude Code).
- [ ] Content is scoped — no universal rules restated from the root `AGENTS.md`.
- [ ] Body is short. Long procedures belong in a skill; long reference material
      belongs in `docs/`.
- [ ] Cross-references the root `AGENTS.md` (or `docs/conventions.md`) rather
      than duplicating their content.

## References

- [Cross-tool setup](../../../docs/cross-tool-setup.md)
- [Path-specific instructions reference](../../../docs/copilot-customization-reference.md#path-specific-instructions)
