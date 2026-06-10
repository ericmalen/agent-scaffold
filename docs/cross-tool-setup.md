# Cross-Tool Setup: Claude Code + GitHub Copilot

This repo is wired so **one set of agents and skills serves both Claude Code and
GitHub Copilot**. This doc explains how — what each tool reads, where things
live, and why.

## The key fact

`.claude/` is the shared home for agents and skills, not `.github/`.

Copilot (in VS Code) reads `.claude/skills/` and `.claude/agents/` natively —
they are in its default search paths. Claude Code reads nothing under
`.github/`. So `.claude/` is the directory both tools load agents and skills
from. (One nuance: in `.claude/settings.json`, the `hooks` block is read by
both tools, but `permissions` is Claude-Code-only — see
[Settings & hooks](#settings--hooks) below.)

| Surface        | Lives in                | Claude Code     | Copilot                                     |
| -------------- | ----------------------- | --------------- | ------------------------------------------- |
| Instructions   | `AGENTS.md`             | via `CLAUDE.md` | native                                      |
| Instructions   | `CLAUDE.md`             | native          | off (imports AGENTS.md)                     |
| Path rules     | `.claude/rules/`        | native          | native                                      |
| Skills         | `.claude/skills/`       | native          | native (default search path)                |
| Agents         | `.claude/agents/`       | native          | native (detects + maps tools)               |
| Hooks          | `.claude/settings.json` | native          | native (same format, R-46)                  |
| Permissions    | `.claude/settings.json` | native          | — (editor flags in `.vscode/settings.json`) |

## Layout

```
AGENTS.md                  canonical instructions (template)
CLAUDE.md                  `@AGENTS.md` import + optional Claude-only notes
.claude/
  settings.json            permissions + hooks (committed)
  settings.local.json      personal overrides (gitignored)
  rules/                   path-scoped rules (default mechanism, R-52)
  agents/                  custom agents — Claude subagent format
  skills/                  skills + meta-skills
.vscode/settings.json      Copilot editor feature flags
```

## Instructions — `AGENTS.md` + `CLAUDE.md`

`AGENTS.md` is the single source of truth. It is the open standard read by
Copilot, Cursor, Codex, Aider, Gemini CLI, and others.

Claude Code does **not** read `AGENTS.md` — only `CLAUDE.md`. So the repo ships a
`CLAUDE.md` whose first line is `@AGENTS.md` (Claude's import syntax). Claude
reads `CLAUDE.md`, which pulls in `AGENTS.md`. Add Claude-only guidance below the
import if you ever need it; most teams won't.

Edit `AGENTS.md`. Leave `CLAUDE.md` alone unless you have Claude-specific notes.

## Skills — `.claude/skills/`

One copy, both tools. Skills follow the [Agent Skills](https://agentskills.io)
open standard. Copilot also reads `.github/skills/` and the tool-agnostic
`.agents/skills/`; ai-kit standardizes on `.claude/skills/` because it is
the one location Claude Code reads too. Stick to the frontmatter fields both
tools understand (`name`, `description`, `argument-hint`, `user-invocable`,
`disable-model-invocation`); Claude-only fields are silently ignored by Copilot,
so they're safe to add.

`user-invocable` skills appear as `/name` in both tools — this is the
**cross-tool slash-command mechanism**. Run `/skill-creator` to create one.

## Agents — `.claude/agents/`

Agents use the **Claude subagent format** (`.claude/agents/{name}.md`):
frontmatter with `name`, `description`, and a comma-separated `tools` list using
Claude tool names (`Read, Grep, Glob, Bash, Edit, Write`). Claude Code reads this
natively; Copilot detects the same files and maps the tool names to its own.
Claude-only fields (`model`, `permissionMode`, …) are safe — Copilot ignores
them. Run `/agent-creator` to create one.

There is no separate prompts surface: cross-tool slash commands ship as
`user-invocable` skills (R-54).

## Settings & hooks

- `.claude/settings.json` — committed. `permissions` is **Claude Code only**
  (Copilot's equivalents live in `.vscode/settings.json`); the `hooks` block is
  read by **both** tools in the same format (R-46). Ships with a starter `deny`
  rule for `.env` files.
- `.claude/settings.local.json` — personal, gitignored.
- `.vscode/settings.json` — Copilot editor feature flags. `chat.useClaudeMdFile`
  is **off** here: Copilot already reads `AGENTS.md`, so reading `CLAUDE.md`
  (which just imports it) would double-load.

## Path-scoped instructions

The default mechanism is **path-scoped rules**: `.claude/rules/<scope>.md` with
`paths:` glob frontmatter (R-52). Both tools read these and load them
automatically when working on matching files. One scope per file; a repo uses
rules XOR nested AGENTS.md, never both (R-53).

Known tool caveat: path-scoped rules trigger when matching files are *read* —
they may not load while creating a brand-new matching file. Keep universal
musts in root `AGENTS.md`.

The **compat variant** (chosen at adoption when the team also uses other
AGENTS.md-ecosystem tools) is a nested `AGENTS.md` per subtree. Copilot reads
nested `AGENTS.md` files; Claude Code reads nested `CLAUDE.md` files (not
nested `AGENTS.md`) — so every nested `AGENTS.md` needs a sibling `CLAUDE.md`
containing `@AGENTS.md`, mirroring the root-level pairing (R-13..R-16).

## Verify it works

- **Copilot (VS Code):** the `/` menu lists the skills; the agent picker
  shows `example-reviewer`; `AGENTS.md` loads. Confirm via **Chat: Open
  Diagnostics**.
- **Claude Code:** the `/` menu lists the same skills; `example-reviewer` is
  available as a subagent; `CLAUDE.md` (→ `AGENTS.md`) appears in context.
