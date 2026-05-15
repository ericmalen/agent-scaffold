# Brownfield migration guide

When `ai-kit init` runs on a repo that already has AI resources, it
installs ai-kit fully but **sidecars** any file that conflicts with your
existing content — appending a `.ai-kit` extension rather than overwriting.
It also records files it found but doesn't manage under `preexistingUnmanaged`
in `.claude/ai-kit.json`.

Your `.claude/ai-kit.json` will have a `pendingIntegration` array listing every
sidecar'd file. Until those are resolved, `ai-kit status` will remind
you.

## What needs merging

For each entry in `pendingIntegration`:

| Field | Meaning |
|---|---|
| `managedPath` | The path ai-kit wanted to write (your original lives here) |
| `sidecarPath` | Where ai-kit's version was written (`.ai-kit` suffix) |

Each file has a fixed disposition — there is no judgment call:

### `AGENTS.md`
Your version is the project's instruction file. ai-kit's version is a
TODO-placeholder template. Copy any structural sections from the `.ai-kit`
version your file is missing, then delete the `.ai-kit` file. Never downgrade
your real content to a TODO placeholder.

### `CLAUDE.md`
Move all of your `CLAUDE.md` content into `AGENTS.md`, then replace `CLAUDE.md`
with ai-kit's version (the `.ai-kit` sidecar — `@AGENTS.md` plus
boilerplate) and delete the sidecar. Claude Code reads only `CLAUDE.md` and has
no `AGENTS.md` fallback, so `CLAUDE.md` must stay as the import shim.

### `.claude/settings.json`
Union the `deny` lists (keep ai-kit's `.env` rules), keep your `allow`
list, merge `hooks`. Delete the `.ai-kit` sidecar.

### `.vscode/settings.json`
Merge **every** key from the `.ai-kit` sidecar into your `settings.json` — the
`chat.*` AI keys, `explorer.fileNesting.*`, and `chat.tools.terminal.*`. Keep
your own extra keys; on a conflict, take ai-kit's value. Delete the
sidecar.

### `.github/copilot-instructions.md`
Fold its content into the root `AGENTS.md`, then delete the file. ai-kit
makes `AGENTS.md` canonical and Copilot reads it natively, so the file is
redundant.

### `.github/instructions/*.instructions.md`
For each one, fold its content into a nested `AGENTS.md` in the directory it was
scoped to (add a sibling `CLAUDE.md` containing `@AGENTS.md`), then delete the
original. This preserves the path scoping.

## After merging

Once you have manually merged a file, remove its entry from
`pendingIntegration` in `.claude/ai-kit.json`. When the array is empty,
`ai-kit status` will no longer show the integration warning.

## Automated migration (recommended)

You don't have to do any of the above by hand. The `/migrate` skill handles
everything: routing decisions are made by the `migrator` agent; file I/O is
executed deterministically by the `ai-kit migrate` CLI. No body content is
ever token-generated — the agent only emits structured routing decisions
(which source H2 maps to which target H2), so migrations are fast (~10-20s
LLM call + <1s JS stitching) and fully auditable.

**How it works:**

1. **Preflight** (`ai-kit migrate preflight`) — enumerates work units from
   `pendingIntegration` and `preexistingUnmanaged`, writes a scope summary.
2. **Route** (`migrator` agent) — reads sources + `integration-rules.md`,
   writes `.ai-kit-migration-routing.json` with H2 mappings and merge
   strategies. Never touches real files.
3. **Stage** (`ai-kit migrate stage`) — reads routing JSON, stitches content
   from source line ranges into staging files under `.ai-kit-staging/`,
   snapshots premise hashes, writes `.ai-kit-migration-plan.md`.
4. **Review** — you inspect the plan and staging files. Edit staging files
   directly if you want tweaks.
5. **Apply** (`ai-kit migrate apply`) — verifies premise snapshots (aborts on
   drift), moves staging → real paths, updates manifest, deletes sidecars.

Run `/migrate` in Claude Code to start. The manual steps above remain
available if you prefer to merge by hand.

After migration, `ai-kit audit` runs automatically. If findings are shown,
run `/optimize` to fix them.
