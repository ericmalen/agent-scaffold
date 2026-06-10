# ai-kit v2 — Plan (Phase 4: finalization & release)

**Status: Phases 0–3 COMPLETE.** Evidence: [phase3-results.md](phase3-results.md)
(8 fixtures × sandbox + Claude Code + Copilot columns, sabotage 3/3, zero
silent losses, no pivot trigger) and [docs-package-demo.md](docs-package-demo.md)
(docs standard package). Target state: `spec/rules.md` + `spec/target-layout.md`.
The pivot plan is retired — the extract→route→materialize architecture is
validated on both tools.

## Binding constraints (do not regress)

- Manifest op vocabulary is dispositions only — never add input-classification
  ops or grow an input taxonomy in code.
- Honest guarantee wording everywhere: moves/splits conserved by construction;
  drops/merges visible-and-reviewed, not prevented.
- Sequential single-writer inside one adoption; fresh context per phase; the
  verifier never runs in the context that authored the manifest (subagent
  orchestration is validated on both tools; silent inline phase execution
  remains prohibited).
- Audit checks the target state only; findings keyed by R-ID; spec/rules.md is
  the single source of truth.

## Phase 4 — detailed plan

### 4.1 Kit-repo CI (rule↔check integrity + regression gate)

- New `scripts/rule-check-map.mjs`: parses spec/rules.md for mechanical R-IDs,
  scans `scripts/lib/audit/checks.mjs` for emitted R-IDs; fails on a
  mechanical rule with no check or a check emitting an unknown rule (R-51).
- ADO pipeline (primary) + GH Actions mirror: `npm test` → rule-check-map →
  `build-starter` into temp + `audit --strict` on the output (starter must
  stay audit-clean) → publish starter as artifact.
- Acceptance: pipeline green on the kit; deliberately orphaning a rule fails it.

### 4.2 Consumer CI templates (drift gate for adopted repos)

- `templates/ci/audit-strict.github.yml` + `.ado.yml` (pattern: existing
  docs-impact templates): shallow-clone kit (URL from `.claude/ai-kit.json`
  `kitRepo`) → `node <kit>/scripts/audit.mjs --root . --strict`.
- adopt-plan manifest reference: offer these installs when the target repo has
  CI, alongside the docs-impact templates.
- Acceptance: template run passes on the starter repo, fails on a seeded
  R-44 violation.

### 4.3 Claude Code audit Stop-hook (adoption-session enforcement upgrade)

- Optional hooks block for the installed `.claude/settings.json` (offered at
  adoption, CC-labeled): Stop → run audit if a kit checkout is available
  (`~/tools/ai-kit`), exit 0 always (informational nudge, mirrors docs-nudge
  pattern; never blocks).
- Acceptance: hook fires in a Claude Code session on an adopted repo with
  findings; silent when clean or kit absent.

### 4.4 Template enhancement: collapsible empty sections

- Materializer: a template section marked `<!-- ai-kit:optional -->` is
  removed entirely (heading through next heading) when its slot receives no
  content. Mark Overview/Architecture/More Context optional in
  templates/AGENTS.md (Do Not stays mandatory — R-03).
- Fixes the recurring "empty skeleton headings" finding from all three
  validation columns. Acceptance: greenfield output has no empty sections;
  round-trip + slot tests stay green; build-starter output audit-clean.

### 4.5 Docs consolidation + README rewrite

- Rewrite root README for v2 (what it is, one-prompt adoption story, starter
  repo, validate-adoption, catalog).
- Update or fold the remaining v1-era docs (cross-tool-setup,
  copilot-customization-reference, built-in-reference, why-this-way,
  workflow-tips) against spec/rules.md — rules referenced by R-ID, no
  restated thresholds (R-51 discipline), no references to removed surfaces
  (prompts, v1 CLI).
- Acceptance: kit self-audit clean; no broken references; grep finds no
  `bin/ai-kit.mjs`, `/migrate`, `/optimize`, or prompts-surface mentions.

### 4.6 Cutover (joint)

- Me: final sweep (npm test, kit self-audit, one validate-adoption smoke run),
  tag `v2.0.0`.
- Owner: push to ADO (until then ADO serves v1), revoke the embedded ADO PAT
  and the Claude OAuth token used during validation, confirm Node ≥ 20 on
  colleague machines.
- Done = a colleague can: clone the starter for a new repo, or paste the
  one-prompt bootstrap in any existing repo, with no involvement from us.

## Owner checklist (outside Phase 4 build)

1. Revoke Claude OAuth token (validation done) — immediate.
2. Revoke ADO PAT in the `ado` remote; re-auth cleanly.
3. Push v2 to ADO; verify a fresh clone bootstraps.
4. Node ≥ 20 fleet check.
