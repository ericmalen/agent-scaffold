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
**Severity:** info  
**Triggers:** A `<!-- TODO: ... -->` comment found in the file.  
**Convention:** The ai-kit template ships with placeholder TODOs; they must be
replaced before the file is useful.  
**Fix class:** none  
**Canonical fix:** Tell the user which sections need content. Do not remove or
modify the TODO placeholders — they are helpful guidance until the user replaces
them. The optimizer must not touch this file for this finding.

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
**Fix class:** deterministic (when `## Procedures` present — finding carries `suggestedFix`) / manual (no Procedures section)  
**Canonical fix:** Use the `suggestedFix` field from the finding directly as the `tools:` value. If no `suggestedFix`, read the agent's procedures and reason about which tools they require.

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
**Note:** Skipped for ai-kit-distributed agents (identified via `manifest.files[].installedAs` + `role: "agent"`).

---

### `agent-description-missing-when`
**Triggers:** Description does not contain the word "when".  
**Convention:** Agent descriptions should state when to invoke the agent so
AI tools activate it on the right trigger.  
**Fix class:** manual  
**Canonical fix:** Add a "when" clause, e.g. "Invoke when the user says…".  
**Note:** Skipped for ai-kit-distributed agents (see `agent-weak-description`).

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

### `skill-name-has-namespace-separator`
**Triggers:** `name:` in frontmatter contains `:` or `/`.  
**Convention:** These characters are reserved for Claude Code plugin-namespaced
skills (e.g. `code-review:code-review`). User-authored skills use only a simple
kebab-case name that matches their folder (e.g. `migrate`, `git-conventions`).  
**Fix class:** deterministic  
**Canonical fix:** Remove the separator and everything before it. Rename the
folder to match if needed.

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
**Note:** Skipped for ai-kit-distributed skills (identified via `manifest.files[].installedAs` + `role: "skill"`).

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

---

## Nested AGENTS.md checks (additional)

### `nested-claude-md-missing-agents-import`
**Triggers:** A sibling `CLAUDE.md` exists but does not contain `@AGENTS.md`.  
**Convention:** The sibling CLAUDE.md must contain `@AGENTS.md` so Claude Code
picks up the nested rules. Existence alone is not enough.  
See [cross-tool-setup.md](../../../../docs/cross-tool-setup.md).  
**Fix class:** deterministic  
**Canonical fix:** Replace (or prepend) the CLAUDE.md content with `@AGENTS.md`.

---

## Root CLAUDE.md checks

### `root-claude-md-missing`
**Severity:** info  
**Triggers:** `CLAUDE.md` is absent at the repo root.  
**Convention:** Claude Code reads `CLAUDE.md`, not `AGENTS.md`. A root
`CLAUDE.md` containing `@AGENTS.md` is required.
See [cross-tool-setup.md](../../../../docs/cross-tool-setup.md).  
**Fix class:** deterministic  
**Canonical fix:** Create `CLAUDE.md` with the single line `@AGENTS.md`.

---

### `root-claude-md-missing-agents-import`
**Triggers:** `CLAUDE.md` exists but does not contain `@AGENTS.md`.  
**Convention:** Same as above — the file must import AGENTS.md.  
**Fix class:** deterministic  
**Canonical fix:** Prepend `@AGENTS.md` as the first line of `CLAUDE.md`.

---

## Prompt checks (`.github/prompts/*.prompt.md`)

### `prompt-routes-agent-with-redundant-fields`
**Triggers:** Prompt frontmatter has `agent:` AND also `model:` or `tools:`.  
**Convention:** When a prompt routes to an agent, the agent owns `model` and
`tools`. Duplicating them causes drift.
See [conventions.md](../../../../docs/conventions.md) lines 51–55 and
[.github/prompts/README.md](../../../../.github/prompts/README.md) lines 29–32.  
**Fix class:** deterministic  
**Canonical fix:** Remove the `model:` and/or `tools:` lines from the prompt
frontmatter.

---

### `prompt-missing-description`
**Triggers:** No `description:` key in frontmatter.  
**Convention:** AI tools use the description to discover and invoke prompts.  
**Fix class:** manual  
**Canonical fix:** Add a `description:` that explains what the prompt does and
when to use it.

---

### `prompt-weak-description`
**Severity:** info  
**Triggers:** Description has fewer than 8 words.  
**Fix class:** manual  
**Canonical fix:** Expand the description with trigger phrasings and a "do not
use for" clause.

---

### `prompt-filename-not-kebab-case`
**Severity:** info  
**Triggers:** Filename does not match `[a-z0-9-]+.prompt.md` (excluding
underscore-prefixed files).  
**Convention:** Prompt files use kebab-case names. Teaching material uses an
underscore prefix. See [conventions.md](../../../../docs/conventions.md) lines
63–67.  
**Fix class:** deterministic  
**Canonical fix:** Rename the file to kebab-case.

---

### `prompt-teaching-material-missing-underscore`
**Severity:** info  
**Triggers:** Description starts with "Example" or "Demo" but filename lacks
an underscore prefix.  
**Convention:** Teaching material should be prefixed with `_` (e.g.
`_example-review.prompt.md`) to sort it visually and signal it is not a real
command.  
**Fix class:** deterministic  
**Canonical fix:** Prefix the filename with `_`.

---

## Agent checks (additional)

### `agent-filename-not-kebab-case`
**Severity:** info  
**Triggers:** Agent file basename contains uppercase letters or other
non-kebab-case characters.  
**Convention:** Agent files should use kebab-case names matching their `name:`
frontmatter.  
**Fix class:** deterministic  
**Canonical fix:** Rename the file to kebab-case.

