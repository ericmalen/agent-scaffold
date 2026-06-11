---
name: blueprint-generator
description: Orchestration discovery step B7 — the rulebook for synthesizing docs/orchestration/blueprint.json from a repo profile plus decisions doc, mapping layers to specialist templates, policies to reviewer/QA specialists, and defaults for tiers, turn limits, and tools. Use when synthesizing an orchestration blueprint (typically driven by the plan-synthesizer agent). Not for instantiating templates.
---

# blueprint-generator

Maps `repo-profile.json` + `decisions.json` onto a `blueprint.json`
(`validateBlueprint` shape). Deterministic rules, no taste calls — when a
rule does not cover the repo, pick `generic-specialist` rather than invent.

## Specialist selection

One engineer specialist per CODE layer, template by stack evidence:

| Layer evidence (stack/deps) | templateId |
| --- | --- |
| React / Vue / frontend build tool | `ui-engineer` |
| HTTP server framework (Express, Fastify, …) | `api-engineer` |
| ORM / migrations (Prisma, …) | `db-engineer` |
| anything else (shared libs, CLIs, tools) | `generic-specialist` |

Policy-driven additions from `decisions.json`:

- always: `code-reviewer` (every `reviewGates` value needs one)
- `qaDepth` ≥ `unit-and-integration`: `qa-agent`
- `securityRequirements` ≠ `none`: `security-reviewer`

Always: one `feature-orchestrator` (templateId `orchestrator`).

## Slot values (from the profile, per agent)

Engineer specialists: `layer-path`, `stack`, `test-cmd` (the layer's
fields; a `null` testCmd blocks synthesis — report, don't invent),
`conventions` (joined from `conventions.*`, omitting nulls).
`code-reviewer`: `checklist-path`
(`docs/orchestration/checklists/review-checklist.md`), `conventions`.
Orchestrator: `tasks-path` (`tasks.md`), `handoff-log-path`
(`docs/orchestration/handoff-log.jsonl`), `dispatch-doc`
(`docs/orchestration/dispatch-rules.md`).

## Defaults

| Agent | modelTier | turnLimit | tools |
| --- | --- | --- | --- |
| engineer specialists | sonnet | 30 (20 for db) | Read, Grep, Glob, Edit, Write, Bash |
| code-reviewer / security-reviewer | opus | 15 | Read, Grep, Glob |
| qa-agent | sonnet | 20 | Read, Grep, Glob, Bash |
| feature-orchestrator | opus | 60 | Read, Grep, Glob, Edit, Write, Bash, Agent |

`evalRequirements.minGoldens: 2` everywhere. `dispatch_rules` defaults:
`{"subagent_max_scopes": 2, "agent_team_min_scopes": 3,
"agent_team_on_cross_repo": true, "pipeline_when": ["scheduled",
"multi_day"]}`. `docs`: dispatch-rules.md, tasks-format.md,
handoff-logging.md (under `docs/orchestration/`). Never set
`templateVersion` — pins live in the generation manifest.

## Gate

Run handoff-validator (sibling skill) on the candidate before writing.
