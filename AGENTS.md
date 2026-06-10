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
| `catalog/` | Optional skills/agents installed into consumer repos (manifest: `catalog/catalog.json`). NOT loaded in this repo. |
| `templates/` | Mandatory wiring materialized into every adopted repo (file skeletons + the required `ai-kit-check` skill). |
| `bootstrap/` | One-time user-level skill (`~/.claude/skills/`), the adoption entry point. |
| `scripts/` + `test/` | The engine. Dual-role: dev tooling here AND copied into targets as `.claude/ai-kit-adoption/scripts/`. |
| `.claude/` | This repo's live config. The `adopt-*` skills and `adoption-verifier` agent are dual-role: used here AND installed path-for-path into targets (see `scripts/install-adoption.mjs`). |
| `docs/` | Consumer-facing guides; `docs/dev/` is kit-process material. |
| `reports/` | Generated outputs (validation/audit reports). Gitignored. |

## Conventions

- Rule-ID indirection (R-51): docs and templates cite rules by R-ID only.
- All scripts zero-dependency Node ≥ 20, `node --test` for tests.
- Self-audit: `node scripts/audit.mjs` (this repo is itself adopted — marker in
  `.claude/ai-kit.json`).
- Generated reports go to `reports/`, never committed.

## Do Not

- Do not put catalog/template payload under `.claude/` — it would auto-load
  while developing the kit (v1's mistake; see dropped rules in spec).
- Do not move `ADOPT.md` or rename `scripts/`, `templates/` — paths are
  load-bearing (bootstrap skill, `materialize.mjs`, `install-adoption.mjs`).
- Do not edit installed-asset copies in a target repo by hand during adoption —
  manifest + literals only (reproducibility gate).
- No secrets in code; no new dependencies without discussion.

## More Context

For on-demand workflows see `.claude/skills/` (adoption pipeline + validation).
For specialized roles see `.claude/agents/`.

> **Cross-tool note:** `AGENTS.md` is canonical; `CLAUDE.md` imports it
> (`@AGENTS.md`). Shared agents/skills in `.claude/` load in both Claude Code
> and Copilot. See [`docs/cross-tool-setup.md`](./docs/cross-tool-setup.md).
