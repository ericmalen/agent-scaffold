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

You don't have to do any of the above by hand. The `migrator` agent
ships with every install and performs the semantic merges for you, with
approval-gated review at each step.

Run `/migrate` (or invoke `@migrator`) in Claude Code or
Copilot. It walks `pendingIntegration` and `preexistingUnmanaged` from
`.claude/ai-kit.json`, proposes each merge as a concrete before/after, applies it
on your approval, deletes resolved sidecars, and updates the manifest
bookkeeping. The manual steps above remain available if you prefer to merge by
hand.

After migration completes, the migrator automatically runs `ai-kit audit` and
reports any convention violations it finds. If findings are shown, run
`/optimize` to fix them automatically.
