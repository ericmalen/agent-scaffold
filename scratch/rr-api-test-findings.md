# agent-scaffold init/migrate — findings on `rr-api`

Test log for shaking out `agent-scaffold init` + `scaffold-migrate` against a
large, realistic brownfield repo (`rr-api`). rr-api is reset between runs with
`git checkout . && git clean -fdx`, so every iteration starts from the baseline
below.

- **Consumer:** `/Users/ericmalen/Projects/bcai/rr/core/rr-api` (C#/.NET 9, ~4,500 files, branch `main`)
- **Scaffold:** `/Users/ericmalen/Projects/dnd-caf/agent-scaffold`
- **Scope:** `init` + `scaffold-migrate` only (no `update` / re-`init --force` yet)
- **Init config:** select **all** opt-in skills + agents

---

## ⛔ INCIDENT — destructive reset (Run 2 setup, 2026-05-14)

The agreed reset command `git checkout . && git clean -fdx` was run on rr-api for
the first time at the start of Run 2. **`git clean -fdx` deletes untracked AND
gitignored files** — it destroyed local files that are not recoverable from git:

- **CONFIRMED GONE:** `.claude/settings.local.json` — untracked, not gitignored, ~80
  permission rules. Existed at the Run 1 baseline; absent after the reset.
- **CONFIRMED GONE:** `.history/` — gitignored (`.gitignore:394`), VS Code Local
  History. Existed at baseline. (Ironically this was the most likely local-history
  copy of the two files below.)
- **UNKNOWN / AT RISK:** `appsettings.Local.json` (gitignored `.gitignore:491`) and
  `.env` (gitignored `.gitignore:7`). If real copies existed (likely, given a
  `git stash` titled *"local api key - do not commit"* is present), `git clean -fdx`
  removed them. Cannot confirm existence post-hoc — the only evidence (`.history/`)
  is also gone.
- **Safe:** all tracked files (restored by `git checkout .`); the `git stash` entry
  (`stash@{0}` — stashes are untouched by `git clean`); build artifacts (regenerable).

**Loop halted at Run 2.** Methodology must change before continuing — see
"Reset methodology" below. Reported to the user for recovery decision.

### Reset methodology — must fix before resuming
`git clean -fdx` is unsafe for a repo with real gitignored local config. Options:
1. **Back up & restore** the gitignored AI/local files around each run: snapshot
   `.claude/settings.local.json` (+ any `appsettings.Local.json`, `.env`) to a safe
   dir before reset, restore after. Use `git clean -fd` **without `-x`** so ignored
   files are left alone, then manually remove only scaffold-created paths.
2. **Targeted cleanup**: instead of `git clean`, remove exactly the scaffold's known
   output paths (from `.ai-scaffold.json` + the two `.scaffold` sidecars + the
   manifest), then `git checkout .`. Surgical, no collateral.
3. **Clone-per-run**: operate on a throwaway clone of rr-api so the user's working
   copy is never touched. Safest; loses gitignored local files in the clone but
   the original is untouched.

## ✅ Status after Batch B (post-fix regression, 5 parallel worktree runs)

- **BUG-1 — FIXED, verified 5/5.** Every worktree's `preexistingUnmanaged` after init
  was exactly `[".claude/settings.local.json"]`. The 4 CI/editor false positives gone.
- **BUG-2 — FIXED, verified 5/5.** All 5 ran the two-call file-backed pattern cleanly:
  plan agents wrote `.ai-scaffold-migration-plan.md` and stopped; apply agents read it,
  applied, deleted it. No re-spawn, no "SendMessage isn't available" message. All 10
  agents (5 plan + 5 apply) ran in parallel without issue.
- **BUG-3 — FIXED (with caveat).** No per-file permission prompts during the parallel
  applies. Caveat: in this cross-repo test harness, what suppressed prompts was a
  session-local allow rule, not the shipped `.claude/settings.json` change — the shipped
  fix is correct-by-construction for in-repo use but can't be exercised cross-repo.
- **BUG-6 — FIXED, verified.** Deliberately replanted a stale plan file (Run-3-incident
  scenario) in an already-migrated worktree and re-invoked apply. The agent verified the
  premise snapshot, detected every drift point, and **made zero changes** — exactly the
  defense that was missing in Run 3. **Caveat:** the synthetic plan had an explicit
  premise-snapshot table; the *real* plan-mode agents (wt-1/2/3/5) produced only prose,
  not a structured snapshot (wt-4 had a soft "before" snippet). The fix should be
  strengthened — see BUG-6 entry below.
- **BUG-4 — did not recur.** All 5 AGENTS.md titled `# RelationshipReferee API`.
- **Determinism — confirmed again.** All 5 inits identical (29 files, same hashes).

## 🐞 Cumulative bug list

_(updated each run — newest findings fold in here)_

- **BUG-1 (high): `preexistingUnmanaged` scan is far too broad — and false positives
  are permanent.** `findPreexistingUnmanaged` walks `.github/`, `.vscode/`, `docs/`
  wholesale and flags every non-scaffold file as "unmanaged AI config". On rr-api it
  flagged `.github/workflows/deploy.yml`, `deploy-prod.yml`, `.vscode/launch.json`,
  `.vscode/tasks.json` — all plain CI/editor config, zero AI relevance. Should only flag
  `.claude/**` + the specific AI surfaces. **Confirmed downstream impact (Run 1 migrate):**
  the migrator correctly leaves non-AI files alone, but it has *no mechanism to remove a
  wrongly-flagged entry* — "leave as-is" keeps the path in the array by design. So the 4
  junk entries survive migration and pollute `agent-scaffold status` permanently. Must be
  fixed at the scan source. First seen: Run 1 init; confirmed persistent Run 1 migrate.
  Fix proposed in Run 1 init below.
- **OBS-1 (minor): `.vscode/settings.json.scaffold` sidecar is gitignored** in rr-api
  (`.gitignore` has `.vscode/*` with an allowlist that excludes `*.scaffold`). So
  `git status` after `init` does not surface the pending `.vscode` integration. Sidecars
  are transient so arguably fine, but a user inspecting `git status` to see "what did
  init do" misses it. First seen: Run 1.
- **Q-1: `source.repo` = `https://dev.azure.com/.../ado-repo-tests`** — the scaffold's
  own ADO test remote. Correct *kind* of value (scaffold source, not consumer), but the
  URL looks like a throwaway test repo, not a real distribution URL. Intentional?
- **BUG-3 (medium): migrator apply phase triggers per-file tool-approval prompts in
  user's UI.** During Run 2 migrate, user was asked _"Do you want to overwrite
  AGENTS.md?"_ directly by the subagent — unexpected, since the batch plan was already
  approved by the orchestrator. Root cause: the scaffold's `.claude/settings.json` does
  not pre-authorize Write for scaffold-managed paths; in a cross-repo invocation the
  consumer's `settings.local.json` permissions don't apply. For in-repo usage this may
  be less visible, but the prompt still leaks through the subagent boundary unexpectedly.
  First seen: Run 2 migrate.
- **BUG-4 (low, intermittent): AGENTS.md h1 may remain `# CLAUDE.md` instead of the
  project name.** Run 2's AGENTS.md line 1 is `# CLAUDE.md` (copied verbatim from the
  consumer's CLAUDE.md header). Run 1 correctly renamed it `# RelationshipReferee API`.
  Downstream consequence of BUG-2: the re-spawn apply prompt said "verbatim" and the
  agent complied too literally; the nuance "rename the heading" was lost across the
  re-spawn boundary. First seen: Run 2 migrate.
- **BUG-6 (HIGH — near-miss data loss): re-spawn apply pattern + unreliable completion
  signal → double-execution against a stale plan premise.** In Run 3, apply attempt #1
  ran (it wrote the migration: 605-line AGENTS.md, shimmed CLAUDE.md, deleted sidecars,
  updated manifest) but the orchestrator received a "rejected/interrupted" signal — so
  it could not tell the apply had succeeded. It re-spawned apply attempt #2 with the
  *same* prompt, whose embedded premise ("consumer CLAUDE.md is 592 lines, migrate it
  into AGENTS.md") was true at plan time but **false after attempt #1** (CLAUDE.md was
  now the 14-line shim; the 592 lines were already in AGENTS.md). A naive apply would
  have overwritten AGENTS.md's real content with the 14-line shim → **catastrophic data
  loss**. Only the migrator agent's defensive state-check ("the plan's central
  assumption was wrong, so I diverged") prevented it. Chains off BUG-2: the re-spawn
  mechanism + an unreliable "did it run?" signal makes stale-premise re-execution
  likely. **Fix priority: high.** Mitigations: (a) BUG-2 fix (continue same agent /
  file-backed plan), (b) make "verify actual repo state vs. plan premise before any
  destructive write; refuse if diverged" a mandatory, explicit step in
  `scaffold-migrator.md`, (c) the apply agent should treat the migration as idempotent
  and detect "already applied". First seen: Run 3 apply.
  - **Positive corollary:** the migrator's defensive behavior is excellent — it should
    be hardened into an explicit procedural guarantee, not left as emergent behavior.
  - **Batch B follow-up — strengthen the fix.** The fix works (verified — see Batch B
    status above) but its effectiveness depends on the plan file carrying a structured
    premise snapshot, which plan-mode agents produce inconsistently (4/5 wrote prose
    only). Recommended hardening: (a) make the premise-snapshot a mandatory, templated
    section of `.ai-scaffold-migration-plan.md`; and/or (b) better — have apply mode
    *also* verify against the **live manifest** (are the plan's `pendingIntegration`
    entries still present? are the named sidecar files still on disk?). The manifest +
    sidecar presence are authoritative and don't depend on plan-agent diligence.
- **OBS-4 (low): scaffold ships `.vscode/settings.json` as commented JSONC, but
  `lib/brownfield.mjs` `scan()` parses `.vscode/settings.json` with strict `JSON.parse`
  inside a silent `try/catch`.** A consumer (or post-migrate) `.vscode/settings.json`
  with `//` comments — which is valid for VS Code and is exactly what the migrator
  produces — fails that parse, so `scan()` silently fails to detect AI keys in it.
  Latent inconsistency; surfaced while verifying Batch B (`.vscode/settings.json` is
  valid JSONC, not strict JSON). First noted: Batch B.
- **BUG-5 — partially addressed.** Plan agents no longer *block* on questions (they pick
  a deterministic default), but still cosmetically list "Unresolved questions" in their
  return summary (wt-2 did). Acceptable — the plan is human-reviewed anyway — but the
  agent doc could say "do not include an Unresolved-questions section; record the chosen
  default inline." Low priority.
- **PERF-1 (medium): `scaffold-migrate` is slow.** Observed durations: Run 2 plan
  ~173 s, Run 2 apply ~413 s (~7 min), Run 3 plan ~57 s. The apply phase especially
  drags. Optimization ideas worth exploring: (a) parallelize independent file merges
  across subagents (CLAUDE.md→AGENTS.md merge, `.vscode/settings.json` merge, and each
  `preexistingUnmanaged` classification are all independent), (b) the BUG-2 file-backed
  two-call fix would also cut redundant re-reads, (c) for the *test loop itself*,
  run multiple consumer copies in parallel git worktrees instead of consecutively
  (see "Test loop parallelization" note below). First noted: Run 3.
- **BUG-5 (low): plan-presentation agent asks a clarifying question mid-plan.** Run 3's
  batch plan ended with _"verbatim or trim? — your call before I write it"_. The design
  is one batch plan, all decisions already made by the agent from the integration rules
  (which say move all content → verbatim). Asking breaks the single-approval model.
  First seen: Run 3 plan.
- **INCIDENT (methodology): `git clean -fdx` destroyed gitignored/untracked files** —
  `.claude/settings.local.json`, `.history/`, and potentially `appsettings.Local.json`.
  Files were recovered by the user. Reset methodology changed to targeted removal
  (see "Reset methodology" section). Run 2 init ran without `settings.local.json`
  present, so its `preexistingUnmanaged` has 4 entries instead of 5. Not re-running
  Run 2; noted as a baseline deviation.
- **BUG-2 (medium): `scaffold-migrate` re-spawns the migrator agent instead of
  continuing it.** During migrate the orchestrator repeatedly prints _"SendMessage isn't
  available here — I'll re-spawn the scaffold-migrator with the approved plan embedded so
  it applies directly."_ Reproduced in **both** `test-consumer` and `rr-api`.

  **Root cause (structural, confirmed by reading `SKILL.md` + `scaffold-migrator.md`):**
  the skill design assumes one continuous flow — _"Hand off to the `scaffold-migrator`
  agent… presents one batch plan… **on a single approval, applies every change**"_
  (SKILL.md:31-40). But a subagent can't solicit user input mid-run: it runs to
  completion and returns. So the approval boundary *necessarily* splits the work into
  two agent invocations — (1) classify + return plan, (2) apply approved plan. Bridging
  those two with the **same** agent (context intact) needs `SendMessage`, which isn't
  available to the skill/orchestrator in this context. It therefore degrades to
  re-spawning a fresh migrator with the plan re-embedded in the prompt string.

  Consequences: (a) the apply-agent loses all classification context, (b) noisy/
  confusing UX, (c) fragile — the entire batch plan must round-trip through a prompt
  string intact. Neither `SKILL.md` nor `scaffold-migrator.md` mentions `SendMessage` or
  re-spawning, so the orchestrator is improvising around a gap the design never
  acknowledged. First seen: Run 1 migrate.

  **Proposed fixes (pick one):**
  - **A — make the two-call pattern explicit & file-backed.** Document in `SKILL.md`
    that the migrator runs twice: spawn #1 = classify and **write the batch plan to a
    scratch file** (e.g. `.ai-scaffold-migration-plan.md`); orchestrator presents it;
    on approval, spawn #2 = "apply the plan in `<file>`". Round-tripping via a file is
    robust where a prompt string isn't.
  - **C — skill does Phase 1 in the main thread, delegates only the apply.** The skill
    already carries the references (`integration-rules.md`, `manifest-operations.md`).
    Let the main thread classify + present the plan (it *can* talk to the user), and
    spawn `scaffold-migrator` only for the post-approval apply. Eliminates the
    continuation problem entirely.
  - Either way, update `SKILL.md`/`scaffold-migrator.md` so "single approval" no longer
    implies a single uninterrupted agent run.

---

## Fix Phase (2026-05-14) — BUG-1/2/3/6 applied

Applied directly to agent-scaffold working tree (other session paused; not committed).
Layered on top of the other session's in-progress batch-plan restructure of the
migration files.

- **BUG-1 — FIXED.** `lib/brownfield.mjs`: replaced wholesale `MANAGED_SUBDIRS` walk
  with scoped `UNMANAGED_SCAN` — `.claude/` walked fully (AI-exclusive), `.github/`
  scoped to `copilot-instructions.md` + `instructions/` + `prompts/` + `chatmodes/`,
  `.vscode/` scoped to `settings.json`, `docs/` dropped entirely. Added 2 regression
  tests in `test/brownfield.test.mjs` (47/47 pass). Expected effect: rr-api's
  `preexistingUnmanaged` becomes exactly `[".claude/settings.local.json"]`.
- **BUG-2 — FIXED (design).** `.claude/agents/scaffold-migrator.md` +
  `.claude/skills/scaffold-migrate/SKILL.md`: made the two-invocation pattern explicit
  and file-backed. Plan mode writes `.ai-scaffold-migration-plan.md` (incl. a per-file
  "premise snapshot"); apply mode reads it, applies, deletes it. Orchestrator (SKILL.md)
  does plan-call → present → apply-call. No more `SendMessage`/re-spawn improvisation.
- **BUG-3 — FIXED.** `.claude/settings.json`: added scoped `allow` rules for the paths
  the migrator touches (`AGENTS.md`, `CLAUDE.md`, nested variants, `.ai-scaffold.json`,
  `.vscode/settings.json`, `.claude/settings.json`, `.ai-scaffold-migration-plan.md`).
  No more per-file overwrite prompts during apply. (Effectiveness to be confirmed in
  Batch B — exact glob syntax verified empirically.)
- **BUG-6 — FIXED.** `scaffold-migrator.md`: apply mode has a **mandatory premise-
  verification gate** — re-read every target file, compare to the plan's premise
  snapshot, and **stop without writing** if anything drifted. Plus the step-2 early
  exit ("both arrays empty → nothing to migrate") makes any re-invocation safe. The
  near-miss double-execution from Run 3 is now structurally prevented.

**Not fixed (per user scope):** BUG-4 (low — largely subsumed by BUG-2's plan file
carrying the project name explicitly), BUG-5 (low — agent doc now says "do not ask any
clarifying question" in plan mode, so partially addressed), PERF-1 (medium — separate
effort).

**Follow-up:** `examples/worked-migration.md` (modified by the other session) still
describes the old single-call flow — should be updated to match the two-call pattern.

## Baseline — rr-api committed state

Pre-existing AI config:
- `CLAUDE.md` — 592 lines, **standalone** (no `@AGENTS.md` import). Rich: architecture,
  domain model, mermaid diagrams, 13 implementation rules, testing framework, config templates.
- `.claude/settings.local.json` — exists, 80+ permissions. **No `settings.json`.**
- `PLAN.md` at root — a dev task plan, *not* AI config.
- **Absent:** `AGENTS.md`, `.claude/agents|skills|commands/`, `.github/copilot-instructions.md`,
  `.github/prompts/`, `.cursor*`, `.ai-scaffold.json`, `.scaffold` sidecars, nested AGENTS/CLAUDE.

Classification: **brownfield**, relatively clean. Predicted pressure points:
1. Huge standalone `CLAUDE.md` → split tool-agnostic content into `AGENTS.md`, keep
   `@AGENTS.md` import at line 1, Claude-only notes below.
2. `settings.local.json` exists but `settings.json` does not → `settings.json` should
   install **normally** (target path free); `settings.local.json` is `preexistingUnmanaged`.
3. `PLAN.md` must be left completely untouched.

---

## Grading rubric

### After `init` (brownfield)
- [ ] `.ai-scaffold.json` created: `mode: "brownfield"`, `schemaVersion: 1`, `source.commit` populated
- [ ] `CLAUDE.md` preserved as-is; scaffold version → `CLAUDE.md.scaffold`; `pendingIntegration` entry
- [ ] `AGENTS.md` installed **normally** (no sidecar — none existed)
- [ ] `.claude/settings.json` installed **normally** (no sidecar — none existed)
- [ ] `.vscode/settings.json` — normal if absent, sidecar if present
- [ ] base + all opt-in skills/agents land under `.claude/skills|agents/` normally
- [ ] `.claude/settings.local.json` recorded in `preexistingUnmanaged`
- [ ] `files{}` map complete; `sidecar: true` + `installedAs *.scaffold` only for genuine conflicts
- [ ] `PLAN.md` untouched, unreferenced
- [ ] `git status` = only additions + `*.scaffold` — no edits/deletes of pre-existing files

### After `scaffold-migrate`
- [ ] `CLAUDE.md.scaffold` merged: tool-agnostic content → `AGENTS.md`, `@AGENTS.md` import line 1 of `CLAUDE.md`, Claude-only notes below
- [ ] no real content downgraded to TODO placeholders
- [ ] all `.scaffold` sidecars deleted after merges written
- [ ] `pendingIntegration` emptied; `files{}` entries flipped (`installedAs` → real path, `sidecar` deleted, `sourceHash` unchanged)
- [ ] `preexistingUnmanaged` folded or deliberately left (if left, stays listed)
- [ ] `agent-scaffold status` shows no integration warnings (locally-modified is OK)

---

## Iteration log

### Run 1 — `init` (2026-05-14)

**Command:** `agent-scaffold init` with all opt-in selected → `skills: [git-conventions]`,
`agents: [example-reviewer]` (plus base skills/agents).

**`git status`:** only additions — `.ai-scaffold.json`, `.claude/`, `.github/prompts/`,
`AGENTS.md`, `CLAUDE.md.scaffold`, `docs/`. No tracked file modified or deleted.
(`.vscode/settings.json.scaffold` written but gitignored — see OBS-1.)

**Sidecars on disk:** `CLAUDE.md.scaffold`, `.vscode/settings.json.scaffold` — both
match `pendingIntegration`. ✓

**Rubric — `init` (brownfield):**
- [x] `.ai-scaffold.json` created: `mode: "brownfield"`, `schemaVersion: 1`, `source.commit` populated (`2d98043…`)
- [x] `CLAUDE.md` preserved as-is; scaffold version → `CLAUDE.md.scaffold`; `pendingIntegration` entry present
- [x] `AGENTS.md` installed **normally** (no sidecar — none existed)
- [x] `.claude/settings.json` installed **normally** (no sidecar — none existed); `settings.local.json` left alone
- [x] `.vscode/settings.json` **sidecar'd** — rr-api had a tracked `.vscode/settings.json` (40 B), so sidecar is correct
- [x] base + all opt-in skills/agents under `.claude/skills|agents/` normally (incl. `git-conventions`, `example-reviewer`)
- [x] `.claude/settings.local.json` recorded in `preexistingUnmanaged`
- [x] `files{}` map complete; `sidecar: true` + `installedAs *.scaffold` only for the 2 genuine conflicts
- [x] `PLAN.md` untouched, unreferenced
- [x] `git status` = only additions + sidecars — no edits/deletes of pre-existing files
- [ ] **`preexistingUnmanaged` clean** — ❌ see BUG-1: 4 false positives (CI workflows + editor config)

**✅ Went right**
- Brownfield correctly detected; mode/schema/commit all correct.
- Sidecar vs normal-install decision was correct on every wiring file: `CLAUDE.md` and
  `.vscode/settings.json` existed → sidecar'd; `AGENTS.md` and `.claude/settings.json`
  didn't → installed normally. This is exactly the nuanced behavior the rubric wanted.
- `settings.local.json`-but-no-`settings.json` case handled perfectly.
- 27-entry `files{}` map all present with correct `role`/`owner`; opt-in selections wired.
- Zero collateral damage: huge `CLAUDE.md`, `PLAN.md`, all source untouched.

**❌ Went wrong**
- **BUG-1** — `preexistingUnmanaged` contains `.github/workflows/deploy.yml`,
  `.github/workflows/deploy-prod.yml`, `.vscode/launch.json`, `.vscode/tasks.json`.
  Only `.claude/settings.local.json` is a legitimate entry. Root cause in
  `lib/brownfield.mjs:36-47`: `findPreexistingUnmanaged` walks `MANAGED_SUBDIRS =
  ['.claude','.github','.vscode','docs']` *wholesale* and flags any file not shipped by
  the scaffold. But `.github/`, `.vscode/`, `docs/` are shared with non-AI tooling —
  walking them whole guarantees false positives in essentially every real brownfield
  repo. Only `.claude/` is AI-exclusive.

**🔧 Proposed fix for BUG-1** (`lib/brownfield.mjs`)

Scope the scan per-directory: walk `.claude/` fully, but for `.github/` and `.vscode/`
only consider the explicit AI surfaces; drop `docs/` entirely (scaffold only adds
named files there, never "owns" the dir).

```js
// .claude is AI-exclusive — walk the whole subtree.
// .github / .vscode are shared with CI + editor config — only scan known AI surfaces.
// docs/ is general-purpose — scaffold adds named files but never owns it; skip.
const UNMANAGED_SCAN = [
  { base: '.claude' },                                   // walk all
  { base: '.github', only: [                             // AI surfaces only
      'copilot-instructions.md', 'instructions', 'prompts', 'chatmodes' ] },
  { base: '.vscode', only: ['settings.json'] },          // AI keys live here
];

export function findPreexistingUnmanaged(consumerRoot, knownConsumerPaths) {
  const unmanaged = [];
  for (const { base, only } of UNMANAGED_SCAN) {
    const roots = only
      ? only.map(p => join(consumerRoot, base, p))
      : [join(consumerRoot, base)];
    for (const absRoot of roots) {
      if (!existsSync(absRoot)) continue;
      const files = statSync(absRoot).isDirectory() ? walkFiles(absRoot) : [absRoot];
      for (const absFile of files) {
        const rel = relative(consumerRoot, absFile).replace(/\\/g, '/');
        if (!knownConsumerPaths.has(rel)) unmanaged.push(rel);
      }
    }
  }
  return unmanaged;
}
```

(Needs `statSync` import. The `only` lists overlap with `registry.brownfieldScanPaths` —
could alternatively derive from the registry to keep one source of truth.) With this,
rr-api's `preexistingUnmanaged` would be exactly `[".claude/settings.local.json"]`.

**Notes / observations**
- OBS-1: `.vscode/settings.json.scaffold` landed in a gitignored path — invisible to
  `git status`. Consider whether brownfield wiring files belonging to gitignored dirs
  should be called out explicitly in `init` output (or whether `status` already does).
- Q-1: confirm `source.repo` ADO URL is the intended distribution remote, not a leftover
  test value.
- `.vscode/settings.json` original is only 40 bytes — trivial merge at migrate time;
  good simple test case for the `.vscode` AI-key merge path.

**Verdict:** `init` core behavior is solid — one real bug (BUG-1, scan breadth), one
minor visibility issue (OBS-1), one config question (Q-1).

---

### Run 1 — `scaffold-migrate` (2026-05-14)

**`git status`:** `M CLAUDE.md`, `M .vscode/settings.json` (merges applied); the rest
still `??` (new scaffold files). No deletions of tracked files.

**Remaining sidecars:** none — both `CLAUDE.md.scaffold` and
`.vscode/settings.json.scaffold` deleted. ✓

**Rubric — `scaffold-migrate`:**
- [x] `CLAUDE.md.scaffold` merged: original 592-line `CLAUDE.md` content routed into
  `AGENTS.md` under the scaffold's heading structure; `CLAUDE.md` is now the 13-line
  scaffold wiring file with `@AGENTS.md` as line 1 + "Claude Code notes" below
- [x] no real content downgraded to TODO placeholders — `AGENTS.md` "Do Not" holds the
  original's 13 implementation rules verbatim; only TODO present is the scaffold
  template's own optional "Claude Code notes" stub
- [x] all `.scaffold` sidecars deleted after merges written
- [x] `pendingIntegration` emptied (`[]`)
- [x] `files{}` entries flipped — `CLAUDE.md` and `.vscode/settings.json` both:
  `installedAs` → real path, `sidecar` field deleted, `sourceHash` unchanged ✓ (exactly
  per `manifest-operations.md`)
- [~] `preexistingUnmanaged` — `.claude/settings.local.json` correctly left listed, but
  the 4 BUG-1 false positives also still listed (see BUG-1)
- [~] `agent-scaffold status` — clean except BUG-1: "Pre-existing unmanaged files" lists
  all 5 incl. `deploy.yml`/`deploy-prod.yml`/`launch.json`/`tasks.json`. 27 files in
  sync; `AGENTS.md` + `.vscode/settings.json` correctly shown "locally modified"
  (expected post-merge); `CLAUDE.md` shows in-sync — correct, since the merged
  `CLAUDE.md` *is* the scaffold's wiring file (`@AGENTS.md` + notes), matching the
  shipped hash.

**✅ Went right**
- **CLAUDE.md → AGENTS.md split is excellent.** 592 lines of standalone, tool-agnostic
  guidance correctly relocated to `AGENTS.md`; `CLAUDE.md` reduced to the canonical
  `@AGENTS.md` import + Claude-only notes. Project name filled in
  (`# RelationshipReferee API`, not the `Project Name` placeholder).
- **Semantic routing was smart:** original "Important Implementation Rules" → `## Do Not`;
  "Project Overview" → `## Overview`; architecture/domain/feature sections → `## Architecture`
  subsections; commands/testing/structure/config → `## Conventions` subsections. Mermaid
  diagrams preserved intact.
- **`.vscode/settings.json` merge is textbook.** All 11 scaffold AI keys + explanatory
  comments added; the consumer's lone `FSharp.suggestGitignore: false` preserved under a
  `// ===== Consumer settings (preserved) =====` header. Exactly the AI-key merge the
  rubric wanted.
- Manifest bookkeeping perfect — sidecar flips match `manifest-operations.md` to the letter.

**❌ / ⚠️ Went wrong**
- **BUG-1 fallout (escalated to confirmed-persistent):** the 4 non-AI false positives
  (`deploy.yml`, `deploy-prod.yml`, `launch.json`, `tasks.json`) remain in
  `preexistingUnmanaged` after migrate. The migrator has no path to remove a
  mis-flagged entry — "leave as-is" keeps it by design — so `agent-scaffold status` will
  nag about CI/editor files indefinitely. Also means the migrator's batch plan almost
  certainly *presented* these 4 for review, wasting reviewer attention on non-AI files.
- **BUG-2** reproduced again this run (re-spawn / `SendMessage` message).

**🟡 Observations**
- OBS-2 (minor): the scaffold's `AGENTS.md` template only offers 5 top-level bins
  (Overview / Architecture / Conventions / Do Not / More Context). Reference-style
  material — "Common Commands", "Testing", "Project Structure", "Configuration
  Requirements" — all got nested under `## Conventions`, which is a slightly awkward fit
  (they're reference, not conventions). Not a bug; the migrator did the best it could
  with the available headings. Worth considering whether the template should offer a
  `## Reference` / `## Commands` bin, or whether the migrator should be allowed to add
  new top-level sections.
- Content volume looks complete: original `CLAUDE.md` 592 lines → `AGENTS.md` 607 lines
  (template overhead accounts for the delta). Spot-checks found no dropped sections.

**Verdict:** migrate did the *hard* part — the 592-line CLAUDE.md split and the
`.vscode` AI-key merge — extremely well. The only real defect is inherited: BUG-1's
false positives ride through untouched and can't be cleaned up post-hoc, which makes
fixing BUG-1 at the scan source more important, not less.

- OBS-3 (trivial): `status` prints _"Scaffold repo has uncommitted changes"_ — caused by
  the untracked `scratch/` dir (this findings file) in agent-scaffold + the other
  session's in-flight work. Not a consumer-side issue; flagging only so it's not
  mistaken for a bug later.

**Verdict (status):** confirmed — BUG-1's 4 false positives are now permanently visible
under "Pre-existing unmanaged files". Everything else in `status` is correct.

**Next:** safe reset → Run 3.

---

### Run 2 — `init` (2026-05-14) — degraded baseline

**Baseline deviation:** `git clean -fdx` (the first reset) destroyed `.claude/settings.local.json`
before init ran. Recovered by user afterward, but init ran without it → `preexistingUnmanaged`
has 4 entries instead of 5 (`.claude/settings.local.json` absent).

**Rubric — `init`:** same pass/fail pattern as Run 1 except:
- [~] `preexistingUnmanaged`: 4 entries (not 5) — `.claude/settings.local.json` absent because
  it was destroyed by the reset before init ran. Methodology artifact, not a scaffold bug.

### Run 2 — `scaffold-migrate` (2026-05-14)

**New bugs surfaced:** BUG-3 (per-file tool-approval prompts during apply), BUG-4 (AGENTS.md
title remains `# CLAUDE.md`), BUG-2 re-confirmed.

**Migrate variances vs Run 1:**
- **AGENTS.md structure:** Run 2 kept consumer's original headings verbatim (no restructuring
  into scaffold bins). Run 1 mapped into scaffold's heading buckets. Both valid; LLM chose
  differently.
- **AGENTS.md title:** `# CLAUDE.md` copied from consumer's CLAUDE.md h1 (BUG-4). Run 1
  correctly renamed to `# RelationshipReferee API`.
- **`.vscode/settings.json`:** plain JSON, no comments. Run 1 used the scaffold's rich
  commented style. Both contain all required AI keys + consumer's `FSharp.suggestGitignore`.
- **BUG-3 observed:** user prompted "Do you want to overwrite AGENTS.md?" during apply —
  per-file prompt from subagent, bypassing the already-given batch-plan approval. User
  escaped some prompts but writes still landed (migration completed).

**Rubric — `scaffold-migrate`:**
- [x] All `.scaffold` sidecars deleted
- [x] `pendingIntegration: []`
- [x] `files{}` sidecar entries flipped correctly
- [~] `AGENTS.md` content complete but h1 = `# CLAUDE.md` (BUG-4)
- [x] `CLAUDE.md` = `@AGENTS.md` at line 1
- [x] `.vscode/settings.json` merged (all AI keys + consumer key preserved)
- [~] `preexistingUnmanaged` — 4 BUG-1 false positives remain (expected)
- [x] `status` clean except BUG-1 entries and "locally modified"

**Verdict:** core migrate mechanics correct; BUG-3 and BUG-4 are new confirmed findings;
BUG-2 reproduced.

---

### Run 3 — `init` (2026-05-14) — clean baseline, safe reset

**Safe reset worked.** Targeted removal of scaffold-created paths + `git checkout` of
tracked files; `.claude/settings.local.json` and `appsettings.Local.json` preserved.
`git status` fully clean before init.

**Rubric — `init`:** all green.
- [x] `mode: brownfield`, `schemaVersion: 1`, `commit: 2d98043`, 29 files
- [x] **Determinism confirmed:** all 29 `files{}` `sourceHash` values byte-identical to Run 1
- [x] `pendingIntegration`: `CLAUDE.md`, `.vscode/settings.json`
- [x] `preexistingUnmanaged`: **5 entries** (correct baseline — `settings.local.json` restored)
- [x] sidecars: `CLAUDE.md.scaffold`, `.vscode/settings.json.scaffold`

### Run 3 — `scaffold-migrate` (2026-05-14) — BUG-6 near-miss

**What happened:** apply attempt #1 ran (despite the orchestrator receiving a
rejected/interrupted signal) and fully applied the migration. Unable to confirm
success, the orchestrator re-spawned apply attempt #2 with a now-stale plan premise.
Attempt #2's defensive state-check caught the divergence and refused to overwrite
AGENTS.md's real content — see **BUG-6** (high, near-miss data loss).

