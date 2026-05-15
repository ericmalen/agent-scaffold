# Worked Optimization

Full walkthrough of a `/optimize` session on a repo that has accumulated drift
across several surfaces. Starting state has five finding categories: root
AGENTS.md that is over two pages, a missing `@AGENTS.md` import in `CLAUDE.md`,
a prompt that duplicates agent-owned fields, an agent that grants all tools, and
a `SKILL.md` that is too long.

---

## Starting State

**Consumer repo layout:**
```
AGENTS.md                          ← 155 non-blank lines, no Do Not section
CLAUDE.md                          ← exists but content is "# Project notes"
.gitignore                         ← missing ai-kit-audit-report.json entry
.github/
  prompts/
    review-pr.prompt.md            ← agent: code-reviewer AND tools: Read, Grep
.claude/
  agents/
    code-reviewer.md               ← no tools:, has ## Procedures
  skills/
    my-workflow/
      SKILL.md                     ← 285 lines, large inline check list
  ai-kit.json
```

**`AGENTS.md` (excerpt — 155 non-blank lines):**
```markdown
# Project: acme-api

## Overview
...

## Backend (src/api/)
Always validate input at the controller level.
Never expose raw SQL errors to the client.
Use the service layer for business logic.

## Frontend (src/ui/)
Prefer server components over client components.
Always add loading and error states.

## Testing
...
(many more lines)
```

**`CLAUDE.md`:**
```markdown
# Project notes
Added by the old team. Not sure what this does.
```

**`.github/prompts/review-pr.prompt.md`:**
```markdown
---
agent: code-reviewer
tools: Read, Grep
description: Reviews the current PR for bugs and style issues when asked
---
# Review PR
Run a full code review on the current pull request.
```

**`.claude/agents/code-reviewer.md`:**
```markdown
---
name: code-reviewer
description: Reviews pull requests for bugs and security issues when invoked.
---

# Code Reviewer

Reads staged changes and reports findings. Never modifies files.

## Procedures
1. Run `git diff --staged` to get the diff.
2. Read changed files for context.
3. Grep for known anti-patterns.
4. Report findings grouped by severity.

## Never
- Never modify files.
- Never run destructive git commands.
```

**`.claude/skills/my-workflow/SKILL.md` (line count: 285):**
```markdown
---
name: my-workflow
description: "Runs the team's standard development workflow when requested..."
---
# My Workflow
## When to Use
...
## Workflow Steps
...
## Check List (90 lines of inline checks)
...
## Decision Matrix (65 lines)
...
## Worked Example (30 lines)
...
```

---

## Step 1: Run the Optimizer

User invokes `/optimize`. The optimizer runs:

```bash
ai-kit audit --json
```

---

## Step 2: Audit Output

