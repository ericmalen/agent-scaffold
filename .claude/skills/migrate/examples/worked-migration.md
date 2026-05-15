# Worked migration

A walkthrough of the full `/migrate` flow on a repo that already had AI config
when `ai-kit init` ran.

## Starting state

`.claude/ai-kit.json` shows:

```jsonc
"pendingIntegration": [
  { "managedPath": "CLAUDE.md", "sidecarPath": "CLAUDE.md.ai-kit",
    "reason": "consumer file already present" },
  { "managedPath": ".vscode/settings.json",
    "sidecarPath": ".vscode/settings.json.ai-kit",
    "reason": "consumer file already present" }
],
"preexistingUnmanaged": [ ".claude/settings.local.json" ]
```

The consumer's `CLAUDE.md` has ~600 lines of real project rules.

## Step 1 — Preflight

```
node bin/ai-kit.mjs migrate preflight
```

Enumerates work units from the manifest and writes `.ai-kit-migration-scope.json`:

| unit-id | type | target |
|---|---|---|
| `root-agents-md` | `markdown-fold` | `AGENTS.md` + `CLAUDE.md` (shim) |
| `vscode-settings` | `json-merge` | `.vscode/settings.json` |
| `review-unmanaged` | `leave-as-is` | *(none)* |

## Step 2 — Route (migrator agent)

The `migrator` agent reads the scope, `integration-rules.md`, and each source
file. It writes `.ai-kit-migration-routing.json` — **routing decisions only**,
no body content. For `root-agents-md`:

```jsonc
{
  "id": "root-agents-md",
  "type": "markdown-fold",
  "target": "AGENTS.md",
  "shimInstall": { "from": "CLAUDE.md.ai-kit", "to": "CLAUDE.md" },
  "sources": [{
    "path": "CLAUDE.md",
    "h2Routing": [
      { "sourceHeading": "## Project Overview", "sourceLineRange": [5, 8],
        "targetHeading": "## Overview", "demote": true, "keepOriginalHeading": false },
      { "sourceHeading": "## Architecture",     "sourceLineRange": [9, 17],
        "targetHeading": "## Architecture",    "demote": true, "keepOriginalHeading": false },
      { "sourceHeading": "## Common Commands",  "sourceLineRange": [18, 53],
        "targetHeading": "## Conventions",     "demote": true, "keepOriginalHeading": true }
    ]
  }],
  "deletions": ["CLAUDE.md.ai-kit"],
  "manifestDelta": [{ "kind": "resolvePending", "managedPath": "CLAUDE.md" }]
}
```

The body text of `CLAUDE.md` never appears in the routing JSON — only line
ranges and heading names. Total LLM output: ~500 tokens, ~10-15s.

## Step 3 — Stage

```
node bin/ai-kit.mjs migrate stage
```

The CLI reads the routing JSON and executes all file I/O deterministically:

- `markdown-fold`: reads each `sourceLineRange` from `CLAUDE.md`, demotes `##`
  → `###`, appends body under the target H2 in canonical order, writes
  `.ai-kit-staging/AGENTS.md`. Byte-copies `CLAUDE.md.ai-kit` → staging
  `CLAUDE.md`.
- `json-merge` (`aikit-wins-on-conflict`): merges `settings.json.ai-kit` into
  consumer's `settings.json`, writes `.ai-kit-staging/.vscode/settings.json`.
- `leave-as-is`: no-op for `.claude/settings.local.json`.
- Snapshots premise hashes; writes `.ai-kit-migration-plan.md`.

Deletes routing + scope JSON (consumed). Total time: <200ms.

## Step 4 — Review

The skill presents the plan. You can inspect staging files at
`.ai-kit-staging/` and edit them directly before approving.

`.ai-kit-migration-plan.md` summary section:

```
## Summary
- root-agents-md: fold CLAUDE.md → AGENTS.md (markdown-fold)
- vscode-settings: merge ai-kit keys → .vscode/settings.json (json-merge)
- review-unmanaged: .claude/settings.local.json left as-is
```

## Step 5 — Apply

On approval:

```
node bin/ai-kit.mjs migrate apply
```

1. Verifies premise snapshots match current files (aborts on drift).
2. Checks no sacred local files (`settings.local.json`,
   `appsettings.Local.json`) in deletions list.
3. Moves `.ai-kit-staging/AGENTS.md` → `AGENTS.md`,
   `.ai-kit-staging/CLAUDE.md` → `CLAUDE.md`,
   `.ai-kit-staging/.vscode/settings.json` → `.vscode/settings.json`.
4. Calls `applyDeltas` — removes `pendingIntegration` entries, flips
   `installedAs`, drops `sidecar` field. Writes manifest once.
5. Deletes `CLAUDE.md.ai-kit`, `.vscode/settings.json.ai-kit`.
6. Removes staging dir and plan file.
7. Runs `ai-kit audit`.

## End state

- `AGENTS.md` holds all consumer rules under canonical H2s.
- `CLAUDE.md` is the `@AGENTS.md` shim — 2 lines.
- `.vscode/settings.json` has consumer keys + ai-kit keys merged.
- `pendingIntegration` is empty; `preexistingUnmanaged` still lists
  `.claude/settings.local.json` (left as-is by design).
- No staging dir, no plan file, no `.ai-kit` sidecars remain.
