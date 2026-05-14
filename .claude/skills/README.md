# Skills

## Purpose

On-demand knowledge packages. A skill bundles a workflow and (optionally)
detailed references, examples, and scripts. A tool activates a skill when its
description matches the current task, or when the user types `/skill-name`.

Skills live in `.claude/skills/`. **Both Claude Code and Copilot read this
folder natively** — it is in each tool's default skill search path, so one copy
serves both. See [`docs/cross-tool-setup.md`](../../docs/cross-tool-setup.md).

## Progressive loading

Skills load in three stages — this is the whole point.

1. **Discovery** — the tool reads only the `name` and `description` from each
   skill's frontmatter. Cost: nearly zero. You can install many skills without
   bloating context.
2. **Activation** — when the skill is relevant (or triggered), the tool loads
   the `SKILL.md` body.
3. **Resource access** — the tool follows Markdown links in the body to sibling
   files (`references/`, `examples/`, `scripts/`) only when it references them.

## Single-file vs. multi-file

- **Single-file** when the workflow fits in ~200 lines: one `SKILL.md`, no
  sibling files.
- **Multi-file** when the skill has detailed references, worked examples, or
  executable scripts: `SKILL.md` is the lean router; `references/`,
  `examples/`, and `scripts/` hold the detail.

If your `SKILL.md` body runs past ~200 lines, it probably needs decomposition.

## The meta-skills (start here)

Three meta-skills live in this folder. They are **the primary onboarding tool**
for this scaffold — they encode the conventions operationally so you don't have
to memorize them.

- [`create-skill`](./create-skill/SKILL.md) — scaffold a new skill.
- [`create-agent`](./create-agent/SKILL.md) — scaffold a new agent.
- [`create-nested-agents-md`](./create-nested-agents-md/SKILL.md) — scaffold a
  nested `AGENTS.md` to scope conventions to a subdirectory.

Type `/create-skill` in chat to walk through creating your first skill.

> There is no `create-prompt` meta-skill. Copilot prompt files have no Claude
> equivalent, so the cross-tool way to make a `/command` is a `user-invocable`
> skill — which is what `create-skill` produces. `.github/prompts/` remains as
> an optional Copilot-only extra.

### Note on slash-command names

VS Code ships built-in `/create-skill` and `/create-agent` commands that do
broadly similar things. The two meta-skills here share those names deliberately
— the goal is to override the generic built-ins with versions that enforce this
scaffold's conventions. (`create-nested-agents-md` has no built-in equivalent.)

If `/create-skill` isn't producing conformant output, the built-in may have
fired instead. Confirm the meta-skill loaded (Claude Code: check the `/` menu;
Copilot: **Chat: Open Diagnostics**). If you prefer the built-ins, rename these
meta-skills (e.g., `scaffold-skill`) or delete them.

## A worked example: `git-conventions`

Alongside the meta-skills, this scaffold ships one real skill as a reference
for what a finished skill looks like. Read
[`git-conventions/SKILL.md`](./git-conventions/SKILL.md) to see the multi-file
pattern in practice — a lean router with sibling references and examples,
frontmatter with both _what_ and _when_ in the description, and a
quick-reference block so common cases don't require following any links. The
skill bundles the
[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) spec
(commit messages only) with team-derived extensions for PR titles, PR
descriptions, and branch names — a useful pattern when codifying a cluster of
related conventions under one skill.

## Frontmatter fields

Skills follow the [Agent Skills](https://agentskills.io) open standard. Stick to
the fields **both tools understand** so one `SKILL.md` serves both:

- `name` — skill identifier, kebab-case, no namespace prefixes.
- `description` — must include both **what it does** and **when to use it**;
  this string drives auto-activation. (Copilot caps it at 1024 chars.)
- `argument-hint` — placeholder text shown when invoked as a slash command.
- `user-invocable` — when `false`, hides the skill from the `/` menu.
- `disable-model-invocation` — when `true`, requires manual `/` invocation.

Claude Code adds optional fields (`allowed-tools`, `model`, `effort`, `hooks`,
`paths`, `context`). Copilot **silently ignores** unknown fields, so they are
safe to use — just know they only take effect in Claude Code.

## Filename convention

`{kebab-case-name}/SKILL.md` — the skill's folder name is its identifier.
