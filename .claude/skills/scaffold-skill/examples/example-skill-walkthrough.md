# Example: Walking through `scaffold-skill`

A short narrative showing what `scaffold-skill` does end-to-end.

## The request

> User: "I want a skill for enforcing our commit message format."

## The three questions

**1. What is the skill for?**

> User: "It enforces our commit message format — type(scope): subject, with an
> optional body and footer."

**2. When should it activate?**

> User: "When the user is about to commit, or asks for a commit message, or
> pastes a draft commit message to review."

**3. Does it need detailed references, scripts, or examples?**

> User: "Just a couple of good-and-bad examples. No scripts, no long
> references."

## The decision

A few inline examples fit comfortably in ~200 lines. Single-file is correct.

## The generated skill

File: `.claude/skills/commit-message-format/SKILL.md`

```markdown
---
name: commit-message-format
description: "Enforces the project's commit message format (type(scope): subject, optional body and footer). Activate when the user is preparing a commit, drafting a commit message, or asking to review a commit message."
argument-hint: "[describe the change]"
---

# Commit Message Format

## When to Use

- The user is about to commit.
- The user asks "help me write a commit message."
- The user pastes a draft commit message for review.

## Workflow

1. Read the staged diff (via the file-read tool if available).
2. Infer `type` (feat / fix / refactor / docs / test / chore).
3. Infer `scope` from the changed paths.
4. Compose a subject line ≤72 chars, imperative mood, no trailing period.
5. If the change is non-trivial, add a body paragraph explaining *why*.

## Examples

**Good:**
`feat(api): validate pagination limits in list endpoints`

**Bad:**
`updated api` — missing type, missing scope, past tense, no detail.
```

## Why it conforms

- `description` includes both **what** (enforces the format) and **when** (the
  three activation triggers) — this drives auto-activation.
- Single-file — body fits well under 200 lines.
- `name` matches the folder (`commit-message-format`).
- Kebab-case, no namespace prefix.
- No sibling files, so no Markdown links to maintain.

This is what the meta-skill produces. It's also what a conformant skill looks
like when you write one by hand.
