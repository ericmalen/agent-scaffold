# GitHub Copilot Customization Reference

A practical reference for customizing GitHub Copilot in a repository: what the customization primitives are, how they load, and how they compose.

Start at Level 1 and progress as needs grow. Every level delivers value on its own.

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
| **Repo instructions** | `AGENTS.md`                                          | Every interaction                                     | Repo-wide rules and conventions                                          |
| **Path instructions** | `.github/instructions/*.instructions.md`             | When editing files matching `applyTo` glob            | Layer- or language-specific conventions                                  |
| **Agents**            | `.github/agents/*.agent.md`                          | When the agent is invoked                             | Specialized persona with procedures, boundaries, and tool restrictions   |
| **Skills**            | `.github/skills/*/SKILL.md` (+ sibling files)        | When task matches skill description, or `/skill-name` | On-demand knowledge packages with optional scripts, examples, references |
| **Prompts**           | `.github/prompts/*.prompt.md`                        | When user types `/command`                            | Reusable entry points that route to agents with user input               |
| **Hooks**             | `.github/hooks/*` (or inline in agent frontmatter)   | Lifecycle events (session start, prompt submit, etc.) | Automated shell commands                                                 |

### How the layers compose

```
You type /feature (prompt)
  → routes to Feature Orchestrator (agent)
    → agent reads api.instructions.md (path instruction, auto-loaded)
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

**Trade-offs to know:**

- **Copilot Code Review** (the GitHub PR-review bot) reads `.github/copilot-instructions.md` and `.github/instructions/*.instructions.md`, but **not** `AGENTS.md`. If your team relies on Copilot Code Review for repo-wide rules, either: keep a copy at `.github/copilot-instructions.md` (sync manually), or move repo-wide rules into a path-scoped `*.instructions.md` with `applyTo: "**"`.
- **`/init`** still generates `.github/copilot-instructions.md`, not `AGENTS.md`. The scaffold's pattern: run `/init`, move the generated content into `AGENTS.md`, delete the generated file.
- **`.github/instructions/`, `.github/agents/`, `.github/prompts/`, `.github/skills/`** are Copilot-specific surfaces. Cross-tool teammates (Claude Code, Cursor, etc.) read `AGENTS.md` but do not auto-load those folders. Keep the highest-leverage rules in `AGENTS.md`.

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

Create `.github/instructions/` and add files scoped by glob:

```markdown
---
applyTo: "packages/api/**"
---

# API Conventions

- Layered architecture: controller → service → repository
- Zod validation middleware on all routes
- Bilingual mapping in service layer, not controllers
```

Multiple globs can be comma-separated: `applyTo: "packages/api/**,packages/shared/**"`.

These load automatically when Copilot edits matching files. No manual referencing.

### Monorepo parent-folder discovery

VS Code discovers instructions, agents, skills, and hooks from parent folders up to the repository root. This means a package-level `.github/` folder in `packages/api/.github/` will be picked up when working in that package, in addition to the root `.github/`. Enable with:

```jsonc
{ "chat.useCustomizationsInParentRepositories": true }
```

### When to use what

| Scope                                                   | Use                                                                     |
| ------------------------------------------------------- | ----------------------------------------------------------------------- |
| Applies to every file in the repo                       | Repo instructions (`AGENTS.md`)                                         |
| Applies to a specific directory, layer, or file pattern | Path instruction with `applyTo`                                         |
| Applies across _all_ your projects                      | User-level: `~/.copilot/instructions/`                                  |
| Applies across an entire org                            | GitHub org-level instructions (Business/Enterprise)                     |

---

## Level 2: Prompt Files

**Time to set up: 10 minutes per prompt. Saves time on repetitive tasks.**

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

Create `.github/agents/` and add `.agent.md` files:

```markdown
---
name: "Code Reviewer"
description: "Read-only code review against project standards."
tools: ["read", "search"]
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

- `.github/instructions/api.instructions.md` — consult for API conventions
- `docs/coding-standards.md` — consult for general standards
```

### Agent file anatomy

| Section                | Purpose                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| **Frontmatter**        | `name`, `description`, `tools` array, optional `model` and hooks                            |
| **Role statement**     | One line: what this agent does and what it never does                                       |
| **Procedures**         | Numbered checklist the agent follows                                                        |
| **Never** (boundaries) | Explicit rules — what the agent must not do                                                 |
| **Documents**          | Plain-text paths for lazy-load. The agent reads these via the `read` tool only when needed. |

**Note on the Documents section:** This scaffold uses plain-text paths (not Markdown links) by convention. The agent reads them on demand via the `read` tool, never up-front, which keeps the agent's always-on context small. Plain-text paths also visually distinguish agent Documents sections from skill bodies (which intentionally use Markdown links for progressive disclosure). VS Code does not currently follow Markdown links inside `.agent.md` files automatically — this convention is defensive against possible future behavior and aids visual scanning.

### Tools array — controls what the agent can do

| Tool                      | Capability                                         |
| ------------------------- | -------------------------------------------------- |
| `read`                    | Read files                                         |
| `search`                  | Search codebase                                    |
| `edit` / `editFiles`      | Modify files                                       |
| `execute` / `runCommands` | Run terminal commands                              |
| `todo`                    | Maintain a task checklist                          |
| `agent`                   | Invoke sub-agents                                  |
| `find_symbol`             | Language-aware symbol navigation (LSP-backed)      |

A read-only agent uses `["read", "search"]`. An implementation agent needs `["edit", "execute", "read", "search", "todo"]`. Tool names can differ slightly between VS Code and Copilot CLI — verify in the target surface.

### Agent-scoped hooks (preview)

Attach pre/post-processing logic to a specific agent via its frontmatter instead of a global hooks folder. Enable with:

```jsonc
{ "chat.useCustomAgentHooks": true }
```

Then in the agent's frontmatter:

```yaml
---
name: api-engineer
hooks:
  preRun: "npm run typecheck"
  postRun: "npm run lint"
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

Create `.github/skills/skill-name/SKILL.md`:

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
.github/skills/my-skill/
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
| `/create-instruction` | Generate a targeted instruction file from a description                                                             |
| `/create-prompt`      | Generate a prompt file from a description                                                                           |
| `/create-skill`       | Generate a skill from a description                                                                                 |
| `/create-agent`       | Generate an agent file from a description                                                                           |
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
  "chat.useNestedAgentsMdFiles": true,
  "chat.useClaudeMdFile": true,
  "chat.includeApplyingInstructions": true,
  // Default (false). When true, VS Code follows Markdown links inside
  // .instructions.md / copilot-instructions.md and eagerly loads the targets
  // recursively. Off here for predictable context size. (Does NOT affect
  // .agent.md or SKILL.md — those use separate code paths.)
  "chat.includeReferencedInstructions": false,

  // Monorepo discovery (parent folders up to repo root)
  "chat.useCustomizationsInParentRepositories": true,

  // Skills
  "chat.useAgentSkills": true,
  "chat.agentSkillsLocations": { ".github/skills": true },

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
| 1     | Create 1–2 path-specific instruction files for your main directories                    | Layer-specific suggestions improve        |
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
