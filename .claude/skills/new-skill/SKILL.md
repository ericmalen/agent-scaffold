---
name: new-skill
description: "Walks the user through creating a new Agent Skill that conforms to this project's conventions — proper frontmatter, the single-file vs. multi-file decision, and the progressive-disclosure pattern. Use whenever the user wants to create, scaffold, add, set up, or write a new skill, even when they describe it as a 'custom command,' 'saved workflow,' or 'knowledge package' rather than using the word 'skill.' Also use when extracting a reusable skill from a chat the user just had."
argument-hint: "[skill purpose in one sentence]"
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
   2. **When should it activate?** Ask for the *kinds of phrasings* the user
      might type, not a category label. Trigger text the user actually says is
      worth more than a generic category.
   3. **Does it need detailed references, scripts, or examples?**
2. If the answer to (iii) is no → use the single-file template
   [`./templates/single-file-skill.md`](./templates/single-file-skill.md).
3. If yes → use the multi-file template
   [`./templates/multi-file-skill.md`](./templates/multi-file-skill.md) and
   create subfolders for `references/`, `examples/`, or `scripts/` as
   applicable.
4. Generate the `SKILL.md` with correct frontmatter. The folder name and the
   `name` field must match (both kebab-case, no namespace prefix).
5. Write the `description` carefully (see "Writing a good description" below).
   This is the single highest-leverage field — it drives auto-activation, and
   vague descriptions mean the skill never fires.
6. In the `SKILL.md` body, link sibling files with Markdown links
   (`[label](./references/file.md)`). This is the lazy-load path for skills.
   (Agents use plain-text paths — skills use Markdown links. Same goal, opposite
   mechanics, by project convention.)
7. Keep the `SKILL.md` body under ~200 lines. If it's longer, it probably needs
   decomposition into sibling files.
8. **Read the generated file back to the user** and confirm the description
   captures the trigger phrasings they mentioned. Offer to tweak before saving.
9. Tell the user how to verify the skill loaded: type `/skill-name` in chat.
   The skill lives in `.claude/skills/`, which both Claude Code and Copilot read
   automatically (Copilot users can also confirm via **Chat: Open Diagnostics**).

## Writing a good description

The description is read at every chat turn to decide whether the skill should
fire. You want it to fire reliably when it's useful and stay quiet otherwise.
Two failure modes to watch for:

- **Undertriggering** (more common) — the user's phrasing didn't match, so the
  skill never loaded. Fix by including concrete phrasings the user would say,
  plus nearby synonyms. Be a little pushy — hedged descriptions undertrigger.
- **Overtriggering** — the skill fires on adjacent-but-wrong tasks. Fix by
  naming *when not to use* it inline.

**Good vs. weak examples:**

Weak: `"Helps with commit messages."`
(No trigger guidance; no what/when; overtriggers on "commit" in general chat.)

Good: `"Writes and reviews Conventional Commits–style commit messages (type(scope): subject). Activate whenever the user is about to commit, asks to draft a commit message, pastes a draft for review, or asks 'what should I write for this commit?' Do not activate for generic git questions unrelated to message text."`

Aim for the second kind. ≤1024 chars is the hard limit; most good descriptions
land between 200 and 500.

## Frontmatter rules

Stick to the fields both Claude Code and Copilot understand — see the
[skill frontmatter reference](../README.md#frontmatter-fields).

- `name` — kebab-case, no namespace prefix, matches folder name.
- `description` — ≤1024 chars; includes what AND when.
- `argument-hint` — placeholder shown when invoked as a slash command.
- See [Frontmatter fields](../README.md#frontmatter-fields) for all fields and
  their defaults — including `user-invocable` and `disable-model-invocation`.

## Conventions checklist

- [ ] `description` ≤1024 chars; covers both what and when; mentions concrete
      trigger phrasings.
- [ ] Single-file when body fits in ~200 lines, multi-file otherwise.
- [ ] Kebab-case `name`, no namespace prefix, matches the folder.
- [ ] Body links sibling files with Markdown links (skills use Markdown links;
      agents use plain text — don't mix them up).
- [ ] Defaults omitted from frontmatter unless overriding.

## Examples

See
[`./examples/example-skill-walkthrough.md`](./examples/example-skill-walkthrough.md)
for a full single-file walkthrough.

## References

- [Skills in this scaffold](../README.md)
- [Cross-tool setup](../../../docs/cross-tool-setup.md)