```json
{
  "schemaVersion": 2,
  "scannedAt": "2026-05-15T09:00:00.000Z",
  "consumerRoot": "/home/user/acme-api",
  "strict": false,
  "summary": {
    "error": 0,
    "warning": 6,
    "info": 2,
    "filesScanned": 5,
    "bySurface": {
      "root-agents-md": 2,
      "root-claude-md": 1,
      "prompt": 1,
      "agent": 1,
      "skill": 1,
      "gitignore": 1
    }
  },
  "findings": [
    {
      "id": "agents-md-over-two-pages",
      "severity": "warning",
      "file": "AGENTS.md",
      "surface": "root-agents-md",
      "message": "Root AGENTS.md is long (155 non-blank lines, 7100 chars). Two pages is the recommended maximum.",
      "fixable": "semantic",
      "convention": "docs/conventions.md:38-40"
    },
    {
      "id": "agents-md-missing-do-not-section",
      "severity": "warning",
      "file": "AGENTS.md",
      "surface": "root-agents-md",
      "message": "Root AGENTS.md is missing a 'Do Not' section.",
      "fixable": "manual"
    },
    {
      "id": "root-claude-md-missing-agents-import",
      "severity": "warning",
      "file": "CLAUDE.md",
      "surface": "root-claude-md",
      "message": "Root CLAUDE.md exists but does not contain '@AGENTS.md'.",
      "fixable": "deterministic",
      "convention": "docs/cross-tool-setup.md:41-51"
    },
    {
      "id": "prompt-routes-agent-with-redundant-fields",
      "severity": "warning",
      "file": ".github/prompts/review-pr.prompt.md",
      "surface": "prompt",
      "message": "Prompt routes to agent \"code-reviewer\" but also sets tools.",
      "fixable": "deterministic",
      "convention": "docs/conventions.md:51-55"
    },
    {
      "id": "agent-grants-all-tools",
      "severity": "warning",
      "file": ".claude/agents/code-reviewer.md",
      "surface": "agent",
      "message": "Agent has no 'tools:' frontmatter — grants all tools by default.",
      "fixable": "deterministic",
      "suggestedFix": "tools: Read, Grep, Bash",
      "convention": "docs/conventions.md:43-49"
    },
    {
      "id": "skill-md-too-long",
      "severity": "warning",
      "file": ".claude/skills/my-workflow/SKILL.md",
      "surface": "skill",
      "message": "SKILL.md is 285 lines (max ~200).",
      "fixable": "semantic"
    },
    {
      "id": "agents-md-directory-scoped-rule",
      "severity": "info",
      "file": "AGENTS.md",
      "surface": "root-agents-md",
      "line": 9,
      "message": "Root AGENTS.md may contain directory-scoped rules that belong in a nested AGENTS.md.",
      "fixable": "semantic"
    },
    {
      "id": "gitignore-missing-ai-kit-entries",
      "severity": "info",
      "file": ".gitignore",
      "surface": "gitignore",
      "message": ".gitignore is missing the entry \".claude/ai-kit-audit-report.json\".",
      "fixable": "deterministic",
      "suggestedFix": "Add \".claude/ai-kit-audit-report.json\" to .gitignore"
    }
  ]
}
```

---

## Step 3: Classifier Reasoning

The optimizer reads `check-catalog.md` and `optimization-rules.md`, then
classifies each finding:

| Finding | Fix class | Action |
|---|---|---|
| `agents-md-over-two-pages` | semantic | Reason about which sections are directory-scoped and where to move them |
| `agents-md-missing-do-not-section` | manual | Document — do not auto-apply |
| `root-claude-md-missing-agents-import` | deterministic | Prepend `@AGENTS.md` to `CLAUDE.md` |
| `prompt-routes-agent-with-redundant-fields` | deterministic | Remove `tools:` from prompt frontmatter |
| `agent-grants-all-tools` | deterministic | Apply `suggestedFix: "tools: Read, Grep, Bash"` directly |
| `skill-md-too-long` | semantic | Reason about which sections to extract to `references/` and `examples/` |
| `agents-md-directory-scoped-rule` | semantic | Already covered by `agents-md-over-two-pages` extraction — folded in |
| `gitignore-missing-ai-kit-entries` | deterministic | Append missing entry to `.gitignore` |

---

## Step 4: Batch Plan

The optimizer presents **one consolidated plan**:

```
## Optimization Plan

### CLAUDE.md
- [ ] Prepend `@AGENTS.md` as the first line (fixes root-claude-md-missing-agents-import)

### AGENTS.md
- [ ] Extract "## Backend (src/api/)" (lines 14–18) →
      `src/api/AGENTS.md` (create) + `src/api/CLAUDE.md` (create, @AGENTS.md)
- [ ] Extract "## Frontend (src/ui/)" (lines 20–24) →
      `src/ui/AGENTS.md` (create) + `src/ui/CLAUDE.md` (create, @AGENTS.md)
- [ ] Extract "## Testing" section (lines 26–60) →
      `test/AGENTS.md` (create) + `test/CLAUDE.md` (create, @AGENTS.md)
- [ ] Remove the three extracted sections from root AGENTS.md

### .github/prompts/review-pr.prompt.md
- [ ] Remove `tools: Read, Grep` line from frontmatter
      (agent: code-reviewer owns tools — duplicating them causes drift)

### .claude/agents/code-reviewer.md
- [ ] Add `tools: Read, Grep, Bash` to frontmatter
      (from audit suggestedFix — Procedures reference git diff, reads, grep)

### .claude/skills/my-workflow/SKILL.md
- [ ] Extract "## Check List" (lines 80–170) →
      `.claude/skills/my-workflow/references/check-list.md`
- [ ] Extract "## Decision Matrix" (lines 171–235) →
      `.claude/skills/my-workflow/references/decision-matrix.md`
- [ ] Extract "## Worked Example" (lines 236–265) →
      `.claude/skills/my-workflow/examples/worked-example.md`
- [ ] Replace extracted sections with Markdown links to the new files

### .gitignore
- [ ] Append `.claude/ai-kit-audit-report.json` under `# Added by ai-kit optimize`

