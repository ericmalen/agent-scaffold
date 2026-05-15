# Optimization Rules

Decision framework for the `optimizer` agent. Read this after parsing the
`ai-kit audit --json` report and before building the batch plan.

---

## Fix Classes

Every finding in the audit report carries a `fixable` field:

| Class | Meaning | Who acts |
|---|---|---|
| `deterministic` | Mechanical, unambiguous fix — the agent can apply it without judgment | optimizer applies directly |
| `semantic` | Requires judgment about intent, scope, or content — the agent must reason before acting | optimizer reasons, then proposes the fix in the plan |
| `manual` | The fix requires human knowledge the agent cannot infer | plan documents the issue; user must act |

For `deterministic` findings, the optimizer describes the fix in the plan and
applies it on approval without further thought.

For `semantic` findings, the optimizer must do the reasoning **before**
writing the plan — the plan entry must be concrete ("move lines 45–72 into
.cursor/rules/backend/AGENTS.md") not vague ("consider moving some rules").

For `manual` findings, the plan entry explains the issue and what the user
must do. The optimizer does not attempt to fix these.

---

## Per-Semantic-Check Procedures

### `agents-md-over-two-pages` / `agents-md-directory-scoped-rule`

These two findings are closely related — a root AGENTS.md that is over two
pages almost always contains directory-scoped rules.

**Procedure:**
1. Read the full root AGENTS.md.
2. Identify each heading or rule block that applies only to a specific
   subdirectory or layer (e.g., "## Backend", "## src/api rules").
3. For each such block, determine the target directory (the one named in the
   heading or implied by the content).
4. In the plan, list each extraction as: "move lines X–Y to
   `<dir>/AGENTS.md` (create) + `<dir>/CLAUDE.md` (create, content:
   `@AGENTS.md`)".
5. On approval, write the nested files first, then remove the extracted
   content from the root. Never delete before writing.
6. Cross-reference the `layer-agents` skill — the nested AGENTS.md format
   it produces is the target format here.

---

### `skill-md-too-long`

**Procedure:**
1. Read the full SKILL.md.
2. Identify sections that are reference material (tables, check lists,
   decision frameworks) vs. sections that are worked examples.
3. Reference material → move to `references/<topic>.md` in the skill folder.
4. Worked examples → move to `examples/<name>.md` in the skill folder.
5. In the plan, list each move as: "extract section '## X' (lines A–B) into
   `references/topic.md`".
6. Replace the extracted sections in SKILL.md with a `## References` or
   `## Examples` section containing Markdown links to the new files.
7. Cross-reference the `new-skill` skill for the canonical SKILL.md structure.

---

### `redundant-content-agents-md-vs-skill`

**Procedure:**
1. Read the AGENTS.md section that matches the skill's domain vocabulary.
2. Read the skill's SKILL.md to understand what it already covers.
3. **If the AGENTS.md content restates the skill's guidance:** propose
   removing or replacing it with a one-line pointer: "For X, see the
   `<skill-name>` skill (`/<skill-name>`)."
4. **If the repetition is intentional context** (e.g., a one-line summary
   to ensure AI tools always have it in context): note in the plan that no
   change is needed and explain why.
5. Never auto-install an uninstalled skill as a fix. If the skill is not
   installed but would cover the content, recommend running
   `ai-kit init --skills <name>` in the plan notes, but do not run it.

---

### `agent-grants-all-tools`

**Procedure:**
1. Read the agent's `## Procedures` section.
2. List every tool the procedures actually call or imply:
   - Reads files → `Read`
   - Pattern matching → `Grep`, `Glob`
   - Writes/creates files → `Edit`, `Write`
   - Runs shell commands → `Bash`
3. Propose `tools: <comma-list>` with only those tools.
4. Mark as semantic because the right tool list depends on the procedures'
   content.

---

## Batch Plan Format

The optimizer presents **one consolidated plan** grouped by file. This is the
only approval gate — no per-finding menus.

```
## Optimization Plan

### AGENTS.md
- [ ] Extract "## Backend rules" (lines 45–72) → `src/api/AGENTS.md` + `src/api/CLAUDE.md`
- [ ] Extract "## Frontend rules" (lines 73–95) → `src/ui/AGENTS.md` + `src/ui/CLAUDE.md`

### .claude/agents/my-agent.md
- [ ] Add `tools: Read, Grep, Edit` to frontmatter
- [ ] Add `## Never` section (manual — content listed below)
  - Never modify files outside the designated scope.
  - Never apply edits before the user approves a plan.

### .claude/skills/my-skill/SKILL.md
- [ ] Extract "## Check List" (lines 80–150) → `references/check-list.md`
- [ ] Trim `description:` from 1240 chars to under 1024 (move excess to body)

### Manual action required
- [ ] `AGENTS.md`: Fill in `<!-- TODO: Add project overview -->` (line 3)
- [ ] `.claude/agents/my-agent.md`: Add `## Procedures` section
```

Rules for the plan:
- Group by file, not by finding ID.
- For each item, state what will change (lines, content) — be concrete.
- List `manual` items at the end under "Manual action required"; the optimizer
  does not touch these.
- One approval, then execute everything in the plan (skipping manual items).
- Re-run `ai-kit audit` after execution to confirm findings cleared.

---

## What This Skill Never Does

- Apply any edit before the batch plan is approved.
- Delete content that has not yet been written to its new location.
- Create unrelated net-new assets (use `new-skill`, `new-agent`, or
  `layer-agents` for that).
- Resolve `.ai-kit` sidecars or `pendingIntegration` entries (use `migrate`).
- Modify `.claude/ai-kit.json`.
- Auto-install opt-in skills.
- Run `ai-kit init` or `ai-kit update`.
- Use Bash for anything other than `ai-kit audit` / `ai-kit status` and
  approved file deletions (`rm`).
