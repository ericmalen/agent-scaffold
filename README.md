# ai-kit

## What this is

A scaffold for adding AI-coding customization to internal repos, wired for
**both GitHub Copilot and Claude Code** from one set of files. Ships the folder
structure, conventions, annotated `_example` files, and three meta-skills
(`new-skill`, `new-agent`, `layer-agents`) that scaffold new
assets to match the conventions.

No stack-specific or domain-specific content — you add those on top.

Shared agents and skills live in `.claude/agents/` and `.claude/skills/` — both
tools read those folders natively. `AGENTS.md` at the repo root is the canonical
instructions file;
`CLAUDE.md` imports it so Claude Code reads the same content. See
[`docs/cross-tool-setup.md`](./docs/cross-tool-setup.md) for how the dual-tool
wiring works.

> Note: GitHub.com's Copilot code review and cloud coding agent read
> `.github/copilot-instructions.md` and `.github/instructions/` most reliably.
> If your team leans on those, keep a root `.github/copilot-instructions.md`
> alongside `AGENTS.md` — see [`docs/copilot-customization-reference.md`](./docs/copilot-customization-reference.md).

## Who it's for

Developers setting up GitHub Copilot and/or Claude Code in a project for the
first time.

## Quick start

### Via CLI (recommended)

Clone this repo once to a shared tools location, then run `init` from any
project you want to scaffold:

```sh
git clone <this-repo-url> ~/tools/ai-kit
cd /path/to/my-project
node ~/tools/ai-kit/bin/ai-kit.mjs init --skills git-conventions --yes
```

The CLI detects whether you have existing AI resources (**brownfield**) or a
fresh repo (**greenfield**) and handles both correctly. Re-running with
`update` brings in changes without overwriting your edits.

```sh
# See what's installed and whether anything has drifted
node ~/tools/ai-kit/bin/ai-kit.mjs status

# Pull latest scaffold version (asks before overwriting locally modified files)
node ~/tools/ai-kit/bin/ai-kit.mjs update
```

### Manual (alternative)

Copy `.claude/`, `.github/`, `.vscode/`, `AGENTS.md`, and `CLAUDE.md` into an
existing repo by hand.

### After installing

1. Fill in the TODO sections of [`AGENTS.md`](./AGENTS.md). Leave `CLAUDE.md`
   unless you have Claude-specific notes — it imports `AGENTS.md`.
2. Open the repo in VS Code (Copilot extension) or Claude Code.
3. Try `/new-skill` to walk through creating your first skill.
4. Read [`docs/cross-tool-setup.md`](./docs/cross-tool-setup.md) and
   [`docs/conventions.md`](./docs/conventions.md) when ready to go deeper.

## What's inside

```
AGENTS.md                       — repo-wide instructions (TODO placeholder)
CLAUDE.md                       — imports AGENTS.md for Claude Code
.vscode/settings.json           — Copilot editor feature flags
.claude/
  settings.json                 — permissions/hooks (Claude Code only)
  agents/
    README.md                   — agent conventions + field reference
    example-reviewer.md         — annotated example agent
  skills/
    README.md
    new-skill/             — meta-skill: scaffold a new skill
    new-agent/             — meta-skill: scaffold a new agent
    layer-agents/  — meta-skill: scaffold a nested AGENTS.md
    git-conventions/            — a finished skill, as a reference
.github/
  prompts/
    README.md                   — Copilot-only prompt file guide
    _example.prompt.md          — annotated example prompt
docs/
  cross-tool-setup.md                  — how Copilot + Claude Code share this repo
  copilot-customization-reference.md   — authoritative Copilot reference
  conventions.md                       — this scaffold's conventions
  built-in-reference.md                — what ships out of the box with VS Code
  workflow-tips.md                     — working effectively with this system
  why-this-way.md                      — design rationale (optional reading)
```

Each asset-type folder has a `README.md` explaining the pattern and an example
file showing what "good" looks like.

## Next steps

- [`docs/cross-tool-setup.md`](./docs/cross-tool-setup.md) — how one set of
  files serves both tools.
- [`docs/conventions.md`](./docs/conventions.md) — the do's and don'ts.
- [`docs/copilot-customization-reference.md`](./docs/copilot-customization-reference.md)
  — authoritative reference for Copilot concepts.
- [`docs/built-in-reference.md`](./docs/built-in-reference.md) — what's
  available out of the box with VS Code + Copilot.
- [`docs/workflow-tips.md`](./docs/workflow-tips.md) — practical tips for
  working with this system effectively.
- [`docs/why-this-way.md`](./docs/why-this-way.md) — design rationale.

## License

Licensed under the MIT License. See [LICENSE](./LICENSE).
