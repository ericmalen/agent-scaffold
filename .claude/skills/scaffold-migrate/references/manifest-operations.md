# Manifest operations

Exact, safe edits to `.ai-scaffold.json` when resolving a migration. The migrator
touches **only** the integration bookkeeping — nothing else.

## Manifest shape (relevant fields)

```jsonc
{
  "files": {
    "<srcRel>": {
      "sourceHash": "<sha256>",
      "installedAs": "<consumer path; *.scaffold if sidecar'd>",
      "role": "wiring | base | skill | agent | readme",
      "sidecar": true            // present only when sidecar'd
    }
  },
  "pendingIntegration": [
    { "managedPath": "CLAUDE.md", "sidecarPath": "CLAUDE.md.scaffold",
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
   - Set `installedAs` from `"<managedPath>.scaffold"` back to `"<managedPath>"`.
   - **Delete the `sidecar` field entirely.** Do not set it to `false` — the CLI
     omits the field when falsy, so `false` would be non-canonical.
   - Leave `sourceHash` and `role` untouched.

   Before:
   ```json
   "CLAUDE.md": {
     "sourceHash": "5c788c...", "installedAs": "CLAUDE.md.scaffold",
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

- **Folded into the scaffold** → remove the path string from
  `preexistingUnmanaged[]`.
- **Left as-is (intentionally unmanaged)** → keep the path string by default, so
  `agent-scaffold status` continues to list it accurately. Remove it only if the
  user explicitly wants to stop being reminded.

## Never touch

`schemaVersion`, `source.*`, `mode`, `installed.*`, or any `sourceHash`.

Note: after a merge, `sourceHash` will no longer match the merged file's content.
That is **expected and correct** — the consumer has intentionally diverged from
the shipped version. `agent-scaffold status` will report the file as "locally
modified" / drifted, which accurately reflects reality.

## Formatting

Preserve the manifest's existing formatting: **2-space indentation** and a
**trailing newline** (matches how the CLI's `writeManifest` serializes it).
