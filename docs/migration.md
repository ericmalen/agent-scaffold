# Brownfield migration guide

When `agent-scaffold init` runs on a repo that already has AI resources, it
installs the scaffold fully but **sidecars** any file that conflicts with your
existing content — appending a `.scaffold` extension rather than overwriting.
It also records files it found but doesn't manage under `preexistingUnmanaged`
in `.ai-scaffold.json`.

Your `.ai-scaffold.json` will have a `pendingIntegration` array listing every
sidecar'd file. Until those are resolved, `agent-scaffold status` will remind
you.

## What needs merging

For each entry in `pendingIntegration`:

| Field | Meaning |
|---|---|
| `managedPath` | The path the scaffold wanted to write (your original lives here) |
| `sidecarPath` | Where the scaffold's version was written (`.scaffold` suffix) |

Common cases and how to handle them:

### `AGENTS.md`
Your version is the project's instruction file. The scaffold's version is a
TODO-placeholder template. Open both, copy any structural sections from the
`.scaffold` version you want, fill in your project's specifics, then delete
the `.scaffold` file.

### `CLAUDE.md`
The scaffold's `CLAUDE.md` contains only `@AGENTS.md` (an import directive).
If your `CLAUDE.md` has this already, delete the `.scaffold` sidecar and you
are done. If not, merge the `@AGENTS.md` line into your file.

### `.claude/settings.json`
Compare your permissions block with the scaffold's. Merge `deny` rules (the
scaffold blocks reading `.env` files). Keep your `allow` list. Delete the
`.scaffold` sidecar when done.

### `.vscode/settings.json`
The scaffold enables specific Copilot / AI agent features. Add the AI-related
keys from the `.scaffold` sidecar into your `settings.json`. Delete the
sidecar when done.

## After merging

Once you have manually merged a file, remove its entry from
`pendingIntegration` in `.ai-scaffold.json`. When the array is empty,
`agent-scaffold status` will no longer show the integration warning.

## Automated migration (recommended)

You don't have to do any of the above by hand. The `scaffold-migrator` agent
ships with every install and performs the semantic merges for you, with
approval-gated review at each step.

Run `/scaffold-migrate` (or invoke `@scaffold-migrator`) in Claude Code or
Copilot. It walks `pendingIntegration` and `preexistingUnmanaged` from
`.ai-scaffold.json`, proposes each merge as a concrete before/after, applies it
on your approval, deletes resolved sidecars, and updates the manifest
bookkeeping. The manual steps above remain available if you prefer to merge by
hand.
