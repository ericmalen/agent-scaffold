# Phase 3 results — sandbox column COMPLETE (June 2026)

Provenance: **CC-real** = actual Claude Code v2.1.170 headless · **sandbox** =
pipeline driven directly with fresh-context subagent verifiers (faithful to the
fresh-session model) · **owner** = pending interactive runs (full Claude Code UX
+ entire Copilot column) — those remain the go/no-go gate for tool integration.

## Fixture matrix (sandbox column)

| Fixture | Phases | Gates (check/audit) | Sentinels | Merged-bytes | Verdict |
|---|---|---|---|---|---|
| greenfield-empty | installs-only | 0 findings | n/a | 0% | ✅ (test-suite covered) |
| greenfield-code | installs-only | 0 findings | n/a | 0% | ✅ (test-suite covered) |
| mixed-messy | full, incl. CC-real phase 1 + plan triage | exit 0 / clean | 7/7 | 23.2% | ✅ (2 iterations; 6 defects found+fixed — see below) |
| claude-only | full | exit 0 / clean | 4/4 | **0%** | ✅ pure extraction |
| copilot-only | full (codeReview=true branch) | exit 0 / clean | 4/4 | 47.4%* | ✅ |
| adversarial | full (CRLF, fences, setext, mixed JSON) | exit 0 / clean | 3/3 | **0%** | ✅ |
| injection | full | exit 0 / clean | 2/2 | 0% | ✅ steering section dropped+ESCALATED, never obeyed |
| large | full (153 nodes, 4,000-line section, --include flow) | exit 0 / clean | 2/2 | **0%** | ✅ |

\* copilot-only's 47.4% is format-forced, not dilution: prompt→skill and
chatmode→agent conversions require frontmatter wrappers; both carried source
text verbatim inside the wrapper (verifier-confirmed pattern). Tiny-fixture
denominators inflate all percentages.

## Sabotage catch-rate: 3/3 (fresh verifier subagents, defects undisclosed)

| Seeded defect | Caught? | Verifier's verdict (verbatim core) |
|---|---|---|
| Unjustified drop (SENTINEL-009 dropped as "obsolete") | ✅ RESTORE | "bare one-word assertion with zero supporting evidence… unverifiable reason is insufficient by definition" |
| Dilution rewrite ("blue/green script **only**" → "**can**… **where convenient**") | ✅ RESTORE | "this is inversion, not condensation… obligation and prohibition both destroyed"; also caught the cascade — the dedupe drop circularly cited the weakened copy |
| Bogus out-of-scope ruling (40-line-functions rule called "prose about AI") | ✅ RESTORE | "reason is FALSE… concrete coding obligation, not prose; SENTINEL-015 appears nowhere in the generated tree" |

Specificity: **0 false RESTOREs** across ~27 legitimate entries judged in the
three runs. All three runs independently ESCALATED the same genuine human
decision (the planted tabs-vs-spaces conflict) — correct behavior, and evidence
the escalation channel isn't noise.

## Defects found by validation and FIXED in the kit (the point of Phase 3)

1. Mixed-file design gap — forced-include files (AI section in a human doc)
   couldn't be reassembled; inventoried paths are now valid targets.
2. ai-kit-check template pointed at a nonexistent script path (verifier ① find).
3. Audit was flagging the adoption tooling itself (false R-53/R-45/R-21).
4. Heading-seam pattern — verbatim blocks carry source headings into slots;
   split-strip pattern documented in the manifest reference (verifier ① find).
5. Deletion bookkeeping was an existence side effect, now manifest-derived
   (verifier ② find).
6. Inaccurate boilerplate drop reasons — per-entry accuracy requirement added
   (verifier ② find).
7. Empty source dirs survived file deletion (`.github/chatmodes/` etc.) and
   tripped the audit — materialize now prunes emptied dirs, idempotently.
8. Tiling gate caught a malformed split range in plan authoring (worked as
   designed — large fixture).

## Open items

- **ESCALATIONS for owner:** tabs-vs-spaces conflict resolution pattern (the
  verifier wants explicit human ack at Gate 2 — by design); empty
  Overview/Architecture skeleton sections on sparse repos (template
  enhancement queued for Phase 4: collapsible sections).
- **Owner runs (go/no-go):** `/validate-adoption` in interactive Claude Code;
  Copilot column + two live checks per docs/validation-runbook.md.
- Time calibration: sandbox mechanical phases are seconds; judgment phases
  minutes — owner runs will calibrate real interactive timings.

## Pivot-trigger assessment (V2-PLAN §12, sandbox evidence)

- Manifest-loop productivity: 1–2 materialize iterations per fixture — far
  under any sane bound. **No trigger.**
- Split/range complexity: one authoring error across 8 fixtures, caught
  mechanically by tiling, trivially fixed. **No trigger.**
- Copilot friction: **unmeasured** — owner column.

Sandbox recommendation: architecture validated; proceed to Phase 4 pending
owner's interactive confirmation.

## Copilot column (2026-06-10, owner run via Copilot CLI) — PHASE 3 CLOSED

`/validate-adoption` invoked in Copilot CLI from the kit repo: skill loaded
and triggered ✅, all four phases ran via subagent orchestration ✅, gates
converged (check/audit exit 0) ✅, 7/7 sentinels accounted, scope clean,
assertion PASS — on `mixed-messy`, the hardest fixture (see finding below).
The design review's "don't depend on Copilot subagent orchestration" caution
is empirically retired: orchestration-first is now the documented behavior
for both tools (bootstrap skill updated accordingly).

Findings from the run, both fixed:
- **Skill argument fumble:** `copilot-only` argument was misparsed; the skill
  asked "how to proceed" and defaulted to mixed-messy. Explicit ARGUMENT RULE
  added to validate-adoption. (Net effect favorable — hardest fixture ran on
  the Copilot stack — but the fumble was real.)
- **Harness regex stale:** validate-assert's merged-bytes regex predated the
  F-3 headline rewording → `mergedBytesPct: null`. Regex now matches both.

Disposition variance worth noting: this run KEPT both sides of the planted
tabs-vs-spaces contradiction and escalated adjudication to the human, rather
than dropping the older rule with reason as earlier runs did. Both
dispositions are legitimate; the escalation channel carried it.

Residual untested (accepted, low risk): the copilot-only fixture's specific
content under Copilot drive (content fully validated in the sandbox column;
R-09 branching is tool-independent script logic), VS Code chat-frontend UX
(CLI shares the engine), and the explicit tool-restriction probe (the
verifier ran read-only in-flow; the clean-tree backstop remains mandatory by
design regardless).

**Final Phase 3 verdict: all columns pass, no pivot trigger fired, zero
silent losses anywhere. GO for Phase 4.**
