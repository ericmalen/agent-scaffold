# Skills

## Purpose

On-demand knowledge packages. A skill bundles a workflow and (optionally)
detailed references, examples, and scripts. Copilot activates a skill when its
description matches the current task, or when the user types `/skill-name`.

## Progressive loading

Skills load in three stages — this is the whole point.

1. **Discovery** — Copilot reads only the `name` and `description` from each
   skill's frontmatter. Cost: nearly zero. You can install many skills without
   bloating context.
2. **Activation** — when the skill is relevant (or triggered), Copilot loads
   the `SKILL.md` body.
3. **Resource access** — Copilot follows Markdown links in the body to sibling
   files (`references/`, `examples/`, `scripts/`) only when it references them.

See
[`copilot-customization-reference.md#level-4-agent-skills`](../../docs/copilot-customization-reference.md#level-4-agent-skills)
for the authoritative behavior.

## Single-file vs. multi-file

- **Single-file** when the workflow fits in ~200 lines: one `SKILL.md`, no
  sibling files.
- **Multi-file** when the skill has detailed references, worked examples, or
  executable scripts: `SKILL.md` is the lean router; `references/`,
  `examples/`, and `scripts/` hold the detail.

If your `SKILL.md` body runs past ~200 lines, it probably needs decomposition.

## The meta-skills (start here)

Four meta-skills live in this folder. They are **the primary onboarding tool**
for this scaffold — they encode the conventions operationally so you don't have
to memorize them.

- [`create-skill`](./create-skill/SKILL.md) — scaffold a new skill.
- [`create-agent`](./create-agent/SKILL.md) — scaffold a new agent.
- [`create-prompt`](./create-prompt/SKILL.md) — scaffold a new prompt.
- [`create-instruction`](./create-instruction/SKILL.md) — scaffold a new path
  instruction.

Type `/create-skill` in chat to walk through creating your first skill.

### Note on slash-command names

VS Code ships built-in `/create-skill`, `/create-agent`, `/create-prompt`, and
`/create-instruction` commands that do broadly similar things (see
[`built-in-reference.md`](../../docs/built-in-reference.md)). The meta-skills
in this folder share those names deliberately — the goal is to override the
generic built-ins with versions that enforce this scaffold's conventions.

If `/create-skill` isn't producing conformant output, it likely means the
built-in fired instead of the scaffold's version. Confirm via **Chat: Open
Diagnostics** (Command Palette) that the meta-skill loaded. If you prefer the
built-ins, rename these meta-skills (e.g., `scaffold-skill`) or delete them;
if you prefer the scaffold's versions, ensure this folder is discoverable
(it is by default in a repo that contains `.github/skills/`).

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

- `name` — skill identifier, kebab-case, no namespace prefixes.
- `description` — max 1024 chars. Must include both **what it does** and
  **when to use it** — this string drives auto-activation.
- `argument-hint` — placeholder text shown when the skill is invoked as a slash command.
- `user-invocable` — when `false`, hides the skill from the `/` menu.
- `disable-model-invocation` — when `true`, requires manual `/` invocation
  (Copilot won't auto-activate).

See the
[skill frontmatter reference](../../docs/copilot-customization-reference.md#level-4-agent-skills)
for the full table.

## Filename convention

`{kebab-case-name}/SKILL.md` — the skill's folder name is its identifier.