**End state — correct:**
- [x] `AGENTS.md` — 605 lines, h1 = `# Relationship Referee API` (BUG-4 did NOT recur —
  apply #1 used the explicit-title prompt); headings Overview / Architecture /
  Conventions / Do Not / More Context
- [x] `CLAUDE.md` — 14-line `@AGENTS.md` shim, line 1 = `@AGENTS.md`
- [x] sidecars deleted; `pendingIntegration: []`; `files{}` entries flipped correctly
- [x] `.vscode/settings.json` merged, commented-JSON style (kept comments this run, per
  explicit prompt instruction) + consumer key preserved
- [~] `preexistingUnmanaged` — 5 entries incl. 4 BUG-1 false positives (expected)
- [x] `status` clean except BUG-1 entries + expected "locally modified"

**Variances vs prior runs:**
- AGENTS.md structure: scaffold-heading buckets (like Run 1, unlike Run 2's verbatim headings)
- AGENTS.md h1: correct this run (explicit prompt). BUG-4 confirmed prompt-dependent.
- `.vscode/settings.json`: comments kept this run (explicit prompt). Run 2 dropped them.
  → comment handling is entirely prompt-driven, no stable default.

**Verdict:** end state correct, but BUG-6 is the most serious finding so far — the
re-spawn pattern came one defensive check away from destroying 592 lines of real
project docs.

---

## PERF-1 — parallelize the migration (2026-05-14, post-Batch-B)

**Goal:** cut the ~413s apply-phase wall-clock. **Approach (user-approved):** shift
the semantic merge into the *plan* phase, parallelize plan across scoped workers,
make apply a "mechanical" executor of pre-computed content. `CLAUDE.md` kept as one
whole-file work unit (no section split — deferred to a future skill).

**Implemented** (6 files): new `references/orchestration.md` (SCOPE/FRAGMENT contract,
assembly rules, ≤2-unit degenerate path); `scaffold-migrator.md` gains a third
**scoped plan mode** (pure-functional, returns a FRAGMENT, writes nothing);
`SKILL.md` workflow rewritten to a 5-step orchestration (preflight → one-message
parallel fan-out → orchestrator assembles plan file → present → single mechanical
apply); short scope notes in `integration-rules.md` + `manifest-operations.md`;
second worked example.

**Test:** 2 baseline + 2 optimized rr-api worktrees, 3 work units each (CLAUDE.md
592L, .vscode/settings.json, .claude/settings.local.json review → triggers the
parallel path). Worktrees run pairwise in parallel.

### Timing
| Phase | Baseline (current code) | Optimized |
|---|---|---|
| Plan | 89s (2 whole-plan agents) | 212s (6 scoped workers; claude-md ~163s each) |
| Orchestrator assembly | ~0 (just spawns agents) | **361s** (main thread writing two ~700-line plan files) |
| Apply | 244s (2 agents, 213/221s) | 254s (2 agents, 201/210s — **not** mechanical-fast) |
| **Total wall** | **~333s** | **~827s** |

**Result: optimized is ~2.5× SLOWER.** Correctness was perfect (see below) — the
slowdown is purely structural.

### Root cause — BUG-7 (high): content transcribed 3× through LLM tool calls
The ~600-line `AGENTS.md` body is generated by the scoped worker, **returned as
text**, **written into the plan file by the orchestrator**, then **written into the
target by the apply agent**. Three full LLM transcriptions of the same large blob.
Baseline transcribes it once (apply does merge+write together). Two compounding costs
the design didn't account for:
1. **Orchestrator assembly (361s)** — embedding worker content into the plan file is
   a serial, single-threaded LLM write of everything the workers just produced. It
   silently re-serializes the entire migration.
2. **Apply is not mechanical (254s)** — "write the plan's content block verbatim"
   still means an LLM reproducing 600 lines via `Write` + reading a 700-line plan.
   Mechanical-for-an-LLM ≠ fast.

The premise "make apply mechanical → apply gets fast" is wrong while *mechanical*
means an LLM reproducing large content rather than a `cp`/`mv`.

### Proposed fix (BUG-7) — staging files, not embedded content
Plan workers **write their final content to staging files** (e.g.
`.ai-scaffold-staging/AGENTS.md`) — distinct paths, no contention, still within the
plan phase, still reviewable, still gated. The plan file carries only a **move-list +
manifest deltas + premise snapshots** (small, fast for the orchestrator to assemble).
Apply becomes genuinely mechanical: `mv staging/X → X`, `rm` sidecars, one manifest
edit — no content transcription. Expected: plan ≈ unchanged (~212s, the real work),
assembly ≈ seconds, apply ≈ seconds. This keeps the approval gate and the
premise/drift safety intact.
(Alternative considered: workers write straight to a sidecar that apply renames —
rejected, loses the clean "nothing in the real tree until apply" property.)

### Correctness — PASS (both optimized worktrees)
- No leftover `.scaffold` sidecars or `.ai-scaffold-migration-plan.md`.
- `pendingIntegration: []`; `preexistingUnmanaged: [".claude/settings.local.json"]`.
- `files[CLAUDE.md]` / `files[.vscode/settings.json]` flipped (`installedAs` → real
  path, `sidecar` field deleted); `sourceHash`/`role`/`source`/`mode` untouched.
- `status`: 28 in sync, `AGENTS.md` + `.vscode/settings.json` locally modified,
  `.claude/settings.local.json` unmanaged, no integration warning. `CLAUDE.md` in sync.
- **Content fidelity:** every substantive probe matched orig `CLAUDE.md` exactly
  (`ErrorOr` ×6, `ChatProcessingService` ×5, `Apple Root CA-G3` ×2, `MustBeValidGuid`
  ×2, `RevertToPending` ×1, `gpt-audio` ×3, `69 endpoints` ×1, `appsettings.Local.json`
  ×2 — identical across orig/opt-1/opt-2). The 3 "missing headings" are deterministic
  bin-renames the rule mandates (`Project Overview`→`Overview`, `Important
  Implementation Rules`→`Do Not`), not dropped content. `CLAUDE.md` line 1 = `@AGENTS.md`.

### What worked
- **Scoped plan mode** behaved exactly as designed — all 6 workers stayed
  pure-functional (no writes), returned well-formed FRAGMENTs with final content,
  premise snapshots, manifest-deltas, and skill-overlap notes.
- **Degenerate-path threshold** correct in principle (this 3-unit run took the
  parallel path as intended).
- **Premise verification** held — both apply agents verified all 5 snapshots,
  reported no drift, applied cleanly. BUG-6 fix uninvolved but intact.
- The two `claude-md` workers ran genuinely concurrently (~163s each, wall ~212s
  for all 6) — parallelism *works*; it's the serial assembly + double-write that sinks it.

### Status
Optimization is **implemented but not landed as a win** — it regresses wall-clock.
The 6 doc changes are sound and reusable; BUG-7 (staging-file rework of assembly +
apply) must land before this is faster than baseline. Recommend not committing the
PERF-1 docs until BUG-7 fix is in, or commit with a clear "WIP — slower until BUG-7"
note.
