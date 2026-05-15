# GitHub Copilot Customization Reference

A practical reference for customizing GitHub Copilot in a repository: what the customization primitives are, how they load, and how they compose.

Start at Level 1 and progress as needs grow. Every level delivers value on its own.

> **Dual-tool note:** this repo is wired for both Copilot and Claude Code.
> Shared agents and skills live in `.claude/agents/` and `.claude/skills/` —
> Copilot reads those natively, alongside its own `.github/` paths. This doc is
> the deep reference for Copilot's customization system; for the cross-tool
> layout and what each tool reads, see [`cross-tool-setup.md`](./cross-tool-setup.md).

---

## Core Mental Model

Three ideas drive every decision below.

- **Copilot has no memory between sessions.** Every new chat starts from zero. The only persistent context comes from files in your repo.
- **Quality is proportional to context _relevance_, not context _volume_.** More is not better if most of it is irrelevant to the current task.
- **Every customization below exists to solve one problem: getting the right context to the model at the right time.**

---

## The Customization Layers

Six file types, each with different loading behavior. Ordered from "always on" to "on demand":

| Layer                 | File(s)                                              | When It Loads                                         | Purpose                                                                  |
| --------------------- | ---------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------ |
| **Repo instructions** | `AGENTS.md` (+ `CLAUDE.md` imports it)               | Every interaction                                     | Repo-wide rules and conventions                                          |
| **Path instructions** | `AGENTS.md` (nested, in subdirectories)              | When working anywhere in that subtree                 | Layer- or directory-specific conventions                                 |
| **Agents**            | `.claude/agents/*.md`                                | When the agent is invoked                             | Specialized persona with procedures, boundaries, and tool restrictions   |
| **Skills**            | `.claude/skills/*/SKILL.md` (+ sibling files)        | When task matches skill description, or `/skill-name` | On-demand knowledge packages with optional scripts, examples, references |
| **Prompts** (Copilot-only) | `.github/prompts/*.prompt.md`                   | When user types `/command`                            | Reusable entry points that route to agents with user input               |
| **Hooks**             | Agent frontmatter `hooks:` (Copilot); `.claude/settings.json` (Claude Code only) | Lifecycle events (session start, prompt submit, etc.) | Automated shell commands                                                 |

### How the layers compose

```
You type /feature (prompt)
  → routes to Feature Orchestrator (agent)
    → agent reads packages/api/AGENTS.md (nested AGENTS.md, auto-loaded in that subtree)
    → agent activates tdd-cycle (skill, on-demand)
    → agent reads workflow-standards.md (doc, via read tool)
    → all of this sits on top of AGENTS.md (always loaded)
```

---

## Level 1: Instructions (Start Here)

**Time to set up: 15 minutes. Immediate payoff.**

### Repo-wide instructions: `AGENTS.md`

