# Worked migration

A full two-phase walkthrough of a real brownfield repo, end to end.

## Starting state

A repo that already had AI config when `agent-scaffold init --skills
git-conventions` ran. The relevant pre-existing files:

`CLAUDE.md` (the consumer's original):
```markdown
# Project instructions

- Always use TypeScript, never plain JS
- Run `pnpm test` before opening a PR
- We use GCDS for all UI components
- Conventional commits: feat:, fix:, chore:, docs:. Squash on merge.
```

`.vscode/settings.json` (the consumer's original):
```json
{
  "editor.formatOnSave": true,
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

`.github/copilot-instructions.md`:
```markdown
# Copilot instructions

Use TypeScript. Prefer functional patterns. All components must use GCDS.
Run tests before suggesting a PR.
```

After `init`, `.ai-scaffold.json` shows:
```jsonc
"pendingIntegration": [
  { "managedPath": "CLAUDE.md", "sidecarPath": "CLAUDE.md.scaffold",
    "reason": "consumer file already present" },
  { "managedPath": ".vscode/settings.json",
    "sidecarPath": ".vscode/settings.json.scaffold",
    "reason": "consumer file already present" }
],
"preexistingUnmanaged": [ ".github/copilot-instructions.md" ]
```

## Phase 1 — resolve `pendingIntegration`

### Entry 1: `CLAUDE.md`

The agent reads `CLAUDE.md` (4 project rules) and `CLAUDE.md.scaffold` (just
`@AGENTS.md`). Per [integration-rules](../references/integration-rules.md), the
project rules belong in `AGENTS.md`, not `CLAUDE.md`. One rule —
"Conventional commits…" — overlaps the `git-conventions` skill, which is already
installed.

**Proposal:**
- Move "Always use TypeScript", "Run `pnpm test` before opening a PR", and "We use
  GCDS for all UI components" into `AGENTS.md` under a `## Conventions` heading.
- Drop the "Conventional commits…" line — `git-conventions` covers it. Add a
  one-line pointer in `AGENTS.md`: "Commit/PR/branch conventions: see the
  `git-conventions` skill."
- Rewrite `CLAUDE.md` to just `@AGENTS.md`.

On approval: apply the edits, `rm CLAUDE.md.scaffold`, then per
[manifest-operations](../references/manifest-operations.md) remove the
`pendingIntegration` entry and flip `files["CLAUDE.md"]` — `installedAs`:
`"CLAUDE.md.scaffold"` → `"CLAUDE.md"`, delete `sidecar: true`.

### Entry 2: `.vscode/settings.json`

The agent reads both. The consumer's file has editor settings; the
`.scaffold` version adds AI-feature keys. Per integration-rules, merge **only**
the AI keys.

**Proposal:** add the `vscodeAiKeys` (`chat.useAgentsMdFile`,
`chat.useAgentSkills`, etc.) from the sidecar into the consumer's
`.vscode/settings.json`; leave `editor.formatOnSave` and the TypeScript key
alone.

On approval: apply, `rm .vscode/settings.json.scaffold`, remove the
`pendingIntegration` entry, flip `files[".vscode/settings.json"]`.

## Phase 2 — review `preexistingUnmanaged`

### `.github/copilot-instructions.md`

Per integration-rules, this is legacy Copilot-only surface. Its content
("TypeScript", "GCDS", "run tests before a PR") now lives in `AGENTS.md`, which
Copilot reads natively. The one unique line — "Prefer functional patterns" — is
not yet captured.

**Proposal:** fold "Prefer functional patterns" into `AGENTS.md` under
`## Conventions`, then replace `.github/copilot-instructions.md` with a one-line
pointer: `Instructions live in AGENTS.md.` (or remove it — ask the user).

On approval: apply, then drop `.github/copilot-instructions.md` from
`preexistingUnmanaged[]`.

## End state

- `AGENTS.md` carries all the project conventions; `CLAUDE.md` is just
  `@AGENTS.md`.
- `.vscode/settings.json` has the AI keys merged in, editor settings intact.
- No `.scaffold` files remain.
- `pendingIntegration` and `preexistingUnmanaged` are both empty.
- `agent-scaffold status` shows no integration warning. It *does* report
  `AGENTS.md`, `CLAUDE.md`, and `.vscode/settings.json` as "locally modified" —
  that is expected: the consumer intentionally diverged from the shipped
  versions.
