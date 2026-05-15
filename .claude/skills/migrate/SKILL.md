---
name: migrate
description: "Front door for finishing a brownfield ai-kit migration. Routes into the migrator agent to semantically merge each .scaffold sidecar file into the consumer's original, review pre-existing unmanaged AI-config files, and update .claude/ai-kit.json bookkeeping. Activate when the user says 'finish my migration', 'resolve the sidecar files', 'merge the .scaffold files', 'clear pendingIntegration', 'I ran init on a brownfield repo, now what', or asks how to integrate the scaffold into a repo that already had AI config. Do not activate for fresh greenfield installs — those have nothing to migrate."
argument-hint: "[optional: path to consumer repo if not cwd]"
---

# Migrate a Brownfield Install

## When to Use

After `ai-kit init` runs on a repo that **already had AI config**, it
installs the scaffold fully but sidecars conflicting files (`.scaffold` suffix)
rather than overwriting them, and records what needs attention in
`.claude/ai-kit.json`:

- `pendingIntegration[]` — each sidecar'd conflict that needs a semantic merge.
- `preexistingUnmanaged[]` — files in managed dirs the scaffold doesn't ship.

Use this skill to finish that migration. **Do not** use it for a fresh greenfield
install — there is nothing to migrate.

## Workflow

This skill is the **front door** and **orchestrator**. The
[`migrator`](../../agents/migrator.md) agent does the actual
classification and edits — it carries the procedures, a constrained tool list,
and explicit safety boundaries. Because a subagent cannot pause for approval
mid-run, the migration is **two phases** — plan, then apply — bridged by a plan
file (`.ai-kit-migration-plan.md` at the consumer repo root). This skill
runs in the main thread and is the only thing that may use the Agent tool: it
fans the **plan phase** out across parallel workers, then drives a single
mechanical apply.

The plan phase writes each work unit's merged content **once**, to a staging
directory (`.ai-kit-staging/`); the plan file carries only a *move-list*,
never content; apply just moves staging files into place. The full `SCOPE` /
`FRAGMENT` contract, the staging convention, and assembly rules are in
[`references/orchestration.md`](./references/orchestration.md) — read it first.

1. **Preflight.** Confirm `.claude/ai-kit.json` exists at the consumer repo root
   and that `pendingIntegration` or `preexistingUnmanaged` is non-empty. If both
   are empty, there is nothing to migrate — stop. Otherwise enumerate the
   **work units** — group every source (`pendingIntegration` sidecars,
   `preexistingUnmanaged` paths) by its **write target** per
   `orchestration.md`; "leave as-is" paths collapse into one review unit. Then
   remove any stale `.ai-kit-staging/` so workers start clean.
2. **Plan phase.**
   - **Degenerate path (≤ 2 work units):** invoke a single `migrator`
     with **no** `SCOPE` block — it runs in *whole plan mode*, classifies every
     unit against the deterministic rules in
     [`references/integration-rules.md`](./references/integration-rules.md),
     writes the staging files, and writes `.ai-kit-migration-plan.md` itself.
   - **Parallel path (≥ 3 work units):** spawn one `migrator` per work
     unit, **all in a single message** (multiple Agent calls in one turn —
     separate messages serialize them and defeat the optimization). Each runs in
     *scoped plan mode* with a `SCOPE` block, writes its staging files, and
     returns a small metadata-only `FRAGMENT` as text. Once every fragment is
     back, **assemble** `.ai-kit-migration-plan.md` yourself per
     `orchestration.md` — a small move-list, **never** the content. You are the
     sole writer of the plan file. If the fan-out is interrupted before all
     fragments return, write no plan file and re-run the plan phase.
3. **Present the plan.** Read `.ai-kit-migration-plan.md` and show it to the
   user for a single approval. The plan is short; the actual merged content sits
   in `.ai-kit-staging/` for the user to inspect. The user may edit the plan
   file or the staging files directly before approving.
4. **Apply phase.** On approval, invoke a single `migrator` with the
   plan file present — it runs in *apply mode*: re-verifies every premise
   snapshot (and stops if anything drifted), **moves** each staging file onto its
   target, applies the `.claude/ai-kit.json` changes, and deletes the resolved
   sidecars, the staging directory, and the plan file. Apply regenerates no
   content — the staging files are authoritative.
5. When done, run `ai-kit status` to confirm the integration warning
   cleared.

If the apply call's outcome is ever uncertain (interrupted, ambiguous result),
just invoke `migrator` again — with the plan file still present it
re-enters apply mode, and its premise check makes a re-run safe: it applies
cleanly or stops on detected drift, never double-applies blindly.

The exact safe edits to `.claude/ai-kit.json` are in
[`references/manifest-operations.md`](./references/manifest-operations.md).

## References

- [Orchestration](./references/orchestration.md) — work units, the `SCOPE` /
  `FRAGMENT` contract, parallel fan-out, and plan-file assembly.
- [Integration rules](./references/integration-rules.md) — where each kind of
  existing AI-config content belongs in the scaffold.
- [Manifest operations](./references/manifest-operations.md) — exact safe edits to
  `.claude/ai-kit.json`.
- [Brownfield migration guide](../../../docs/migration.md) — the manual process
  this skill automates.
- [Cross-tool setup](../../../docs/cross-tool-setup.md) — what belongs where in
  the scaffold.

## Examples

- [Worked migration](./examples/worked-migration.md) — a full two-phase walkthrough
  of a real brownfield repo.
