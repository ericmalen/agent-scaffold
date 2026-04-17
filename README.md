# copilot-scaffold

## What this is

A scaffold for adding GitHub Copilot to internal repos. Ships the folder
structure, conventions, annotated `_example` files, and four meta-skills
(`create-skill`, `create-agent`, `create-prompt`, `create-instruction`) that
scaffold new assets to match the conventions.

It is a scaffold, not a distribution — no stack-specific or domain-specific
content. You add those on top.

This scaffold uses `.github/copilot-instructions.md` as its repo-wide
instructions file. `AGENTS.md` is a valid alternative (see the reference doc)
but is not shipped here.

## Who it's for

Developers setting up GitHub Copilot in a project for the first time.

## Quick start

1. Clone this repo or click **Use this template** on GitHub. (Alternatively:
   copy `.github/` and `.vscode/` into an existing repo.)
2. Fill in the TODO sections of [`.github/copilot-instructions.md`](./.github/copilot-instructions.md).
3. Open the repo in VS Code with the Copilot extension installed.
4. Try `/create-skill` to walk through creating your first skill.
5. Read [`docs/conventions.md`](./docs/conventions.md) when ready to go deeper.

## What's inside

```
.vscode/settings.json           — pre-enabled Copilot feature flags
.github/
  copilot-instructions.md       — repo-wide instructions (TODO placeholder)
  instructions/                 — path-scoped instructions + _example
  agents/                       — custom agents + _example
  prompts/                      — saved slash-command prompts + _example
  skills/
    README.md
    create-skill/               — meta-skill: scaffold a new skill
    create-agent/               — meta-skill: scaffold a new agent
    create-prompt/              — meta-skill: scaffold a new prompt
    create-instruction/         — meta-skill: scaffold a new instruction
docs/
  copilot-customization-reference.md   — authoritative Copilot reference
  conventions.md                       — this scaffold's conventions
  why-this-way.md                      — design rationale (optional reading)
```

Each asset-type folder has a `README.md` explaining the pattern and an
`_example.*.md` file showing what "good" looks like.

## Next steps

- [`docs/conventions.md`](./docs/conventions.md) — the do's and don'ts.
- [`docs/copilot-customization-reference.md`](./docs/copilot-customization-reference.md)
  — authoritative reference for Copilot concepts.
- [`docs/built-in-reference.md`](./docs/built-in-reference.md) — what's
  available out of the box with VS Code + Copilot.
- [`docs/workflow-tips.md`](./docs/workflow-tips.md) — practical tips for
  working with this system effectively.
- [`docs/why-this-way.md`](./docs/why-this-way.md) — design rationale.

## License / ownership

TODO: add license and ownership information.
