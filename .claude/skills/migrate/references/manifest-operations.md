# Manifest operations

Exact, safe edits to `.claude/ai-kit.json` when resolving a migration. The migrator
touches **only** the integration bookkeeping — nothing else.

> **Who writes the manifest.** On the parallel plan path, scoped workers never
> touch `.claude/ai-kit.json` — each records its `manifest-delta` in its fragment,
> the orchestrator unions them into the plan's `## Manifest changes`, and the
> single **apply** agent performs exactly one manifest write. The edit rules
> below are unchanged — this just fixes *who* applies them and *when*.

## Manifest shape (relevant fields)

```jsonc
{
  "files": {
    "<srcRel>": {
      "sourceHash": "<sha256>",
      "installedAs": "<consumer path; *.ai-kit if sidecar'd>",
      "role": "wiring | base | skill | agent | readme",
      "sidecar": true            // present only when sidecar'd
    }
  },
  "pendingIntegration": [
    { "managedPath": "CLAUDE.md", "sidecarPath": "CLAUDE.md.ai-kit",
      "reason": "consumer file already present" }
  ],
  "preexistingUnmanaged": [ ".github/copilot-instructions.md" ]
}
```

For wiring files, the `files` key (`srcRel`) equals the `managedPath`.

## Resolve a `pendingIntegration` entry

After the merge is written and the sidecar deleted:

1. **Remove the `pendingIntegration` object** — delete the entry whose
   `managedPath` matches.
2. **Flip the matching `files` entry** — locate `files[managedPath]`:
   - Set `installedAs` from `"<managedPath>.ai-kit"` back to `"<managedPath>"`.
   - **Delete the `sidecar` field entirely.** Do not set it to `false` — the CLI
     omits the field when falsy, so `false` would be non-canonical.
   - Leave `sourceHash` and `role` untouched.

   Before:
   ```json
   "CLAUDE.md": {
     "sourceHash": "5c788c...", "installedAs": "CLAUDE.md.ai-kit",
     "role": "wiring", "sidecar": true
   }
   ```
   After:
   ```json
   "CLAUDE.md": {
     "sourceHash": "5c788c...", "installedAs": "CLAUDE.md", "role": "wiring"
   }
   ```

## Resolve a `preexistingUnmanaged` path

- **Folded into ai-kit + original deleted** (e.g.
  `.github/copilot-instructions.md`, `.github/instructions/*.instructions.md`) →
  remove the path string from `preexistingUnmanaged[]`. Do **not** add the new
  nested `AGENTS.md` / `CLAUDE.md` (or any other file the fold created) to the
  manifest — they are consumer content, not ai-kit-managed.
- **Left as-is (intentionally unmanaged)** → keep the path string, so
  `ai-kit status` continues to list it accurately.

## Never touch

`schemaVersion`, `source.*`, `mode`, `installed.*`, or any `sourceHash`.

Note on drift after a merge:

- **`AGENTS.md` and the merged settings files** (`.vscode/settings.json`,
  `.claude/settings.json`) will no longer match their `sourceHash`. That is
  **expected and correct** — the consumer has intentionally diverged from the
  shipped version. `ai-kit status` reports them as "locally modified",
  which accurately reflects reality.
- **`CLAUDE.md`**, once replaced with ai-kit's `CLAUDE.md` exactly, will
  **match** its `sourceHash` again — `status` will show it in sync, not drifted.

## Formatting

Preserve the manifest's existing formatting: **2-space indentation** and a
**trailing newline** (matches how the CLI's `writeManifest` serializes it).
