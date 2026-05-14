# Integration rules

The decision framework for brownfield migration: given a piece of existing
AI-config content, **where does it belong in the scaffold's structure?**

The scaffold's organizing principle (see
[`docs/cross-tool-setup.md`](../../../../docs/cross-tool-setup.md)):

- `AGENTS.md` is the **canonical** instructions file. `CLAUDE.md` just imports it
  (`@AGENTS.md`).
- Skills live in `.claude/skills/`, agents in `.claude/agents/` — both tools read
  them natively.
- `.github/` is Copilot-only legacy surface; the scaffold standardizes on
  `AGENTS.md` + `.claude/`.

## Per content kind

### `CLAUDE.md` (sidecar'd)

The consumer's `CLAUDE.md` usually holds real project rules. The scaffold's
`CLAUDE.md.scaffold` is just `@AGENTS.md`.

- **Project rules / conventions** → move into `AGENTS.md` under appropriate
  headings. They are tool-agnostic; `AGENTS.md` is where they belong.
- **The `@AGENTS.md` import line** → ensure it is line 1 of the merged `CLAUDE.md`.
- **Genuine Claude-only notes** (rare — e.g. "in Claude Code, prefer the X
  subagent") → keep them in `CLAUDE.md` *below* the `@AGENTS.md` import.
- End state: `CLAUDE.md` is `@AGENTS.md` plus any Claude-only notes; the rules now
  live in `AGENTS.md`; delete `CLAUDE.md.scaffold`.

### `AGENTS.md` (sidecar'd)

The consumer already has an `AGENTS.md` — it is already canonical. The scaffold's
`AGENTS.md.scaffold` is a TODO-placeholder template.

- Merge any **structural sections** from the template the consumer is missing
  (e.g. a "Do Not" section) — but as empty/short headings, not TODO placeholders.
- **Never** downgrade the consumer's real content to a TODO placeholder.
- Delete `AGENTS.md.scaffold`.

### `.claude/settings.json` (sidecar'd)

- `deny` — **union** the two lists; always keep the scaffold's `.env` deny rules.
- `allow` — keep the consumer's list as-is.
- `hooks` — merge: keep the consumer's hooks, add any the scaffold ships.
- Delete `.claude/settings.json.scaffold`.

### `.vscode/settings.json` (sidecar'd)

The consumer's file usually has unrelated editor settings. The scaffold's version
adds AI-feature keys.

- Merge **only** the AI keys from the sidecar — the `vscodeAiKeys` set in
  `scaffold.config.json` (`chat.useAgentsMdFile`, `chat.useAgentSkills`,
  `chat.useNestedAgentsMdFiles`, etc.).
- Leave every non-AI key in the consumer's file untouched.
- Delete `.vscode/settings.json.scaffold`.

### `.github/copilot-instructions.md` (usually `preexistingUnmanaged`)

Legacy Copilot-only instructions. The scaffold makes `AGENTS.md` canonical, and
Copilot reads `AGENTS.md` natively — so this file is redundant once its content
moves.

- Fold any substantive instructions into `AGENTS.md`.
- Replace the file with a thin pointer (`Instructions live in AGENTS.md.`) or
  remove it — ask the user which.

### `.github/instructions/*.instructions.md` (usually `preexistingUnmanaged`)

Path-scoped Copilot instructions. The scaffold's cross-tool equivalent is a nested
`AGENTS.md` (+ sibling `CLAUDE.md`) in the scoped directory.

- Recommend running `/scaffold-nested-agents-md` to port each one, **or** leave
  as-is if the consumer wants to keep Copilot-only path scoping. Do not auto-port.

### `.github/chatmodes/*` (usually `preexistingUnmanaged`)

No scaffold equivalent. Leave as-is; note it is intentionally unmanaged.

### Content overlapping an opt-in skill

If consumer prose duplicates a skill the scaffold offers (e.g. commit-message
conventions overlap `git-conventions`):

- **Skill already installed** → drop the duplicated prose from the merged file;
  point at the skill instead.
- **Skill not installed** → do **not** auto-install. Tell the user the skill
  exists and offer `agent-scaffold init --skills <name>`.

## Detecting overlap with an un-installed opt-in skill

1. Read the opt-in `skills` block in `scaffold.config.json` — each entry has a
   `description` naming its domain.
2. Grep the consumer's content for that domain's vocabulary (for
   `git-conventions`: "conventional commit", "feat:", "fix:", "PR title", "branch
   name").
3. On a match, surface it as a **recommendation** — never install silently.
