# Phase 4.5 execution plan — docs consistency & vocabulary cleanup

Executes V2-PLAN §4.5 ("docs consolidation") plus the findings from the
June 2026 review. Goal: every consumer-facing doc agrees with `spec/rules.md`,
v1 vocabulary is gone, and a CI grep gate keeps it that way.

**Decisions taken**
- `/layer-agents`: **strike all references** (no such skill ships; the two real
  meta-skills are `skill-creator` and `new-agent`). A scoping meta-skill may be
  added to `catalog/` later as a separate effort.
- Prompts: delete the prompts surface from kit teaching (D-4/R-54).
  `built-in-reference.md` may still *list* VS Code's built-in `/create-prompt`
  (it documents what VS Code ships), annotated "not part of ai-kit's surface."

**Conventions for all edits**
- Cite rules by R-ID, never restate thresholds (R-51).
- Standardize spelling: **subagent** (never "sub-agent"); "Claude subagent
  format" for `.claude/agents/*.md`.
- Do not touch the vendored `skill-creator` skill (UPSTREAM marker).

---

## WS1 — Vocabulary normalization (repo-wide)

1. Replace `sub-agent` → `subagent` in: `.claude/agents/README.md`,
   `docs/conventions.md`, `docs/cross-tool-setup.md`,
   `docs/copilot-customization-reference.md`, `catalog/skills/new-agent/SKILL.md`,
   `.vscode/settings.json` (comment), `templates/vscode-settings.json` (if same
   comment exists).
2. Add a one-sentence definition to `.claude/agents/README.md` intro:
   *"Vocabulary: an **agent** is the definition file/persona in this folder; a
   **subagent** is that agent invoked as a delegated, fresh-context worker. In
   Copilot the same file also appears as a top-level persona in the agent
   picker; in Claude Code it is always invoked as a subagent."*

## WS2 — Remove the prompts surface from kit teaching (D-4, R-54)

`docs/conventions.md`
3. Delete section "Prompts that route to agents omit `model` and `tools`".
4. File-naming table: drop the two prompt rows (`*.prompt.md`,
   `_example.prompt.md`); reword the underscore-prefix note or drop it.
5. "One README per asset folder": list `.claude/agents/`, `.claude/skills/`,
   `.claude/rules/` (R-48) — remove `.github/prompts/`.

`docs/cross-tool-setup.md`
6. Remove the Prompts row from the surface table, `prompts/` from the layout
   block, and the "Prompts — Copilot-only" section. Replace with one line:
   cross-tool slash commands are `user-invocable` skills (R-54).

`docs/copilot-customization-reference.md`
7. Delete "Level 2: Prompt Files" entirely; retitle remaining levels
   (Instructions → Agents → Skills → Orchestration).
8. Layer table: remove the Prompts row.
9. "How the layers compose" diagram: start from a `user-invocable` skill
   (`/feature`) instead of a prompt.
10. Trade-offs bullet "`.github/prompts/` is the one Copilot-specific asset
    surface" → remove; the `.github/` story is now governed by R-09/R-49
    (exists only when `githubCodeReview: true`).
11. "Useful Chat Commands": remove `/create-prompt` and `/layer-agents` rows.

`docs/why-this-way.md`
12. "Why a shared `.claude/` home": replace "`.github/` keeps only the
    Copilot-only `prompts/` surface" with the R-09/R-49 conditional story.
13. "Why meta-skills": "Three meta-skills" → two (`skill-creator`,
    `new-agent`); strike `layer-agents`.

`docs/workflow-tips.md`
14. Strike `/layer-agents` from the meta-skills section.
15. "Pin models in prompt and agent frontmatter" → "agent frontmatter".

## WS3 — Teach rules-first path scoping (R-52/R-53)

16. `docs/cross-tool-setup.md` "Nested scoping" → rewrite as "Path-scoped
    instructions": default is `.claude/rules/<scope>.md` with `paths:` globs,
    read by both tools; nested `AGENTS.md` + sibling `CLAUDE.md` is the compat
    option for AGENTS.md-ecosystem teams; one mechanism per repo (R-53).
17. `docs/copilot-customization-reference.md` "Path-specific instructions":
    present `.claude/rules/` first, nested AGENTS.md as compat; update the
    layer table's "Path instructions" row and the "When to use what" table.
18. `docs/conventions.md`: "Directory-scoped conventions go in a nested
    AGENTS.md" paragraph → rules-first wording; "One responsibility per file"
    list gains "Rules files have one scope per file (R-52)".
19. `.claude/agents/example-reviewer.md` Procedures: "any applicable nested
    `AGENTS.md`" → "any applicable path-scoped rules or nested AGENTS.md".
20. Add a short "known tool caveats" note (cross-tool-setup, after the rules
    paragraph): path-scoped rules trigger on file *reads* — they may not load
    when creating a brand-new matching file; keep universal musts in AGENTS.md.

## WS4 — Hooks correctness (R-46)

