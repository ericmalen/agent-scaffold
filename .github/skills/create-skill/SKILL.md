---
name: create-skill
description: "Walks the user through creating a new Agent Skill following project conventions. Generates proper frontmatter, chooses between single-file and multi-file layouts, and follows the lazy-load pattern. Activate when the user wants to create, scaffold, or set up a new skill."
argument-hint: "[skill purpose in one sentence]"
user-invocable: true
disable-model-invocation: false
---

# Create Skill

## Purpose

Scaffold a new skill that conforms to this project's conventions — correct
frontmatter, single-file vs. multi-file chosen on merit, progressive loading
respected.

## Workflow

1. Ask the user three things:
   1. **What is the skill for?** (one sentence — this becomes the core of the
      description).
   2. **When should it activate?** (the trigger — task keywords, file types,
      user phrasing that should cause Copilot to pick it).
   3. **Does it need detailed references, scripts, or examples?**
2. If the answer to (iii) is no → use the single-file template
   [`./templates/single-file-skill.md`](./templates/single-file-skill.md).
3. If yes → use the multi-file template
   [`./templates/multi-file-skill.md`](./templates/multi-file-skill.md) and
   create subfolders for `references/`, `examples/`, or `scripts/` as
   applicable.
4. Generate the `SKILL.md` with correct frontmatter. The folder name and the
   `name` field must match (both kebab-case, no namespace prefix).
5. Write a `description` that includes both **what it does** and **when to use
   it**. This string drives auto-activation — vague descriptions mean the skill
   never fires. Keep under 1024 characters.
6. In the `SKILL.md` body, link sibling files with Markdown links
   (`[label](./references/file.md)`). This is the lazy-load path for skills.
7. Remind the user: keep the `SKILL.md` body under ~200 lines. If it's longer,
   it probably needs decomposition into sibling files.

## Frontmatter rules

- [`name`](../../../docs/copilot-customization-reference.md#level-4-agent-skills) —
  kebab-case, no namespace prefix, matches folder name.
- [`description`](../../../docs/copilot-customization-reference.md#level-4-agent-skills) —
  ≤1024 chars; includes what AND when.
- [`argument-hint`](../../../docs/copilot-customization-reference.md#level-4-agent-skills) —
  placeholder shown when invoked as a slash command.
- [`user-invocable`](../../../docs/copilot-customization-reference.md#level-4-agent-skills) —
  usually `true`; set `false` to hide from the `/` menu.
- [`disable-model-invocation`](../../../docs/copilot-customization-reference.md#level-4-agent-skills) —
  usually `false`; set `true` to require manual `/` invocation.

## Conventions checklist

- [ ] `description` under 1024 chars; includes both what and when.
- [ ] Single-file when body fits in ~200 lines, multi-file otherwise.
- [ ] No namespace prefixes in `name`.
- [ ] Skill name is kebab-case and matches the folder.
- [ ] Body links sibling files with Markdown links (not plain-text paths —
      that's the agent convention, not the skill convention).

## Examples

See
[`./examples/example-skill-walkthrough.md`](./examples/example-skill-walkthrough.md)
for a full walkthrough.

## References

- [Agent Skills reference](../../../docs/copilot-customization-reference.md#level-4-agent-skills)
