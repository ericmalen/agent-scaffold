---
name: migrate
description: "Front door for finishing a brownfield ai-kit migration. Routes into the migrator agent to semantically merge each .ai-kit sidecar file into the consumer's original, review pre-existing unmanaged AI-config files, and update .claude/ai-kit.json bookkeeping. Activate when the user says 'finish my migration', 'resolve the sidecar files', 'merge the .ai-kit files', 'clear pendingIntegration', 'I ran init on a brownfield repo, now what', or asks how to integrate ai-kit into a repo that already had AI config. Do not activate for fresh greenfield installs — those have nothing to migrate."
argument-hint: "[optional: path to consumer repo if not cwd]"
---

# Migrate a Brownfield Install

## When to Use

After `ai-kit init` on a repo that already had AI config, use this skill to
finish the migration. `init` sidecars conflicting files and records what needs
attention in `.claude/ai-kit.json`. This skill resolves that debt.

**Do not** use for greenfield installs — nothing to migrate.

## Workflow

1. **Preflight.** Run:
   ```
   node <ai-kit-root>/bin/ai-kit.mjs migrate --phase preflight
   ```
   This enumerates work units and writes `.ai-kit-migration-scope.json`.
   If output says "Nothing to migrate", stop.

2. **Route.** Invoke the [`migrator`](../../agents/migrator.md) agent.
   Pass the consumer repo path in the prompt if it differs from cwd. The agent
   reads `.ai-kit-migration-scope.json`, reads each source file per
   `integration-rules.md`, and writes `.ai-kit-migration-routing.json` with
   routing decisions. **It never edits files — only routing JSON.**

3. **Stage.** Run:
   ```
   node <ai-kit-root>/bin/ai-kit.mjs migrate --phase stage
   ```
   The CLI reads the routing JSON, mechanically stitches source bodies under
   target headings, merges JSONs per strategy, and writes staging files to
   `.ai-kit-staging/`. It then writes `.ai-kit-migration-plan.md` and deletes
   the scope + routing files.

4. **Present the plan.** Read `.ai-kit-migration-plan.md` and the staging
   files, then show them to the user for a **single approval**. The plan lists
   every file move, manifest change, and deletion. The user may edit the
   staging files directly before approving.

5. **Apply.** On approval, run:
   ```
   node <ai-kit-root>/bin/ai-kit.mjs migrate --phase apply --yes
   ```
   The CLI re-verifies premise snapshots (stops on any drift), moves staging
   files into place, updates `.claude/ai-kit.json`, deletes resolved sidecars,
   runs `ai-kit audit`, and writes `.claude/ai-kit-audit-report.json`.

   **After apply completes, read `.claude/ai-kit-audit-report.json` and
   summarize the audit results to the user:** report the total counts (errors /
   warnings / info) and a short bulleted list of any findings (file, severity,
   message). If errors or warnings exist, recommend `/optimize`. If the report
   file is absent, say so — never fabricate a result.

   Note: `.claude/ai-kit-audit-report.json` is auto-generated. Add it to your
   `.gitignore`.

**Re-run safety:** the plan file acts as a checkpoint. If apply is interrupted,
just run apply again — the premise check prevents double-application.

## References

- [Integration rules](./references/integration-rules.md) — routing rules the
  migrator agent applies.
- [Brownfield migration guide](../../../docs/migration.md) — manual process
  this skill automates.
- [Cross-tool setup](../../../docs/cross-tool-setup.md) — what belongs where.
