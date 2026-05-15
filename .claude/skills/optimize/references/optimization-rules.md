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
7. Cross-reference the `skill-creator` skill for the canonical SKILL.md structure.

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
- If `finding.fixable === 'deterministic'` (Procedures section present): apply
  `finding.suggestedFix` directly as the `tools:` value. No further reasoning
  needed.
- If `finding.fixable === 'manual'` (no Procedures section): document in "Manual
  action required" — the agent also needs `agent-missing-procedures-section`
  fixed first.

---

### `root-claude-md-missing` / `root-claude-md-missing-agents-import`

**Procedure (deterministic):**
- Create or overwrite `CLAUDE.md` at the repo root with a single line:
  `@AGENTS.md`
- For `root-claude-md-missing-agents-import`: prepend `@AGENTS.md\n` if the
  file has existing content worth keeping; otherwise replace entirely.

---

### `nested-claude-md-missing-agents-import`

**Procedure (deterministic):**
- Prepend `@AGENTS.md\n` to the sibling `CLAUDE.md` content, or replace the
  file if it contains nothing meaningful beyond the wrong content.

---

### `gitignore-missing-ai-kit-entries` / `gitignore-missing`

**Procedure (deterministic):**
- For `gitignore-missing`: create `.gitignore` with the two required entries.
- For `gitignore-missing-ai-kit-entries`: append a block at the end of the
  existing `.gitignore`:
  ```
  # Added by ai-kit optimize
  .claude/settings.local.json
  .claude/ai-kit-audit-report.json
  ```
  Only append lines that are actually missing.

---

### `.vscode/settings.json` findings (`vscode-ai-key-missing-or-wrong`, `vscode-settings-missing`)

**Do NOT auto-apply.** Preserve user comments by documenting the exact change
in the plan under "Manual action required". Include the key+value from
`finding.suggestedFix`. Example plan entry:
```
### Manual action required
- [ ] `.vscode/settings.json`: Add "chat.useClaudeMdFile": false
- [ ] `.vscode/settings.json`: Add "chat.useAgentSkills": true
```

---

### `agent-missing-never-section`

**Procedure:**
1. Read the full agent file at `finding.file`.
2. Draft 3–6 `Never` bullets from these signals:
   - Frontmatter `tools:` — call out anything the agent must not use (e.g.
     no Bash → "Run Bash"; Read-only tools → "Modify or delete files").
   - Body procedures — the inverse of any "first get approval, then …"
     step becomes a Never (e.g. "Apply edits before approval").
   - Cross-cutting ai-kit invariants when relevant: "Modify
     `.claude/ai-kit.json`", "Auto-install opt-in skills", "Resolve
     `pendingIntegration` entries (that's `migrate`'s job)".
3. In the plan, list the full draft block under the agent's file so the
   user approves or edits before apply. Do NOT classify as manual.

---

### `agent-description-missing-when`

**Procedure:**
1. Read the existing `description:` from frontmatter and the agent's first
   body paragraph (role statement).
2. Draft a single trailing sentence of the form
   "Invoke when the user says '<trigger phrase>' or asks to <task>." Pull
   trigger phrases from the role statement (verbs + objects), not from
   thin air.
3. In the plan, show the before and after `description:` value. The user
   can edit the trigger phrasing before approval. Do NOT classify as manual.

---

### `skill-body-uses-plaintext-sibling-paths`

**Procedure:**
1. The detector already ignores matches inside fenced code blocks — every
   finding is prose.
2. For each plaintext path at `finding.line`, propose a Markdown-link
   replacement: `./references/foo.md` → `[foo](./references/foo.md)`. Use
   the file's basename (without extension) as the link label unless the
   surrounding sentence already names the file.
3. In the plan, list each replacement as `line N: ./path → [label](./path)`.
   Apply on approval.

---

### `audit-report-committed`

**Procedure (deterministic):**
- Append `.claude/ai-kit-audit-report.json` to `.gitignore` (same as
  `gitignore-missing-ai-kit-entries`).

---

### `prompt-routes-agent-with-redundant-fields`

**Procedure (deterministic):**
- Remove the `model:` and/or `tools:` lines from the prompt frontmatter.

---

### `claude-settings-missing-env-deny`

**Procedure (deterministic):**
- Add the missing rule(s) from `finding.suggestedFix` to the `permissions.deny`
  array in `.claude/settings.json`.

---

### `asset-folder-missing-readme`

**Procedure (deterministic):**
- Create a minimal `README.md` in the flagged folder following the same header
  pattern as the corresponding file in the scaffold (e.g. `# Agents`/`# Skills`
  heading + one-line description of the folder's purpose). Do NOT copy the full
  scaffold README — write a consumer-appropriate stub.

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
- Create unrelated net-new assets (use `skill-creator`, `new-agent`, or
  `layer-agents` for that).
- Resolve `.ai-kit` sidecars or `pendingIntegration` entries (use `migrate`).
- Modify `.claude/ai-kit.json`.
- Auto-install opt-in skills.
- Run `ai-kit init` or `ai-kit update`.
- Use Bash for anything other than `ai-kit audit` / `ai-kit status` and
  approved file deletions (`rm`).
