# Worked Optimization

Full walkthrough of a real `/optimize` session. Starting state has three
violation categories: a root-only AGENTS.md that is over two pages, an agent
that grants all tools, and a SKILL.md that is too long.

---

## Starting State

**Consumer repo layout:**
```
AGENTS.md                          ← 3 pages, root-only, no Do Not section
.claude/
  agents/
    code-reviewer.md               ← no tools:, no ## Never
  skills/
    my-workflow/
      SKILL.md                     ← 280 lines, huge check list inline
  ai-kit.json
```

**`AGENTS.md` (excerpt — 150 non-blank lines total):**
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

**`.claude/agents/code-reviewer.md`:**
```markdown
---
name: code-reviewer
description: Reviews pull requests for bugs and security issues.
---

# Code Reviewer

Reads staged changes and reports findings. Never modifies files.

## Procedures
1. Run `git diff --staged` to get the diff.
2. Analyze for bugs, security issues, and logic errors.
3. Report findings grouped by severity.
```

**`.claude/skills/my-workflow/SKILL.md` (line count: 280):**
```markdown
---
name: my-workflow
description: "Runs the team's standard development workflow..."
---
# My Workflow
## When to Use
...
## Workflow
...
## Check List (80 lines of inline checks)
...
## Decision Matrix (60 lines)
...
## Worked Example (40 lines)
...
```

---

## Step 1: Run the Optimizer

User invokes `/optimize` in their AI tool. The optimizer runs:

```bash
ai-kit audit --json
```

---

## Step 2: Audit Output

```json
{
  "schemaVersion": 1,
  "scannedAt": "2025-10-15T09:00:00.000Z",
  "consumerRoot": "/home/user/acme-api",
  "summary": { "error": 0, "warning": 6, "info": 2, "filesScanned": 4 },
  "findings": [
    {
      "id": "agents-md-over-two-pages",
      "severity": "warning",
      "file": "AGENTS.md",
      "message": "Root AGENTS.md is long (150 non-blank lines, 6800 chars).",
      "fixable": "semantic"
    },
    {
      "id": "agents-md-missing-do-not-section",
      "severity": "warning",
      "file": "AGENTS.md",
      "message": "Root AGENTS.md is missing a 'Do Not' section.",
      "fixable": "manual"
    },
    {
      "id": "agents-md-directory-scoped-rule",
      "severity": "info",
      "file": "AGENTS.md",
      "line": 9,
      "message": "Root AGENTS.md may contain directory-scoped rules.",
      "fixable": "semantic"
    },
    {
      "id": "agent-grants-all-tools",
      "severity": "warning",
      "file": ".claude/agents/code-reviewer.md",
      "message": "Agent has no 'tools:' frontmatter — grants all tools.",
      "fixable": "semantic"
    },
    {
      "id": "agent-missing-never-section",
      "severity": "warning",
      "file": ".claude/agents/code-reviewer.md",
      "message": "Agent is missing a '## Never' section.",
      "fixable": "manual"
    },
    {
      "id": "skill-md-too-long",
      "severity": "warning",
      "file": ".claude/skills/my-workflow/SKILL.md",
      "message": "SKILL.md is 280 lines (max ~200).",
      "fixable": "semantic"
    }
  ]
}
```

---

## Step 3: Batch Plan

The optimizer reads `check-catalog.md` and `optimization-rules.md`, reasons
through the semantic findings, and presents **one consolidated plan**:

```
## Optimization Plan

### AGENTS.md
- [ ] Extract "## Backend (src/api/)" (lines 14–18) →
      `src/api/AGENTS.md` (create) + `src/api/CLAUDE.md` (create, @AGENTS.md)
- [ ] Extract "## Frontend (src/ui/)" (lines 20–24) →
      `src/ui/AGENTS.md` (create) + `src/ui/CLAUDE.md` (create, @AGENTS.md)
- [ ] Extract "## Testing" section (lines 26–55) →
      `test/AGENTS.md` (create) + `test/CLAUDE.md` (create, @AGENTS.md)

### .claude/agents/code-reviewer.md
- [ ] Add `tools: Read, Bash` to frontmatter (Procedures use git diff + reads)

### .claude/skills/my-workflow/SKILL.md
- [ ] Extract "## Check List" (lines 80–160) →
      `.claude/skills/my-workflow/references/check-list.md`
- [ ] Extract "## Decision Matrix" (lines 161–220) →
      `.claude/skills/my-workflow/references/decision-matrix.md`
- [ ] Extract "## Worked Example" (lines 221–260) →
      `.claude/skills/my-workflow/examples/worked-example.md`
- [ ] Replace extracted sections with a ## References + ## Examples section
      containing Markdown links to the new files

### Manual action required (optimizer will not touch these)
- [ ] `AGENTS.md`: Add a `## Do Not` section with universal prohibitions
- [ ] `.claude/agents/code-reviewer.md`: Add a `## Never` section
      (e.g., "Never modify files. Never run destructive git commands.")
```

---

## Step 4: Single Approval

User reviews the plan, confirms it looks correct, and types "approved" (or
equivalent).

---

## Step 5: Execution

The optimizer applies every non-manual item:

1. Creates `src/api/AGENTS.md` with the Backend rules section.
2. Creates `src/api/CLAUDE.md` containing `@AGENTS.md`.
3. Creates `src/ui/AGENTS.md` with the Frontend rules section.
4. Creates `src/ui/CLAUDE.md` containing `@AGENTS.md`.
5. Creates `test/AGENTS.md` with the Testing section.
6. Creates `test/CLAUDE.md` containing `@AGENTS.md`.
7. Removes the three extracted sections from root `AGENTS.md`.
8. Adds `tools: Read, Bash` to `.claude/agents/code-reviewer.md` frontmatter.
9. Creates `.claude/skills/my-workflow/references/check-list.md` with extracted content.
10. Creates `.claude/skills/my-workflow/references/decision-matrix.md`.
11. Creates `.claude/skills/my-workflow/examples/worked-example.md`.
12. Replaces extracted sections in `SKILL.md` with links to the new files.

---

## Step 6: Final State

```
AGENTS.md                          ← ~40 lines, universal rules only
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
.claude/
  agents/
    code-reviewer.md               ← tools: Read, Bash added
  skills/
    my-workflow/
      SKILL.md                     ← ~90 lines, links to references + examples
      references/
        check-list.md
        decision-matrix.md
      examples/
        worked-example.md
  ai-kit.json
```

**Final `ai-kit audit` output:**

```
4 file(s) scanned — 0 errors, 0 warnings, 0 info

  ✓ No issues found across 4 file(s).
```

The two manual items remain flagged on the next audit (Do Not section,
## Never section) until the user addresses them by hand.

---

## Key Points

- **One approval** gates all automated fixes — no per-finding prompts.
- **Write before delete** — nested files are created before the root is trimmed.
- **Manual items are never auto-applied** — they are documented and left for
  the user.
- **The manifest is never touched** — drift from `sourceHash` is expected for
  managed files like `AGENTS.md` and is already reported by `ai-kit status`.
