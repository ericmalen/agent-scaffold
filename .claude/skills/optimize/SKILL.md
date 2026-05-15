---
name: optimize
description: "Front door for auditing and optimizing installed AI assets. Routes into the optimizer agent to classify convention violations, then applies a batch of fixes on single approval. Activate when the user says 'audit my ai-kit', 'optimize my AGENTS.md', 'my AGENTS.md is too long', 'split the root AGENTS.md into nested ones', 'clean up my agents/skills', 'this SKILL.md is too long', 'find convention violations', or 'check my AI config'. Do not use for fresh installs (use init), brownfield migrations (use migrate), or creating new assets (use new-skill, new-agent, layer-agents)."
argument-hint: "[optional: path to consumer repo if not cwd]"
---

# Optimize Installed AI Assets

## When to Use

Use this skill when existing assets need improvement — they drifted from
conventions, were hand-edited into a non-conformant state, or were never
conformant to begin with.

| Verb | When |
|---|---|
| **CREATE** (`new-skill`, `new-agent`, `layer-agents`) | Building net-new conformant assets |
| **MIGRATE** (`migrate`) | Resolving brownfield `.ai-kit` sidecars after `ai-kit init` |
| **OPTIMIZE** (this skill) | Fixing existing assets that violate conventions |

Do **not** use this skill to resolve `pendingIntegration` entries — that is
MIGRATE's domain. If `ai-kit audit` reports `pending-integration-present`,
run `/migrate` first.

## Workflow

This skill is the **front door**. The
[`optimizer`](../../agents/optimizer.md) agent does the actual
classification and edits — it carries the procedures, a constrained tool list,
and explicit safety boundaries.

1. **Audit.** The optimizer runs `ai-kit audit --json` to get a structured
   findings report and reads
   [`references/check-catalog.md`](./references/check-catalog.md) to
   understand each finding.
2. **Classify.** The optimizer reads
   [`references/optimization-rules.md`](./references/optimization-rules.md)
   and classifies each finding: deterministic (mechanical fix), semantic
   (judgment required), or manual (user must act). It does all semantic
   judgment up-front so the plan is concrete.
3. **Plan.** The optimizer presents **one consolidated batch plan** grouped
   by file. No per-finding menus — a single approval gates all writes.
4. **Apply.** On approval the optimizer executes every item. Extracts
   directory-scoped rules into nested `AGENTS.md` + sibling `CLAUDE.md`,
   decomposes over-long `SKILL.md` files into `references/` and `examples/`
   siblings, removes redundant prose, etc.
5. **Confirm.** Re-runs `ai-kit audit` and prints the final summary.

## Skill folder layout

Opt-in skills may live at any depth under `.claude/skills/` — the registry
`path` field is authoritative, e.g. `.claude/skills/terraform/refactor-module`.
Base skills (`base.skills` in `ai-kit.config.json`) must stay at
`.claude/skills/{name}/SKILL.md` (one level). Audit and install both honor the
registered `path`, so grouping opt-in skills by category is safe.

## References

- [Check catalog](./references/check-catalog.md) — every check ID, what it
  detects, and its canonical fix.
- [Optimization rules](./references/optimization-rules.md) — decision framework
  for classifying and fixing findings.
- [Conventions](../../../docs/conventions.md) — the conventions these checks
  enforce.
- [Why this way](../../../docs/why-this-way.md) — rationale behind the
  conventions.

## Examples

- [Worked optimization](./examples/worked-optimization.md) — a full walkthrough:
  root-only AGENTS.md, agent granting all tools, and an over-long SKILL.md,
  all fixed in one batch.
