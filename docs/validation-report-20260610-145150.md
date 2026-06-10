# ai-kit validation report — 2026-06-10 14:51 UTC

Fixture: mixed-messy
Work dir: /Users/ericmalen/aikit-validation/20260610-145150/fx-mixed-messy (removed after PASS)
Kit SHA: 04331e6d352c0c9a998d8fa3b8a15b89627682b3

## Summary
- Phases run: adopt-inventory, adopt-plan, adopt-materialize, adopt-verify (all succeeded)
- Assertion: PASS (validate-assert) — all mechanical checks and sentinels accounted
- Sabotage: not run (per request)

## Phase summaries (short)

### adopt-inventory
Inventory extraction succeeded. Gate: sweep candidates: 2 (AI triage required in plan phase).
Escalations: human triage required for 2 sweep candidates; start a fresh session and run adopt-plan.

### adopt-plan
Plan materialized into .adoption/manifest.json and .claude/rules/*. Gate: USER GATE 1 — present report headline + risk sections; do not proceed without explicit approval.
Escalations: choose canonical style (tabs vs spaces); deduplicate deployment guidance; confirm routing of CONTRIBUTING.md guidance.

### adopt-materialize
Materialization converged; audit: 0 errors, 10 warnings. Gate: adoption review report (verbatim included in full report file in repo).
Escalations: add frontmatter paths to generated rules; resolve broken reference(s); confirm settings.json contents.

### adopt-verify
Independent verification passed. Gate: USER GATE 2 — present .adoption/report.md and verifier matrices; human must merge & delete ai-kit-adoption branch.
Escalations: human must MERGE and DELETE ai-kit-adoption branch; adjudicate intentional rule contradictions.

## Assertion result (validate-assert JSON)

{
  "fixture": "mixed-messy",
  "dir": "/Users/ericmalen/aikit-validation/20260610-145150/fx-mixed-messy",
  "checkExit": 0,
  "auditExit": 0,
  "sentinels": {
    "SENTINEL-009-teal-bittern": "in-output",
    "SENTINEL-010-navy-plover": "in-output",
    "SENTINEL-011-dupe-block-gannet": "in-output",
    "SENTINEL-012-coral-avocet": "in-output",
    "SENTINEL-013-flax-godwit": "in-output",
    "SENTINEL-014-pearl-snipe": "in-output",
    "SENTINEL-015-moss-curlew": "in-output"
  },
  "mergedBytesPct": null,
  "offScopeDiff": [],
  "pass": true,
  "failures": []
}

## Teardown
Fixture passed → directory removed: /Users/ericmalen/aikit-validation/20260610-145150/fx-mixed-messy

## Verdict
Validation run: PASS for mixed-messy. Mechanical checks pass; several human decisions remain (listed as escalations above). This report validates the adoption flow end-to-end (no sabotage). Copilot-only note: subagent runs were automated for validation; follow-up human review required for merge/branch decisions and escalations.

