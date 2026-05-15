# Cross-Tool Setup: Claude Code + GitHub Copilot

This repo is wired so **one set of agents and skills serves both Claude Code and
GitHub Copilot**. This doc explains how — what each tool reads, where things
live, and why.

## The key fact

`.claude/` is the shared home for agents and skills, not `.github/`.

Copilot (in VS Code) reads `.claude/skills/` and `.claude/agents/` natively —
they are in its default search paths. Claude Code reads nothing under
`.github/`. So `.claude/` is the directory both tools load agents and skills
from. (One exception: `.claude/settings.json` is Claude-Code-only — Copilot has
its own config. See [Settings & hooks](#settings--hooks) below.)

| Surface          | Lives in              | Claude Code        | Copilot                          |
| ---------------- | --------------------- | ------------------ | -------------------------------- |
| Instructions     | `AGENTS.md`           | via `CLAUDE.md`    | native                           |
| Instructions     | `CLAUDE.md`           | native             | off (imports AGENTS.md)          |
| Skills           | `.claude/skills/`     | native             | native (default search path)     |
| Agents           | `.claude/agents/`     | native             | native (detects + maps tools)    |
| Settings/hooks   | `.claude/settings.json` | native           | — (uses `.vscode/settings.json`) |
| Prompts          | `.github/prompts/`    | —                  | native (Copilot-only)            |

## Layout

```
AGENTS.md                  canonical instructions (template)
CLAUDE.md                  `@AGENTS.md` import + optional Claude-only notes
.claude/
  settings.json            shared permissions/hooks (committed)
  settings.local.json      personal overrides (gitignored)
  agents/                  custom agents — Claude sub-agent format
  skills/                  skills + meta-skills
.github/
  prompts/                 Copilot-only slash-command prompts (optional)
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
`.agents/skills/`; this scaffold standardizes on `.claude/skills/` because it is
the one location Claude Code reads too. Stick to the frontmatter fields both
tools understand (`name`, `description`, `argument-hint`, `user-invocable`,
`disable-model-invocation`); Claude-only fields are silently ignored by Copilot,
so they're safe to add.

`user-invocable` skills appear as `/name` in both tools — this is the
**cross-tool slash-command mechanism**. Run `/new-skill` to scaffold one.

## Agents — `.claude/agents/`

Agents use the **Claude sub-agent format** (`.claude/agents/{name}.md`):
frontmatter with `name`, `description`, and a comma-separated `tools` list using
Claude tool names (`Read, Grep, Glob, Bash, Edit, Write`). Claude Code reads this
natively; Copilot detects the same files and maps the tool names to its own.
Claude-only fields (`model`, `permissionMode`, …) are safe — Copilot ignores
them. Run `/new-agent` to scaffold one.

## Prompts — Copilot-only

Copilot prompt files (`.github/prompts/*.prompt.md`) have no Claude Code
equivalent — `agent:` routing and `${input:…}` variables don't port. The folder
is kept as an optional extra for Copilot-only teams. For a cross-tool `/command`,
write a `user-invocable` skill instead.

## Settings & hooks

- `.claude/settings.json` — committed. **Claude Code only** — it reads this for
  `permissions` and `hooks`. Copilot does **not** read `.claude/settings.json`;
  in VS Code it uses `.vscode/settings.json` instead. Ships with a starter
  `deny` rule for `.env` files.
- `.claude/settings.local.json` — personal, gitignored (Claude Code only).
- `.vscode/settings.json` — Copilot editor feature flags. `chat.useClaudeMdFile`
  is **off** here: Copilot already reads `AGENTS.md`, so reading `CLAUDE.md`
  (which just imports it) would double-load.

## Nested scoping

Copilot reads nested `AGENTS.md` files; Claude Code reads nested `CLAUDE.md`
files (not nested `AGENTS.md`). So `/layer-agents` drops **both** in
the target directory: a nested `AGENTS.md` with the scoped rules, and a sibling
`CLAUDE.md` containing `@AGENTS.md` — mirroring the root-level pairing.

## Verify it works

- **Copilot (VS Code):** the `/` menu lists the skills; the `@` / agent picker
  shows `example-reviewer`; `AGENTS.md` loads. Confirm via **Chat: Open
  Diagnostics**.
- **Claude Code:** the `/` menu lists the same skills; `example-reviewer` is
  available as a subagent; `CLAUDE.md` (→ `AGENTS.md`) appears in context.
