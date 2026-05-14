---
name: scaffold-migrate
description: "Front door for finishing a brownfield agent-scaffold migration. Routes into the scaffold-migrator agent to semantically merge each .scaffold sidecar file into the consumer's original, review pre-existing unmanaged AI-config files, and update .ai-scaffold.json bookkeeping. Activate when the user says 'finish my migration', 'resolve the sidecar files', 'merge the .scaffold files', 'clear pendingIntegration', 'I ran init on a brownfield repo, now what', or asks how to integrate the scaffold into a repo that already had AI config. Do not activate for fresh greenfield installs — those have nothing to migrate."
argument-hint: "[optional: path to consumer repo if not cwd]"
---

# Migrate a Brownfield Install

## When to Use

After `agent-scaffold init` runs on a repo that **already had AI config**, it
installs the scaffold fully but sidecars conflicting files (`.scaffold` suffix)
rather than overwriting them, and records what needs attention in
`.ai-scaffold.json`:

- `pendingIntegration[]` — each sidecar'd conflict that needs a semantic merge.
- `preexistingUnmanaged[]` — files in managed dirs the scaffold doesn't ship.

Use this skill to finish that migration. **Do not** use it for a fresh greenfield
install — there is nothing to migrate.

## Workflow

This skill is the **front door**. The [`scaffold-migrator`](../../agents/scaffold-migrator.md)
agent does the actual edits — it carries the procedures, a constrained tool list,
and explicit safety boundaries.

1. Confirm `.ai-scaffold.json` exists at the consumer repo root and that
   `pendingIntegration` or `preexistingUnmanaged` is non-empty. If both are empty,
   there is nothing to migrate — stop.
2. Hand off to the `scaffold-migrator` agent (invoke `@scaffold-migrator`, or in
   Claude Code delegate to it by name). It runs a two-phase, approval-gated merge:
   - **Phase 1** — for each `pendingIntegration` entry: read the consumer's
     original and the scaffold's `.scaffold` version, propose a merge (routing
     content to wherever it belongs — project rules go to `AGENTS.md`, not
     necessarily back into the original file), apply on approval, delete the
     sidecar, fix the manifest bookkeeping.
   - **Phase 2** — for each `preexistingUnmanaged` file: propose folding it into a
     scaffold file or leaving it as intentionally unmanaged.
3. When done, run `agent-scaffold status` to confirm the integration warning
   cleared.

The decision framework for *where each kind of content belongs* lives in
[`references/integration-rules.md`](./references/integration-rules.md). The exact
safe edits to `.ai-scaffold.json` are in
[`references/manifest-operations.md`](./references/manifest-operations.md).

## References

- [Integration rules](./references/integration-rules.md) — where each kind of
  existing AI-config content belongs in the scaffold.
- [Manifest operations](./references/manifest-operations.md) — exact safe edits to
  `.ai-scaffold.json`.
- [Brownfield migration guide](../../../docs/migration.md) — the manual process
  this skill automates.
- [Cross-tool setup](../../../docs/cross-tool-setup.md) — what belongs where in
  the scaffold.

## Examples

- [Worked migration](./examples/worked-migration.md) — a full two-phase walkthrough
  of a real brownfield repo.
