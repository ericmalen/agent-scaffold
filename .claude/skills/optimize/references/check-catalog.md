# Check Catalog

Human-readable reference for every check emitted by `ai-kit audit`.
The optimizer agent reads this to understand each finding before classifying it.

Each entry lists: the finding ID, what triggers it, which convention it
enforces (with a doc pointer), the fix class, and the canonical fix.

---

## Root AGENTS.md checks

### `agents-md-over-two-pages`
**Triggers:** >120 non-blank lines OR >6000 chars.  
**Convention:** Root AGENTS.md should stay under two pages so it loads quickly
on every interaction. See [conventions.md](../../../../docs/conventions.md).  
**Fix class:** semantic  
**Canonical fix:** Identify headings or rule blocks that are directory- or
layer-specific. Move them to a nested `AGENTS.md` in the relevant subdirectory
(plus a sibling `CLAUDE.md` containing `@AGENTS.md`). Use the `layer-agents`
skill for the extraction. What remains in the root should be universal rules
only.

---

### `agents-md-missing-do-not-section`
**Triggers:** No `## Do Not` heading found.  
**Convention:** Every root AGENTS.md should have an explicit list of
universal prohibitions.  
**Fix class:** manual  
**Canonical fix:** Add a `## Do Not` section listing universal rules (no
secrets in code, no `@ts-ignore` without justification, never modify generated
files, etc.).

---

### `agents-md-unfilled-todo`
**Triggers:** A `<!-- TODO: ... -->` comment found in the file.  
**Convention:** The ai-kit template ships with placeholder TODOs; they must be
replaced before the file is useful.  
**Fix class:** manual  
**Canonical fix:** Replace each `<!-- TODO: ... -->` block with real project
content.

---

### `agents-md-directory-scoped-rule`
**Triggers:** A heading or bullet that names a specific subdirectory or layer.  
**Convention:** Directory-scoped rules belong in a nested AGENTS.md, not the
root. See [why-this-way.md](../../../../docs/why-this-way.md).  
**Fix class:** semantic  
**Canonical fix:** Extract the section into a nested `AGENTS.md` under the
named directory. This is the most common reason root AGENTS.md grows too long.
Use the `layer-agents` skill to create the nested file.

---

## Nested AGENTS.md checks

### `nested-agents-md-too-long`
**Triggers:** >50 lines.  
**Convention:** Nested instruction files should be short and focused.  
**Fix class:** semantic  
**Canonical fix:** Move growing content to skills (`references/`, `examples/`).
Keep the nested AGENTS.md to a handful of scoped rules.

---

### `nested-agents-md-has-frontmatter`
**Triggers:** File starts with `---`.  
**Convention:** Nested AGENTS.md files are plain markdown. Only agent and skill
files use frontmatter.  
**Fix class:** deterministic  
**Canonical fix:** Remove the frontmatter block.

---

### `nested-agents-md-missing-sibling-claude`
**Triggers:** No `CLAUDE.md` in the same directory.  
**Convention:** Claude Code reads `CLAUDE.md`, not `AGENTS.md`. A sibling
`CLAUDE.md` containing only `@AGENTS.md` is required for full cross-tool
coverage. See [cross-tool-setup.md](../../../../docs/cross-tool-setup.md).  
**Fix class:** deterministic  
**Canonical fix:** Create a sibling `CLAUDE.md` with the single line
`@AGENTS.md`.

---

## Agent checks

### `agent-grants-all-tools`
**Triggers:** No `tools:` key in the agent's YAML frontmatter.  
**Convention:** Agents should declare only the tools they need. Omitting
`tools:` grants all tools. See [conventions.md](../../../../docs/conventions.md).  
**Fix class:** semantic  
**Canonical fix:** Add `tools: Read, Grep, Glob, Edit, Write, Bash` (or a
subset) based on what the agent's procedures actually do.

---

### `agent-documents-uses-markdown-links`
**Triggers:** A `## Documents` section contains `[label](path)` Markdown links.  
**Convention:** AI tools read `## Documents` as a list of plain file paths to
lazy-load. Markdown links are not parsed correctly.  
**Fix class:** deterministic  
**Canonical fix:** Replace `[label](path)` entries with bare paths, one per
line, relative to the consumer repo root.

---

### `agent-missing-never-section`
**Triggers:** No `## Never` heading found.  
**Convention:** Every agent must have an explicit `## Never` section listing
prohibited actions. This is a safety boundary, not optional.  
**Fix class:** manual  
**Canonical fix:** Add a `## Never` section enumerating what this agent must
not do (apply edits before approval, modify the manifest, etc.).

