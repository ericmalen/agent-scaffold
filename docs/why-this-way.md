# Why This Way

Optional reading. Design rationale for readers curious about the choices baked
into ai-kit. Skip this and go to [`conventions.md`](./conventions.md) if
you just want the rules.

## Why ai-kit, not a fork

The author of ai-kit maintains a mature Copilot setup in a production
repo. Copying it wholesale would ship stack-specific and domain-specific
content — layering rules, framework conventions, internal workflow names — that
would require subtraction before addition in any other project.

ai-kit inverts that. You start with the structure and conventions, then add
your own content. No deleting before building.

## Why a shared `.claude/` home

This repo targets both GitHub Copilot and Claude Code. One directory is read
natively by both for agents and skills: `.claude/`. Copilot's default search
paths include `.claude/skills/` and `.claude/agents/`; Claude Code reads nothing
under `.github/`. So agents and skills live in `.claude/` — one copy, both
tools, no symlinks, no drift. (`.claude/settings.json` is the exception: Claude
Code only — Copilot uses `.vscode/settings.json`.) `.github/` keeps only the
Copilot-only `prompts/` surface. See [`cross-tool-setup.md`](./cross-tool-setup.md).

## Why meta-skills

The headline feature of ai-kit is **skills-as-tooling**. Three meta-skills
— `new-skill`, `new-agent`, `layer-agents` — walk you through
producing new assets that conform to the conventions.

Prose teaches conventions slowly. Tooling teaches them the first time you use
them. Typing `/new-skill` and being asked the three questions the skill
enforces is faster than reading a style guide, and it produces a file that is
already conformant.

## Why lazy-load by default

Context relevance beats context volume. Model quality degrades when it is fed
references that don't apply to the current task.

- Agent `## Documents` sections use plain-text paths so the agent opens docs on
  demand instead of every time it loads.
- Skills use progressive disclosure: frontmatter during discovery, body on
  activation, sibling files only when linked.

Eager loading everything is cheap to write and expensive to run. Lazy loading is
the default here.

## Why one README per folder

Per-asset READMEs sprawl quickly. A folder with 15 agents and 15 READMEs
duplicates the same framing 15 times — and drifts when conventions change.

One README per asset-type folder covers the same ground with less maintenance.
The READMEs explain the pattern. The `_example` files show what good looks
like. Individual assets stay lean.

## Why annotated examples instead of blank templates

A blank template with TODOs tells you where to type. An annotated example shows
you what to type and why it belongs there.

The meta-skills provide the templates (paste-ready, stub content). The
`_example.*.md` files provide the annotated versions with inline comments
explaining the non-obvious choices. Together they cover both modes — "I just
need a starting point" and "I want to see a real one."

## Why flat orchestration (by default)

Both Copilot and Claude Code support nested subagents (a subagent invoking
subagents). Token cost compounds with depth, and recursive chains are easy to
introduce by accident and hard to debug.

ai-kit prefers a **flat topology** as the default: one orchestrator
calls every specialist directly. Reasons:

- Easier to debug — every call appears in the orchestrator's transcript.
- Easier to reason about — no implicit depth.
- Cheaper — no compounding subagent invocations.
- Harder to accidentally make recursive — flat agents can't chain into a
  five-deep loop.

ai-kit does not ship an orchestration layer in v1. When you add one,
review loops and human gates go in the orchestrator, not between specialists.
Nesting is available when a specialist legitimately needs its own helpers —
treat it as a deliberate choice, not the default.
