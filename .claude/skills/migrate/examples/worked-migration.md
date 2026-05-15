# Worked migration

Two walkthroughs — the **parallel path** (≥ 3 work units, plan-phase fan-out)
and the **degenerate path** (≤ 2 work units, a single agent). Both write each
work unit's merged content **once** into `.ai-kit-staging/`, end with one
approval, and one mechanical apply that just *moves* the staging files into
place. See [`../references/orchestration.md`](../references/orchestration.md) for
the `SCOPE` / `FRAGMENT` grammars and the staging convention.

## Parallel path

### Starting state

A repo that already had AI config when `ai-kit init --skills
git-conventions` ran. After `init`, `.claude/ai-kit.json` shows:

```jsonc
"pendingIntegration": [
  { "managedPath": "CLAUDE.md", "sidecarPath": "CLAUDE.md.scaffold",
    "reason": "consumer file already present" },
  { "managedPath": ".vscode/settings.json",
    "sidecarPath": ".vscode/settings.json.scaffold",
    "reason": "consumer file already present" }
],
"preexistingUnmanaged": [ ".claude/settings.local.json" ]
```

The consumer's `CLAUDE.md` holds ~600 lines of real project rules; its
`.vscode/settings.json` has one custom key; `.claude/settings.local.json` is a
local Claude Code permissions file.

### Preflight — enumerate work units (by write target)

The orchestrator groups every source by its **write target**:

| unit-id | sources | target(s) |
|---|---|---|
| `root-agents-md` | `CLAUDE.md` (+ sidecar) | `AGENTS.md`, `CLAUDE.md` |
| `vscode-settings` | `.vscode/settings.json` (+ sidecar) | `.vscode/settings.json` |
| `settings-local` | `.claude/settings.local.json` | *(none — review unit)* |

Three work units → **parallel path**. The orchestrator removes any stale
`.ai-kit-staging/` so workers start clean.

### Plan phase — fan-out

The orchestrator spawns **three `migrator` workers in one message**,
each in scoped plan mode with its `SCOPE` block. Each reads only its scoped
sources, **writes its merged result to staging files**, and returns a small
metadata `FRAGMENT` — e.g. `root-agents-md`:

```
FRAGMENT unit-id=root-agents-md
disposition: fold consumer CLAUDE.md (~600 lines) into AGENTS.md under its
  headings; replace CLAUDE.md with the @AGENTS.md shim; delete the sidecar
moves:
  - from: .ai-kit-staging/AGENTS.md   to: AGENTS.md
  - from: .ai-kit-staging/CLAUDE.md   to: CLAUDE.md
premise-snapshots:
  - file: AGENTS.md   lines: 52   first: "# Project Name"   last: "the relevant subdirectory."
  - file: CLAUDE.md   lines: 593  first: "# CLAUDE.md"      last: "13. **Token security** — …"
  - file: CLAUDE.md.scaffold   lines: 14   first: "@AGENTS.md"   last: "…load them natively…"
manifest-delta:
  - remove pendingIntegration[CLAUDE.md]; flip files[CLAUDE.md]: installedAs->CLAUDE.md, drop sidecar
deletions:
  - CLAUDE.md.scaffold
notes:
  - no git-conventions vocabulary in CLAUDE.md — no skill-overlap action
```

The `~600 lines` of merged `AGENTS.md` are now in
`.ai-kit-staging/AGENTS.md` — **not** in the FRAGMENT, **not** (later) in
the plan file. `vscode-settings` returns a similar fragment with its merged
`.vscode/settings.json` staged. `settings-local` is a review unit — empty
`moves`/`deletions`, disposition "leave as-is".

### Assemble the plan

The orchestrator collects the three fragments and writes a **small**
`.ai-kit-migration-plan.md` — just the unioned move-list, premise
snapshots, manifest changes, deletions, and a coverage check. It does **not**
read or copy the staging files; the content was generated once and stays on
disk.

### Present + approve

The user reads the short plan and can inspect the actual merged files in
`.ai-kit-staging/`. They approve once. No per-file menu.

### Apply

One `migrator` in apply mode: re-verify every premise snapshot (stop on
drift), then **move** each staging file onto its target
(`.ai-kit-staging/AGENTS.md` → `AGENTS.md`, etc.), apply the manifest
changes, and `rm` the resolved sidecars, the `.ai-kit-staging/` directory,
and the plan file. No content is regenerated — apply is `mv` + `rm` + a small
manifest edit.

### End state

- `AGENTS.md` carries all the project rules; `CLAUDE.md` equals the scaffold's
  `CLAUDE.md` exactly; `.vscode/settings.json` has every scaffold key merged in,
  consumer keys intact.
- No `.scaffold` files, no `.ai-kit-staging/`, no plan file remain.
- `pendingIntegration` is empty; `.claude/settings.local.json` stays in
  `preexistingUnmanaged` (left as-is).
- `ai-kit status` shows no integration warning — `AGENTS.md` and
  `.vscode/settings.json` are "locally modified" (expected), `CLAUDE.md` is in
  sync, `.claude/settings.local.json` is listed as unmanaged.

## Degenerate path

A repo where `init` sidecar'd only `CLAUDE.md` — **one work unit** (or two:
`CLAUDE.md` + `.vscode/settings.json`). With ≤ 2 work units the orchestrator
**skips fan-out**: it invokes a single `migrator` with **no `SCOPE`
block**, which runs in *whole plan mode* — it classifies every unit itself,
writes the staging files, and writes `.ai-kit-migration-plan.md` directly.

Present, approve, and apply are identical to the parallel path: one approval,
one mechanical apply that moves staging files into place. The degenerate path
just avoids spawning workers when the migration is too small to benefit from
parallelism.