### Manual action required (optimizer will not touch these)
- [ ] `AGENTS.md`: Add a `## Do Not` section listing universal prohibitions
      (e.g., no secrets in code, no @ts-ignore without justification)
```

---

## Step 5: Single Approval

User reviews the plan, confirms it looks correct, and approves.

---

## Step 6: Execution Order

The optimizer applies every non-manual item, honouring the write-before-delete
invariant:

1. Creates `src/api/AGENTS.md` with the Backend rules section.
2. Creates `src/api/CLAUDE.md` containing `@AGENTS.md`.
3. Creates `src/ui/AGENTS.md` with the Frontend rules section.
4. Creates `src/ui/CLAUDE.md` containing `@AGENTS.md`.
5. Creates `test/AGENTS.md` with the Testing section.
6. Creates `test/CLAUDE.md` containing `@AGENTS.md`.
7. Removes the three extracted sections from root `AGENTS.md`. ← write before delete
8. Creates `.claude/skills/my-workflow/references/check-list.md`.
9. Creates `.claude/skills/my-workflow/references/decision-matrix.md`.
10. Creates `.claude/skills/my-workflow/examples/worked-example.md`.
11. Replaces extracted sections in `SKILL.md` with Markdown links.
12. Prepends `@AGENTS.md` to `CLAUDE.md`.
13. Removes `tools: Read, Grep` from `review-pr.prompt.md`.
14. Adds `tools: Read, Grep, Bash` to `code-reviewer.md` frontmatter.
15. Appends `.claude/ai-kit-audit-report.json` to `.gitignore`.

---

## Step 7: Final State

```
AGENTS.md                          ← ~45 lines, universal rules only
CLAUDE.md                          ← @AGENTS.md (first line)
.gitignore                         ← both ai-kit entries present
src/
  api/
    AGENTS.md                      ← backend rules
    CLAUDE.md                      ← @AGENTS.md
  ui/
    AGENTS.md                      ← frontend rules
    CLAUDE.md                      ← @AGENTS.md
test/
  AGENTS.md                        ← testing rules
  CLAUDE.md                        ← @AGENTS.md
.github/
  prompts/
    review-pr.prompt.md            ← agent: code-reviewer only (tools: removed)
.claude/
  agents/
    code-reviewer.md               ← tools: Read, Grep, Bash added
  skills/
    my-workflow/
      SKILL.md                     ← ~95 lines, links to references + examples
      references/
        check-list.md
        decision-matrix.md
      examples/
        worked-example.md
  ai-kit.json
```

**Final `ai-kit audit` output:**

```
8 file(s) scanned — 0 errors, 0 warnings, 1 info

AGENTS.md
  [info]    agents-md-unfilled-todo:3: Root AGENTS.md has unfilled TODO placeholders.

Run /optimize to fix these issues automatically.
```

The one remaining finding (`agents-md-unfilled-todo`) has fix class `none` —
the optimizer never auto-applies it. The manual `## Do Not` item also remains
until the user addresses it by hand.

---

## Key Points

- **One approval** gates all automated fixes — no per-finding prompts.
- **Write before delete** — nested files are created before the root is trimmed
  (steps 1–7 above).
- **`suggestedFix` on deterministic findings** — `agent-grants-all-tools` used
  the audit's auto-detected tool list directly; no manual reasoning needed.
- **`convention` citations** — each finding carries the doc pointer so the plan
  can explain _why_ a fix is required, not just what to change.
- **Prompt agent-routing conflict** — removing `tools:` from the prompt is a
  one-line deterministic fix; the agent is the source of truth.
- **Manual items are never auto-applied** — documented in the plan, left for
  the user.
- **The manifest is never touched** — drift from `sourceHash` is expected for
  managed files and is already reported by `ai-kit status`.