21. `docs/cross-tool-setup.md`: fix the "key fact" exception sentence, the
    surface table row, and "Settings & hooks": `permissions` in
    `.claude/settings.json` are Claude-Code-only, but the `hooks` block is read
    by **both** tools (same format, R-46); Copilot editor feature flags stay in
    `.vscode/settings.json`.
22. `docs/copilot-customization-reference.md`: layer-table Hooks row →
    "`.claude/settings.json` (both tools) + agent-frontmatter `hooks:`
    (agent-scoped, Copilot preview)"; in "Agent-scoped hooks" remove the
    "instead of a global `.github/hooks/` folder" framing.
23. `docs/why-this-way.md`: fix the "(`.claude/settings.json` is the exception:
    Claude Code only…)" parenthetical the same way.

## WS5 — Purge v1 CLI machinery

24. `.claude/agents/README.md` "Adding agents": rewrite for v2 — baseline
    (dual-role) agents live in this folder and ship path-for-path via
    `scripts/install-adoption.mjs`; opt-in agents are registered in
    `catalog/catalog.json` (`agents` map: `{ path, description }`) and offered
    at adoption. Remove all of: `ai-kit.config.json`, `init --agents`,
    `ai-kit update`, hash-tracking, sidecar/keep/take-upstream, the
    `docs/migration.md` link, and the claim that `example-reviewer` sits in the
    catalog map (it is a baseline example in this folder).
25. `docs/conventions.md` "Checking conformance": replace `ai-kit audit` +
    `/optimize` + dead `docs/optimization.md` link with: run the
    `ai-kit-check` skill (or `node <kit>/scripts/audit.mjs --root .`).
26. `docs/workflow-tips.md`: replace the "`ai-kit init` category picker /
    `--skills terraform,…`" bullet with the v2 story: opt-in catalog items are
    offered during adoption (`adopt-plan`); `/ai-kit-adopt` is the entry point.
27. `.claude/settings.json`: remove `Bash(node bin/ai-kit.mjs migrate*)`,
    `Bash(node */bin/ai-kit.mjs migrate*)`, `Write(./.ai-kit-migration-routing.json)`.

## WS6 — Small accuracy fixes

28. `catalog/skills/new-agent/SKILL.md`: description typo "create, create, add"
    → "create, add"; step 9 "`@` menu" → "agent picker".
29. `docs/cross-tool-setup.md` "Verify it works": "`@` / agent picker" →
    "agent picker".
30. `.claude/skills/README.md`: attribute the 1,024-char description cap to the
    Agent Skills spec (R-19), not Copilot.
31. `docs/built-in-reference.md`: tools-table preamble gains "ai-kit agents use
    Claude tool names (R-29); this table is the Copilot-native vocabulary they
    map to." Annotate `/create-prompt` row: "not part of ai-kit's surface
    (R-54)."
32. `docs/adoption-guide.md`: "skills do not load in Ask/Edit modes" → "in
    non-agent modes (e.g. Ask)".
33. `docs/conventions.md` tool tiers, orchestrator bullet: name the actual
    grants — `Task` (Claude Code) / `agent/runSubagent` (Copilot).
34. `spec/rules.md` R-10: "no AGENTS.md fallback (verified June 2026)" →
    "do not rely on any AGENTS.md fallback (behavior unconfirmed/contested;
    the shim makes it moot)".

## WS7 — CI guardrail (extends V2-PLAN 4.1/4.5 acceptance)

35. New `scripts/docs-consistency.mjs` (zero-dep, wired into `npm test` and the
    pipeline): fails on any match of `bin/ai-kit.mjs`, `/migrate`, `/optimize`,
    `ai-kit init`, `ai-kit update`, `ai-kit.config.json`, `layer-agents`,
    `.github/prompts`, `.prompt.md`, `sub-agent` across `README.md`,
    `AGENTS.md`, `ADOPT.md`, `docs/` (excluding `docs/dev/`), `templates/`,
    `catalog/`, `.claude/` (excluding vendored `UPSTREAM`-marked skills), and
    `.claude/settings.json`.
36. Same script verifies every relative Markdown link in those trees resolves
    (R-07 discipline for the kit's own docs, which the audit doesn't cover).

## WS8 — Verification (definition of done)

37. `npm test` green; `node scripts/audit.mjs --root . --strict` clean.
38. `node scripts/docs-consistency.mjs` clean (and fails when a banned term is
    deliberately seeded).
39. Fresh-context read-through of conventions.md, cross-tool-setup.md,
    copilot-customization-reference.md against `spec/rules.md` — no statement
    contradicts an R-ID. (Use the `docs-auditor`/`example-reviewer` pattern:
    read-only pass, findings by file:line.)
40. Grep proof for V2-PLAN 4.5 acceptance recorded in the PR description.

---

**Suggested commit slicing**: WS1+WS6 (mechanical wording) · WS2 (prompts
removal) · WS3 (rules-first) · WS4 (hooks) · WS5 (v1 purge, incl. settings) ·
WS7 (CI gate) — each independently reviewable; WS8 gates the merge.

**Out of scope (deliberate)**: building a scoping meta-skill; touching the
vendored `skill-creator`; any change to the adoption engine or rule semantics
other than item 34's wording.
