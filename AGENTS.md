# Project Name

<!-- TODO: Replace with your project's name and a one-paragraph overview.
     What is the project? What's the tech stack? What's the folder layout?

     Shortcut: run /init in Copilot Chat to auto-generate a starting point.
     Note: /init writes .github/copilot-instructions.md, not AGENTS.md —
     move the generated content here and delete the generated file.

     Keep this file under two pages — it loads on every interaction. -->

<!-- Note for template users: replace every `<!-- TODO: ... -->` block (including this one) before committing. -->

## Overview

TODO: 2–4 sentence summary.

## Architecture

<!-- TODO: Link to deeper docs if you have them. Keep this section to links,
     not full explanations. -->

## Conventions

<!-- TODO: List the non-obvious conventions an AI assistant can't infer from code.
     Examples:
     - Language/framework versions
     - Naming patterns
     - Testing approach
     - Where business logic belongs (e.g., service layer vs controller) -->

## Do Not

<!-- TODO: Universal rules. Examples:
     - No secrets in code
     - No `@ts-ignore` without justification
     - Never modify generated files -->

## More Context

For layer-specific rules, add a nested `AGENTS.md` (+ sibling `CLAUDE.md`) in
the relevant subdirectory.
For on-demand knowledge see `.claude/skills/`.
For specialized roles see `.claude/agents/`.

> **Cross-tool note:** this repo is wired for both GitHub Copilot and Claude
> Code. Shared agents and skills live in `.claude/agents/` and `.claude/skills/`
> — both tools read those folders natively. `AGENTS.md` is the canonical
> instructions file; `CLAUDE.md` imports it (`@AGENTS.md`) so Claude Code reads
> the same content. The Copilot-only `.github/prompts/` surface is the main
> exception. See
> [`docs/cross-tool-setup.md`](./docs/cross-tool-setup.md).