This scaffold uses `AGENTS.md` at the repo root as the canonical repo-wide instructions file. `AGENTS.md` is an [open standard](https://agents.md) supported by Copilot, Claude Code, Cursor, Codex, Aider, Gemini CLI, Windsurf, and ~20 other tools. Enabled in VS Code with:

```jsonc
{
  "chat.useAgentsMdFile": true,
  "chat.useNestedAgentsMdFiles": true,
}
```

`chat.useNestedAgentsMdFiles` extends discovery to **nested** `AGENTS.md` files placed inside subdirectories — the mechanism for path-scoped instructions. See [Path-specific instructions](#path-specific-instructions) below.

**Trade-offs to know:**

- **Claude Code reads `CLAUDE.md`, not `AGENTS.md`.** This repo ships a `CLAUDE.md` that imports `AGENTS.md` via `@AGENTS.md`, so both tools share one source of truth. Edit `AGENTS.md`; leave `CLAUDE.md` alone. See [`cross-tool-setup.md`](./cross-tool-setup.md).
- **`/init`** still generates `.github/copilot-instructions.md`, not `AGENTS.md`. The scaffold's pattern: run `/init`, move the generated content into `AGENTS.md`, delete the generated file.
- **`.github/prompts/`** is the one Copilot-specific asset surface (prompts have no Claude equivalent). Agents and skills live in `.claude/`, which both tools read.
- **GitHub.com surfaces** — Copilot code review and the cloud coding agent reliably read `.github/copilot-instructions.md` and `.github/instructions/*.instructions.md` (the latter supports `applyTo` globs and `excludeAgent`). Their support for `AGENTS.md` — especially _nested_ `AGENTS.md` — is newer and less uniform. If your team depends on those server-side surfaces, keep a root `.github/copilot-instructions.md` alongside `AGENTS.md`.

### Content template

```markdown
# Project Name

## Overview

Brief description, tech stack (1–2 sentences each), monorepo structure.

## Conventions

- Language and framework versions
- Naming conventions, formatting, testing approach
- Links to deeper docs (not the docs themselves)

## Do Not

- Universal rules (no secrets, no `@ts-ignore`, etc.)
```

### Key principles

- Keep it under two pages. It loads on every interaction.
- Only include things Copilot can't infer from the code itself.
- Focus on non-obvious conventions and architectural decisions.
- Link to deep docs rather than inlining them.
- Run `/init` in chat to auto-generate a starting point.

### Path-specific instructions

When a convention applies to one directory or layer rather than the whole repo, scope it with a **nested `AGENTS.md`** — place an `AGENTS.md` file inside the subdirectory it applies to. With `chat.useNestedAgentsMdFiles: true` (enabled in this scaffold), Copilot loads it automatically when working anywhere in that subtree, on top of the root `AGENTS.md`.

```
repo/
├── AGENTS.md                    # repo-wide
└── packages/
    └── api/
        └── AGENTS.md            # adds API-layer conventions for packages/api/**
```

Example `packages/api/AGENTS.md`:

```markdown
# API Package

Conventions specific to this package. Repo-wide rules live in the root AGENTS.md.

## Conventions

- Layered architecture: controller → service → repository
- Zod validation middleware on all routes
- Bilingual mapping in the service layer, not controllers

## Do Not

- Never access the database directly from a controller
```

A nested `AGENTS.md` has no frontmatter and no glob — scope is by *location*, the file lives where it applies. It is the cross-tool open standard, discovered by Copilot, Claude Code, Cursor, Codex, Aider, and Gemini CLI alike.

> **Tradeoff:** the alternative — `.github/instructions/*.instructions.md` with an `applyTo` glob — is Copilot-specific but is the mechanism GitHub.com's Copilot code review and cloud coding agent read most reliably. This scaffold prefers nested `AGENTS.md` for editor and cross-tool coverage and does **not** ship `.github/instructions/` by default; if you depend on those server-side surfaces, add `.github/instructions/` files alongside the nested `AGENTS.md` — the two mechanisms coexist.

### Monorepo parent-folder discovery

VS Code discovers instructions, agents, skills, and hooks from parent folders up to the repository root. This means a package-level `.github/` folder in `packages/api/.github/` will be picked up when working in that package, in addition to the root `.github/`. Enable with:

```jsonc
{ "chat.useCustomizationsInParentRepositories": true }
```

This works alongside nested `AGENTS.md` discovery — a package can carry both its own `AGENTS.md` and a package-level `.github/` for agents, prompts, or skills.

### When to use what

| Scope                                                   | Use                                                                     |
| ------------------------------------------------------- | ----------------------------------------------------------------------- |
| Applies to every file in the repo                       | Repo instructions (root `AGENTS.md`)                                    |
| Applies to a specific directory or layer                | **Nested `AGENTS.md`** in that directory                                |
| Applies across _all_ your projects                      | User-level: `~/.copilot/instructions/`                                  |
| Applies across an entire org                            | GitHub org-level instructions (Business/Enterprise)                     |

---

## Level 2: Prompt Files

**Time to set up: 10 minutes per prompt. Saves time on repetitive tasks.**

> Prompt files are in public preview — the frontmatter schema may still shift.
> They are also a **Copilot-only** surface — Claude Code has no equivalent. For
> a cross-tool `/command`, write a `user-invocable` skill instead (Level 4).

Create `.github/prompts/` and add `.prompt.md` files for tasks you repeat:

```markdown
---
description: "Run tests and fix failures for the current file"
agent: agent
---

Run the tests for ${fileBasename} and fix any failures.
Test framework: vitest.
Follow TDD discipline — fix implementation, never tests.
```

Invoke with `/test-and-fix` in chat (filename minus `.prompt.md`).

### Frontmatter options

| Field         | What it does                                                                |
| ------------- | --------------------------------------------------------------------------- |
| `description` | Shows in the `/` menu                                                       |
| `agent`       | Routes to a specific agent (`agent`, `ask`, `plan`, or a custom agent name) |
| `model`       | Lock to a specific model (omit if the agent sets this)                      |
| `tools`       | Restrict tools for this prompt (omit if the agent defines them)             |

When a prompt routes to an agent, the agent's `model` and `tools` take precedence — don't duplicate.

### Available variables

| Variable                    | Value                               |
| --------------------------- | ----------------------------------- |
| `${file}`                   | Full path to active file            |
| `${fileBasename}`           | Filename only                       |
| `${fileDirname}`            | Directory of active file            |
| `${selection}`              | Currently selected text             |
| `${input:name:placeholder}` | Ask user for input when prompt runs |

### Good candidates for prompts

- Running and fixing tests
- Code review with specific criteria
- Scaffolding components/modules
- Generating documentation
- Commit message generation
- Any task you describe the same way every time

---

## Level 3: Custom Agents

**Time to set up: 30 minutes per agent. Essential for specialized workflows.**

Create `.claude/agents/` and add `.md` files in the Claude sub-agent format —
Claude Code reads them natively, and Copilot detects them there too:

```markdown
---
name: code-reviewer
description: Read-only code review against project standards. Never modifies code.
tools: Read, Grep, Glob
---

# Code Reviewer

You review code changes and provide structured feedback.
You **never modify code**.

## Procedures

1. Read all changed files.
2. Evaluate against coding standards.
3. Produce a PASS or NEEDS_FIX verdict with findings.

## Never

- Modify any file
- Suggest changes outside the current PR scope

## Documents

packages/api/AGENTS.md
docs/coding-standards.md
```

### Agent file anatomy

| Section                | Purpose                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| **Frontmatter**        | `name`, `description`, `tools` list; optional Claude-only fields (`model`, `permissionMode`, `hooks`) |
| **Role statement**     | One line: what this agent does and what it never does                                       |
| **Procedures**         | Numbered checklist the agent follows                                                        |
| **Never** (boundaries) | Explicit rules — what the agent must not do                                                 |
| **Documents**          | Plain-text paths for lazy-load. The agent reads these via the Read tool only when needed.   |

**Note on the Documents section:** This scaffold uses plain-text paths (not Markdown links) by convention. The agent reads them on demand via the Read tool, never up-front, which keeps the agent's always-on context small. Plain-text paths also visually distinguish agent Documents sections from skill bodies (which intentionally use Markdown links for progressive disclosure).

### Tools list — controls what the agent can do

Use **Claude tool names** in the comma-separated `tools` list; Copilot maps them
to its own tools automatically.

| Tool                    | Capability                          |
| ----------------------- | ----------------------------------- |
| `Read`                  | Read files                          |
| `Grep`                  | Search file contents                |
| `Glob`                  | Find files by pattern               |
| `Edit` / `Write`        | Modify / create files               |
| `Bash`                  | Run terminal commands               |

A read-only agent uses `Read, Grep, Glob`. An implementation agent adds `Edit,
Write, Bash`. Omitting `tools` grants all tools. See
[`.claude/agents/README.md`](../.claude/agents/README.md) for the full convention.

### Agent-scoped hooks (preview)

Attach lifecycle automation to a specific agent via its frontmatter instead of a global `.github/hooks/` folder. Enable with:

```jsonc
{ "chat.useCustomAgentHooks": true }
```

Then in the agent's frontmatter, map lifecycle events to command hooks. Event names are PascalCase — `SessionStart`, `UserPromptSubmit`, `PreToolUse`, `PostToolUse`, `PreCompact`, `SubagentStart`, `SubagentStop`, `Stop`:

```yaml
---
name: api-engineer
hooks:
  PostToolUse:
    - type: command
      command: "npm run lint"
      timeout: 30
  Stop:
    - type: command
      command: "npm run typecheck"
---
```

### Key principles

- Keep agents lean — behavior and references, not inlined knowledge.
- Documents section is a checklist of what to consult, not what to memorize.
- One agent, one responsibility — no "do everything" agents.
- This scaffold prefers **flat orchestration** as a default — orchestrators call all specialists directly. Nested subagents are available (`chat.subagents.allowInvocationsFromSubagents`, enabled here) up to a depth cap of 5, but there is **no cycle detection** and token cost compounds with depth. Reach for nesting only when a specialist genuinely needs its own specialists.

---

## Level 4: Agent Skills

**Time to set up: 20 minutes per skill. Best for reusable knowledge packages.**

Create `.claude/skills/skill-name/SKILL.md` (both Copilot and Claude Code read this folder):

```markdown
---
name: tdd-workflow
description: "TDD execution pattern. Activates when writing tests or implementing features."
argument-hint: "[feature name]"
user-invocable: true
disable-model-invocation: false
---

# TDD Workflow

## The Sequence

1. Write failing tests
2. Confirm they fail
3. Implement minimal code to pass
4. Run until green — fix implementation, never tests
5. Add edge cases

## References

- [Mock strategy](./references/mock-strategy.md)
- [Factory patterns](./references/factory-patterns.md)
```

### Frontmatter fields

| Field                      | Default | Purpose                                                                           |
| -------------------------- | ------- | --------------------------------------------------------------------------------- |
| `name`                     | —       | Skill identifier (no namespace prefixes)                                          |
| `description`              | —       | Max 1024 chars. Both _what it does_ and _when to use it_. Drives auto-activation. |
| `argument-hint`            | —       | Placeholder text shown when invoked as a slash command                            |
| `user-invocable`           | `true`  | When `false`, hides the skill from the `/` menu                                   |
| `disable-model-invocation` | `false` | When `true`, skill requires manual `/` invocation (no auto-activation)            |
| `context`                  | `inline`| Experimental. `inline` loads SKILL.md into the parent chat; `fork` runs the skill in an isolated subagent context. Use `fork` to keep large skills from polluting the parent transcript. |

> `infer` is deprecated. Use `disable-model-invocation` instead.

### How skills load (progressive, three levels)

1. **Discovery** — Copilot reads only `name` and `description` from frontmatter. Costs almost nothing.
2. **Activation** — when relevant (or triggered by `/skill-name`), Copilot loads the SKILL.md body.
3. **Resource access** — Copilot follows Markdown links to sibling files only when it references them.

You can install many skills without bloating context. Only the relevant one loads.

### Multi-file skill structure

```
.claude/skills/my-skill/
├── SKILL.md              # Core instructions (keep lean — the router)
├── references/           # Detailed docs loaded on demand
│   ├── api-reference.md
│   └── patterns.md
├── examples/             # Code examples loaded on demand
│   └── basic-usage.ts
└── scripts/              # Executable scripts
    └── helper.sh
```

Reference sibling files with Markdown links in SKILL.md (`[link text](./references/file.md)`). Copilot follows these links to load content when needed.

**The SKILL.md body should be a concise workflow with links, not an encyclopedia.** If your SKILL.md is over ~200 lines, it probably needs decomposition.

### Skills vs. instructions — when to use which

| Use instructions when...              | Use skills when...                              |
| ------------------------------------- | ----------------------------------------------- |
| The rule applies to almost every task | The knowledge is needed only for specific tasks |
| It's short (a few lines)              | It's detailed (examples, scripts, templates)    |
| It should be automatic                | It should load on demand                        |
| It's a coding convention              | It's a procedural workflow                      |

### Community skills

- [github/awesome-copilot](https://github.com/github/awesome-copilot) — community skills, agents, instructions, prompts
- [anthropics/skills](https://github.com/anthropics/skills) — reference skills (work in Copilot too, since skills are an open standard)

Always review shared skills before using them — they run with your tool permissions.

---

## Level 5: Orchestration (Advanced)

**Time to set up: days of iteration. High payoff for repeatable multi-step workflows.**

One agent (orchestrator) coordinates multiple specialists through a defined workflow.

### The pattern

```
Prompt (/feature)
  → Orchestrator Agent
    → Planner Agent (produces plan)
    → [HUMAN GATE: approve plan]
    → Database Agent
    → API Agent → Code Reviewer (loop until PASS)
    → UI Agent → Code Reviewer (loop until PASS)
    → Integration Test Agent
    → [HUMAN GATE: approve summary]
    → Release Agent
```

### Key design decisions

- **Flat architecture (default).** The orchestrator calls every specialist directly. This is the scaffold's preferred shape — easier to debug, easier to reason about, and observability is straightforward (every call shows up in the orchestrator's transcript). Nested subagents are technically supported (`chat.subagents.allowInvocationsFromSubagents`, enabled here; depth cap = 5; no cycle detection); use them only when a specialist legitimately needs its own helpers.
- **Human gates.** Mandatory approval checkpoints. Without these, autonomous orchestration is risky.
- **Validation gates.** Automated checks (compile, test, lint) between phases. A layer must pass its gate before the next phase starts.
- **Post-agent verification.** After every subagent call, the orchestrator checks `git diff` to confirm work was actually done. Catches silent failures.

---

## Agent Permissions and Execution Modes

Each session has a permission level:

| Level                     | Behavior                                                               |
| ------------------------- | ---------------------------------------------------------------------- |
| **Default**               | Agent asks before potentially destructive actions                      |
| **Bypass Approvals**      | Agent skips confirmation prompts but still stops on explicit gates     |
| **Autopilot** _(preview)_ | Agent self-approves, auto-retries on errors, runs until task completes |

Autopilot is powerful for scripted orchestrations but unsuitable for exploratory work. Treat it as a deliberate choice per session.

---

## Useful Chat Commands

| Command               | What it does                                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `/init`               | Auto-generate repo-wide instructions for your project                                                               |
| `/layer-agents` | Generate a nested `AGENTS.md` to scope conventions to a subdirectory (this scaffold's meta-skill)          |
| `/create-prompt`      | Generate a prompt file from a description (VS Code built-in)                                                        |
| `/new-skill`     | Generate a skill from a description (this scaffold's meta-skill; VS Code also has a built-in `/create-skill`)       |
| `/new-agent`     | Generate an agent file from a description (this scaffold's meta-skill; VS Code also has a built-in `/create-agent`) |
| `/skills`             | Open the Configure Skills menu                                                                                      |
| `/compact`            | Compress conversation history to free context space                                                                 |
| `/troubleshoot`       | Diagnose why instructions, skills, or agents didn't behave as expected; accepts `#session` to analyze past sessions |
| `/autoApprove`        | Toggle auto-approve for the current session                                                                         |

### Chat Customizations editor (preview)

Run **Chat: Open Chat Customizations** from the Command Palette for a unified UI to create and manage instructions, agents, skills, and plugins. Browse MCP and plugin marketplaces from the same view.

---

## Recommended Workspace Settings

Drop these into `.vscode/settings.json` to enable the customization features consistently:

```jsonc
{
  // Instructions
  "chat.useAgentsMdFile": true,
  // Nested AGENTS.md in subdirs — scopes conventions to a subtree (cross-tool).
  "chat.useNestedAgentsMdFiles": true,
  // Off: CLAUDE.md only imports AGENTS.md, which Copilot already reads.
  "chat.useClaudeMdFile": false,

  // Monorepo discovery (parent folders up to repo root)
  "chat.useCustomizationsInParentRepositories": true,

  // Skills — .claude/skills/ is in Copilot's default search path, so no
  // chat.agentSkillsLocations override is needed.
  "chat.useAgentSkills": true,

  // Agents / subagents
  "chat.useCustomAgentHooks": true,
  // Allow subagents to invoke subagents. Depth cap = 5; no cycle detection.
  "chat.subagents.allowInvocationsFromSubagents": true,

  // Terminal auto-approve (use cautiously)
  "chat.tools.terminal.enableAutoApprove": false,
  "chat.tools.terminal.autoApprove": []
}
```

Review each flag — some are preview features. Enable them deliberately. See `.vscode/settings.json` in this scaffold for the same set with full inline commentary.

---

## Recommended Progression

| Week  | What to do                                                                              | Expected outcome                          |
| ----- | --------------------------------------------------------------------------------------- | ----------------------------------------- |
| 1     | Fill in `AGENTS.md` with project overview and conventions                               | AI assistants stop suggesting wrong patterns |
| 1     | Add a nested `AGENTS.md` to your 1–2 main subdirectories for layer-specific conventions  | Layer-specific suggestions improve        |
| 2     | Create 2–3 prompt files for tasks you repeat daily                                      | Common workflows become one slash command |
| 2     | Try `/init` and review what it generates                                                | Baseline you can refine                   |
| 3     | Create your first agent for a specific role (reviewer, implementer)                     | Specialized behavior for specific tasks   |
| 3     | Create a skill for your most complex repeatable process                                 | Detailed knowledge loads only when needed |
| 4+    | Connect agents via prompts, add review loops                                            | Semi-automated workflows                  |
| Later | Orchestration with human gates; consider Autopilot for tight loops                      | Full lifecycle automation                 |

---

## Resources

- [VS Code Copilot Customization Overview](https://code.visualstudio.com/docs/copilot/customization/overview)
- [Custom Instructions](https://code.visualstudio.com/docs/copilot/customization/custom-instructions)
- [Prompt Files](https://code.visualstudio.com/docs/copilot/customization/prompt-files)
- [Custom Agents](https://code.visualstudio.com/docs/copilot/customization/custom-agents)
- [Agent Skills](https://code.visualstudio.com/docs/copilot/customization/agent-skills)
- [Context Engineering Guide](https://code.visualstudio.com/docs/copilot/guides/context-engineering-guide)
- [Best Practices](https://code.visualstudio.com/docs/copilot/best-practices)
- [AGENTS.md open standard](https://agents.md)
- [Awesome Copilot](https://github.com/github/awesome-copilot)
- [Anthropic Skills](https://github.com/anthropics/skills)
- [Agent Skills Specification](https://agentskills.io)
- [GitHub Docs: Adding Repository Custom Instructions](https://docs.github.com/copilot/customizing-copilot/adding-custom-instructions-for-github-copilot)