---

### `agent-missing-procedures-section`
**Triggers:** No `## Procedures` heading found.  
**Convention:** Agents need step-by-step procedures so they execute
predictably and reproducibly.  
**Fix class:** manual  
**Canonical fix:** Add a `## Procedures` section with numbered steps.

---

### `agent-missing-role-statement`
**Triggers:** No non-heading body line found after the frontmatter.  
**Convention:** A one-line role statement immediately after the title
tells AI tools what the agent does and what it never does at a glance.  
**Fix class:** manual  
**Canonical fix:** Add a short paragraph after the `# Title` heading and
before `## Procedures` that describes the agent's purpose and its key
constraint.

---

### `agent-weak-description`
**Triggers:** Description has fewer than 8 words.  
**Convention:** A richer description helps AI tools decide when to invoke this
agent.  
**Fix class:** manual  
**Canonical fix:** Expand the `description:` frontmatter to include trigger
phrasings and a "do not use for" clause.

---

### `agent-description-missing-when`
**Triggers:** Description does not contain the word "when".  
**Convention:** Agent descriptions should state when to invoke the agent so
AI tools activate it on the right trigger.  
**Fix class:** manual  
**Canonical fix:** Add a "when" clause, e.g. "Invoke when the user says…".

---

## Skill checks

### `skill-name-folder-mismatch`
**Triggers:** `name:` in frontmatter does not match the containing folder name.  
**Convention:** The skill name must match its folder exactly — that is how AI
tools discover and invoke it.  
**Fix class:** deterministic  
**Canonical fix:** Rename either the `name:` value or the folder to match.
Usually rename the folder (moving files) to match the frontmatter name.

---

### `skill-name-has-namespace-prefix`
**Triggers:** Skill name starts with a common namespace prefix (e.g. `scaffold-`,
`ai-`, `new-`, `layer-`).  
**Convention:** Skill names should be short verbs or nouns, not namespaced.
The containing `.claude/skills/` directory already provides the namespace.  
**Fix class:** manual  
**Canonical fix:** Rename to drop the prefix (e.g. `scaffold-migrate` →
`migrate`). Update all invocation references.

---

### `skill-description-too-long`
**Triggers:** `description:` exceeds 1024 chars.  
**Convention:** Some AI tools truncate descriptions over 1024 chars. The
description must fit within this limit.  
**Fix class:** deterministic  
**Canonical fix:** Trim the description. Move detailed trigger phrasings and
examples into the skill body.

---

### `skill-md-too-long`
**Triggers:** SKILL.md body exceeds ~200 lines.  
**Convention:** Long SKILL.md files get truncated by context windows. Reference
material belongs in `references/` and worked examples in `examples/`.  
**Fix class:** semantic  
**Canonical fix:** Move large reference tables, check lists, or decision
frameworks to `references/` files. Move worked examples to `examples/`. Keep
the SKILL.md body to overview, workflow, and links to the sub-files.

---

### `skill-weak-description`
**Triggers:** Description is missing or has fewer than 8 words.  
**Convention:** AI tools use the description to decide when to invoke the
skill. A good description includes trigger phrasings and a "do not use for"
clause.  
**Fix class:** manual  
**Canonical fix:** Expand the `description:` frontmatter.

---

### `skill-body-uses-plaintext-sibling-paths`
**Triggers:** SKILL.md body contains relative paths starting with `./` or `../`.  
**Convention:** Relative paths in skill bodies may not resolve correctly when
the skill is invoked from a different working directory.  
**Fix class:** manual  
**Canonical fix:** Use paths relative to the consumer repo root, or use
Markdown links with absolute repo-root-relative paths.

---

## Cross-file checks

### `pending-integration-present`
**Triggers:** `.claude/ai-kit.json` has a non-empty `pendingIntegration` array.  
**Convention:** Brownfield migration must complete before optimization. Mixing
the two verbs creates conflicts.  
**Fix class:** manual  
**Canonical fix:** Run `/migrate` first. The optimizer will stop on this
finding and redirect.

---

### `redundant-content-agents-md-vs-skill`
**Triggers:** An installed skill's name appears ≥3 times in `AGENTS.md`.  
**Convention:** AGENTS.md should not restate guidance already covered by a
skill. Trust the skill to carry its own instructions.  
**Fix class:** semantic  
**Canonical fix:** If the AGENTS.md content genuinely duplicates the skill's
coverage, remove or summarize to a one-line pointer. If the repetition is
intentional context, add a comment explaining why.