---

## Skill checks (additional)

### `skill-description-missing-when`
**Severity:** info  
**Triggers:** Non-ai-kit skill description does not contain the word "when".  
**Convention:** Skill descriptions should state when to invoke the skill so AI
tools activate it on the right trigger.  
**Fix class:** manual  
**Canonical fix:** Add a "when" clause, e.g. "Use when the user asks to…".  
**Note:** Skipped for ai-kit-distributed skills.

---

### `skill-body-uses-bare-sibling-paths`
**Severity:** info  
**Triggers:** SKILL.md body references `references/`, `examples/`, or
`scripts/` paths as bare text (not inside a Markdown link).  
**Convention:** Skills load sibling files via Markdown links — that is the
lazy-load mechanism. Bare paths are not followed.
See [conventions.md](../../../../docs/conventions.md) lines 10–21.  
**Fix class:** manual  
**Canonical fix:** Convert `references/foo.md` to `[label](references/foo.md)`.

---

### `command-name-collides-with-vscode-builtin`
**Severity:** info  
**Triggers:** Skill `name:` is one of VS Code's built-in commands:
`create-skill`, `create-agent`, `create-prompt`, `create-instruction`,
`create-hook`.  
**Convention:** These names are reserved. A skill with the same name will
conflict in the `/` menu.  
**Fix class:** manual  
**Canonical fix:** Rename the skill (and its folder, and update `ai-kit.config.json`).

---

## Settings checks

### `claude-settings-missing-or-invalid`
**Severity:** info  
**Triggers:** `.claude/settings.json` is absent or cannot be parsed as JSON.  
**Convention:** A `.claude/settings.json` with deny rules for `.env` files is
recommended.  
**Fix class:** manual  
**Canonical fix:** Create (or fix) `.claude/settings.json` with the required
deny rules.

---

### `claude-settings-missing-env-deny`
**Triggers:** `.claude/settings.json` exists but `permissions.deny` is missing
`Read(./.env)` or `Read(./.env.*)`.  
**Convention:** Deny rules for `.env` files prevent Claude Code from
accidentally reading secrets.
See [cross-tool-setup.md](../../../../docs/cross-tool-setup.md) lines 86–87.  
**Fix class:** deterministic  
**Canonical fix:** Add the missing entries to `permissions.deny`. The finding's
`suggestedFix` field carries the exact JSON to add.

---

### `vscode-settings-missing`
**Severity:** info  
**Triggers:** `.vscode/settings.json` is absent.  
**Convention:** Required Copilot keys must be set for full ai-kit integration.  
**Fix class:** manual  
**Canonical fix:** Create `.vscode/settings.json` with all required keys from
[copilot-customization-reference.md](../../../../docs/copilot-customization-reference.md)
lines 467–492.

---

### `vscode-ai-key-missing-or-wrong`
**Severity:** info  
**Triggers:** A required VS Code key (from the 8-key list) is absent or has the
wrong value. One finding per key.  
**Convention:** All 8 Copilot integration keys are needed for agents, skills,
nested AGENTS.md, and subagents to work correctly.  
**Fix class:** manual (JSONC — preserving user comments through automated merge
is brittle)  
**Canonical fix:** Add the key+value documented in the finding's `suggestedFix`
field to `.vscode/settings.json`.

---

## Gitignore checks

### `gitignore-missing`
**Severity:** info  
**Triggers:** No `.gitignore` present and `.git/` exists (repo is git-tracked).  
**Fix class:** deterministic  
**Canonical fix:** Create `.gitignore` with the two required ai-kit entries.

---

### `gitignore-missing-ai-kit-entries`
**Severity:** info  
**Triggers:** `.gitignore` exists but is missing `.claude/settings.local.json`
or `.claude/ai-kit-audit-report.json`.  
**Fix class:** deterministic  
**Canonical fix:** Append the missing entries to `.gitignore` with a
`# Added by ai-kit optimize` header comment.

---

## Cross-file checks (additional)

### `audit-report-committed`
**Triggers:** `.claude/ai-kit-audit-report.json` exists on disk AND is not in
`.gitignore`.  
**Convention:** The audit report is auto-generated and should not be committed.  
**Fix class:** deterministic  
**Canonical fix:** Add `.claude/ai-kit-audit-report.json` to `.gitignore`.

---

### `asset-folder-missing-readme`
**Severity:** info  
**Triggers:** `.claude/agents/`, `.claude/skills/`, or `.github/prompts/`
exists but has no `README.md`.  
**Convention:** Each asset folder should have a README explaining the
conventions for that surface.
See [conventions.md](../../../../docs/conventions.md) lines 80–82.  
**Fix class:** deterministic  
**Canonical fix:** Create a `README.md` in the folder following the standard
pattern for that surface.

---

### `skill-not-registered`
**Severity:** info  
**Triggers:** (Scaffold repo only) A skill exists in `.claude/skills/` but is
not in `ai-kit.config.json` under `base.skills` or `skills:`.  
**Convention:** Unregistered skills are not shipped by the CLI.  
**Fix class:** manual  
**Canonical fix:** Add the skill to `ai-kit.config.json` under `base.skills`
(if bundled) or `skills:` (if opt-in).

---

### `agent-not-registered`
**Severity:** info  
**Triggers:** (Scaffold repo only) An agent exists in `.claude/agents/` but is
not in `ai-kit.config.json` under `agents:`.  
**Convention:** Unregistered agents are not shipped by the CLI.  
**Fix class:** manual  
**Canonical fix:** Add the agent to `ai-kit.config.json` under `agents:`.
