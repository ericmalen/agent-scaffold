# ai-kit (kit development repo)

This is the **factory, not the house**: the repo that builds and ships AI-config
setups into other repositories. Nobody starts a project by cloning this repo —
adoption runs *from a target repo* against a shared clone of this kit.

## Overview

ai-kit installs a conformant AI-coding setup (Claude Code + VS Code Copilot,
one set of files) into consumer repos via a four-phase adoption pipeline
(inventory → plan → materialize → verify). Zero-dependency Node ≥ 20 (.mjs),
unit-tested, shell-agnostic.

## Architecture

- [`spec/rules.md`](./spec/rules.md) — single source of truth (R-IDs). Never
  restate a rule; reference its ID.
- [`spec/target-layout.md`](./spec/target-layout.md) — what an adopted repo
  looks like.
- [`docs/dev/V2-PLAN.md`](./docs/dev/V2-PLAN.md) — implementation plan
  (extract → route → materialize).

## Repo zones

| Zone | Role |
|---|---|
| `templates/` | Wiring skeletons materialized into every adopted repo (AGENTS.md/CLAUDE.md/settings skeletons + slot bases). |
| `scripts/` + `test/` | The engine. Dual-role: dev tooling here AND copied into targets as `.claude/ai-kit-adoption/scripts/`. |
| `.claude/` | This repo's live config AND the baseline shipped to every target. The `adopt-*` skills, `adoption-verifier` agent, and the baseline `ai-kit-check`, `docs`, `git-conventions`, `skill-creator`, `agent-creator` skills + `docs-auditor` agent are dual-role: loaded here AND installed path-for-path into targets (see `scripts/install-adoption.mjs`, the allowlist that decides what ships). `ai-kit-adopt` is the adoption entry point — run from this clone against a target path; deliberately NOT installed into targets. |
| `docs/` | Consumer-facing guides; `docs/dev/` is kit-process material. |
| `reports/` | Generated outputs (validation/audit reports). Gitignored. |

## Conventions

- Rule-ID indirection (R-51): docs and templates cite rules by R-ID only.
- All scripts zero-dependency Node ≥ 20, `node --test` for tests.
- Self-audit: `node scripts/audit.mjs` (this repo is itself adopted — marker in
  `.claude/ai-kit.json`).
- Generated reports go to `reports/`, never committed.

## Do Not

- Do not add payload to `.claude/` unless it is also wanted while developing
  the kit — everything there auto-loads here (v1's mistake; see dropped rules
  in spec). The installer allowlist (`scripts/install-adoption.mjs`) decides
  what ships to targets; `ai-kit-adopt` stays kit-only.
- Do not move `ADOPT.md` or rename `scripts/`, `templates/` — paths are
  load-bearing (`ai-kit-adopt` skill, `materialize.mjs`, `install-adoption.mjs`).
- Do not edit installed-asset copies in a target repo by hand during adoption —
  manifest + literals only (reproducibility gate).
- No secrets in code; no new dependencies without discussion.

## More Context

For on-demand workflows see `.claude/skills/` (adoption pipeline + validation).
For specialized roles see `.claude/agents/`.

> **Cross-tool note:** `AGENTS.md` is canonical; `CLAUDE.md` imports it
> (`@AGENTS.md`). Shared agents/skills in `.claude/` load in both Claude Code
> and Copilot. See [`docs/cross-tool-setup.md`](./docs/cross-tool-setup.md).
