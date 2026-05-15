# Orchestration

How the `migrate` skill parallelizes the **plan phase** across several
`migrator` workers, and how the pieces fit back together.

The skill is the **orchestrator** — it runs in the main thread and is the only
thing that uses the Agent tool. Workers (`migrator` subagents) cannot
spawn other agents; all fan-out lives in the skill.

## The staging directory — why this is fast

The migration's expensive output — the merged content of large files like
`AGENTS.md` — is **written once, to a staging directory**, then **moved** into
place at apply time. It is never embedded in the plan file and never
re-transcribed.

This matters because, for an LLM agent, *writing* a file means generating every
token of its content — copying a 600-line file is nearly as slow as authoring
it. If the merged content rode *through* the plan file, it would be regenerated
at every hop (worker → plan file → target). Staging files let the content sit on
disk and just get `mv`'d, so it is generated **exactly once**.

- Staging root: `.ai-kit-staging/` at the consumer repo root.
- Staging files mirror their final target path:
  `.ai-kit-staging/AGENTS.md`, `.ai-kit-staging/CLAUDE.md`,
  `.ai-kit-staging/.vscode/settings.json`,
  `.ai-kit-staging/src/api/AGENTS.md`, …
- The directory is **transient** — apply moves every staging file to its target
  and deletes the directory. Nothing in the real working tree is touched until
  apply, so the approval gate is unchanged.

## Work units

A **work unit** is one **write target** — a file the migration will create or
overwrite — together with every source that routes into it.

Sources are the sidecar'd files in `pendingIntegration[]` and the paths in
`preexistingUnmanaged[]`. Group them by routing target per `integration-rules.md`:

- everything that folds into **root `AGENTS.md`** (a sidecar'd `CLAUDE.md`,
  `.github/copilot-instructions.md`, skill-overlap prose) → **one** work unit;
  that worker also produces the `CLAUDE.md` import shim.
- a sidecar'd `.vscode/settings.json` → its own work unit.
- a sidecar'd `.claude/settings.json` → its own work unit.
- each `.github/instructions/*.instructions.md` → one work unit per nested
  `AGENTS.md` target (the worker also produces that directory's `CLAUDE.md` shim).
- paths whose disposition is **leave as-is** (`.github/chatmodes/*`,
  `.github/prompts/*`, `.claude/settings.local.json`, …) have **no write
  target** — collect them all into a single **review unit**.

Because each work unit owns a distinct target, every worker writes a distinct set
of staging files — **no write contention**, even on the parallel path.

## Degenerate path

If there are **≤ 2 work units total**, skip fan-out: invoke a single
`migrator` in **whole plan mode** (no `SCOPE` block). It produces every
staging file and writes `.ai-kit-migration-plan.md` itself. Everything below
describes the **parallel path** (≥ 3 work units).

## SCOPE block

Each parallel worker is invoked in **scoped plan mode** — its prompt carries a
fenced `SCOPE` block naming exactly one work unit:

```
SCOPE
unit-id:       <stable kebab-case id, e.g. root-agents-md, vscode-settings>
consumer-repo: <absolute path to the consumer repo root>
staging-root:  <consumer-repo>/.ai-kit-staging
sources:       [<every source path routing into this unit — sidecars and/or unmanaged paths>]
targets:       [<the final path(s) this unit produces — e.g. AGENTS.md, CLAUDE.md>]
rule:          integration-rules.md → "<section name(s)>"
installed-opt-in-skills: [<from .claude/ai-kit.json installed.skills>]
return:        a FRAGMENT as text — write ONLY under staging-root
```

A **review unit** SCOPE block has `targets: (none — leave as-is)` and
`return: a FRAGMENT, write nothing` — the worker only confirms the disposition.

## What a scoped worker does

1. Read `integration-rules.md` + `manifest-operations.md`, then read only its
   `sources` (and the current target file, if one exists, as a merge base).
2. Apply the deterministic disposition and produce the **final merged content**.
3. **Write that content to staging files** under `staging-root`, mirroring each
   final target path. Create parent directories as needed. Write nothing outside
   `staging-root`.
4. Record a **premise snapshot** (line count + first + last line) for every real
   file apply will overwrite or delete for this unit — the target(s) as they are
   now, and every sidecar/source to be deleted.
5. Return a **FRAGMENT** as text (below). It carries only *metadata* — never the
   merged content itself; that lives in the staging files.

A review-unit worker does only step 1 (read sources) and step 5, with empty
`moves` and `deletions`.

## FRAGMENT return shape

```
FRAGMENT unit-id=<id>
disposition: <one line — what happens to this unit>
moves:
  - from: .ai-kit-staging/<path>   to: <final target path>
  - ...                                       # one per staging file produced
premise-snapshots:
  - file: <path>   lines: <n>   first: "<first line>"   last: "<last line>"
  - ...                              # one per real file apply overwrites or deletes
manifest-delta:
  - <e.g. "remove pendingIntegration[CLAUDE.md]; flip files[CLAUDE.md]: installedAs->CLAUDE.md, drop sidecar">
deletions:
  - <sidecars / folded originals this unit resolves — real paths to rm>
notes:
  - <skill-overlap recommendations, ambiguity calls, tool-specific lines, anything the user should see>
```

## Assembly (orchestrator, inline)

After **all** fragments return, the orchestrator writes
`.ai-kit-migration-plan.md` — it is the **sole writer** of the plan file.
The plan file is **small**: it lists *moves*, not content. The orchestrator does
**not** read or copy the staging files — it only unions the fragments' metadata.

```
# Migration plan

## Summary
<one line per work unit — its disposition>

## Moves
<every fragment's `moves`, grouped — "move .ai-kit-staging/X -> X">

## Premise snapshots
<the unioned list — apply re-verifies every entry before any move>

## Manifest changes
<the unioned, exact .claude/ai-kit.json edits>

## Deletions
<every sidecar / folded original to rm; then .ai-kit-staging/ ; then the plan file itself>

## Coverage check
<one line per target — confirm every source was accounted for>
```

## Apply (single migrator, mechanical)

Apply mode consumes the plan file mechanically — **no content is regenerated**:

1. Re-verify every `## Premise snapshots` entry against the real files. Any
   drift → stop, write nothing.
2. For each `## Moves` entry, move the staging file onto its target (overwriting),
   creating parent directories as needed.
3. Apply `## Manifest changes` to `.claude/ai-kit.json`.
4. `rm` everything in `## Deletions` — the resolved sidecars, then the
   `.ai-kit-staging/` directory, then the plan file.

The merged content was generated exactly once — by the scoped worker, into the
staging file. Apply only moves it. That is the whole point.

## Hard rules

- The orchestrator must spawn **all** workers in **one message** (multiple Agent
  calls in a single turn) — separate messages serialize them.
- Before the fan-out, the orchestrator removes any stale `.ai-kit-staging/`
  so workers start from a clean staging directory.
- The orchestrator writes the plan file **only after every fragment returns**,
  and never copies staging-file *content* into the plan — only the move-list.
- Scoped workers write **only** under `.ai-kit-staging/`. A worker that
  touches a real repo file, the manifest, or the plan file is a bug.
- If the plan fan-out is interrupted, no plan file exists → re-running the skill
  cleanly restarts (the orchestrator wipes and rebuilds the staging directory).
