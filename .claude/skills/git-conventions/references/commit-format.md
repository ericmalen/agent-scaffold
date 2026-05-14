# Commit Format

Detailed reference for the Conventional Commits message format. This is the
authoritative section within the skill for everything commit-message-related.
For the full spec, see [conventionalcommits.org](https://www.conventionalcommits.org/en/v1.0.0/).

## Full format

```
<type>[optional scope][!]: <description>

[optional body]

[optional footer(s)]
```

- **Header** — the first line. Required. `<type>`, optional `(scope)`,
  optional `!` for breaking change, `:`, space, then the subject description.
- **Body** — one or more paragraphs separated from the header by a blank line.
  Optional. Wraps around ~72 characters.
- **Footer(s)** — `Token: value` or `Token #value` lines, separated from the
  body by a blank line. Optional.

## Type vocabulary

| Type       | SemVer bump | When to use                                         |
| ---------- | ----------- | --------------------------------------------------- |
| `feat`     | MINOR       | New user-visible feature                            |
| `fix`      | PATCH       | Bug fix                                             |
| `docs`     | —           | Documentation only                                  |
| `style`    | —           | Formatting, whitespace, no code change              |
| `refactor` | —           | Code change that neither fixes a bug nor adds a feat |
| `perf`     | PATCH       | Performance improvement                             |
| `test`     | —           | Adding or fixing tests                              |
| `build`    | —           | Build system, dependencies, packaging               |
| `ci`       | —           | CI configuration, pipelines                         |
| `chore`    | —           | Maintenance, tooling, no production change          |
| `revert`   | —           | Reverts a previous commit                           |

SemVer bumps apply when commits flow into a release. A breaking change — in
any type — forces a MAJOR bump, overriding the table above.

## Scope

Optional. Parenthesized, immediately after the type.

- **Format:** kebab-case, short (one or two words).
- **Meaning:** a package, module, or feature area affected by the change.
- **Examples:** `feat(auth): ...`, `fix(api-client): ...`, `docs(readme): ...`.
- **When to omit:** cross-cutting changes, or when the scope adds no
  information (`chore: bump node` is clearer than `chore(deps): bump node`).

Pick a small, stable vocabulary for scopes in a given repo. Inconsistent
scopes (`auth`, `authentication`, `auth-service`) defeat their purpose.

## Breaking change notation

Two options, which can be combined:

1. **`!` before `:`** — attention-grabbing marker in the header.
   ```
   feat(api)!: remove deprecated /v1 endpoints
   ```
2. **`BREAKING CHANGE:` footer** — describes the impact and migration path.
   ```
   feat(api): add v2 query endpoint

   BREAKING CHANGE: /v1/query has been removed. Callers must migrate to
   /v2/query — see docs/migration-v2.md.
   ```

When both are used, `!` draws the eye in `git log` and the footer carries the
detail. Teams commonly require the footer for every breaking change so that
release tooling can extract migration notes automatically.

The token `BREAKING CHANGE` (or the hyphenated variant `BREAKING-CHANGE`) is
the only multi-word token permitted in the footer and must be in uppercase.

## Subject rules

- **Imperative mood, present tense.** "add login", not "added login" or "adds
  login". Reads as "_If applied, this commit will_ add login".
- **Lowercase first letter.** `feat: add login`, not `feat: Add login`.
- **No trailing period.** The subject is a header, not a sentence.
- **Keep it under ~72 characters.** 50 is a common soft cap; 72 is a hard
  ceiling for most tooling.
- **Describe the change, not the process.** `fix: handle empty cart on
  checkout`, not `fix: update checkout handler`.

## Body rules

- **Blank line between subject and body.** Required if a body is present.
- **Wrap at ~72 characters.** `git log` and many review tools wrap based on
  this.
- **Free-form paragraphs.** Multiple paragraphs are fine. Separate with blank
  lines.
- **Explain _why_, not _what_.** The diff already shows _what_ changed. Use
  the body for motivation, context, trade-offs, or constraints that the diff
  doesn't capture.

## Footer rules

- **Blank line between body and footer.** Required if a footer is present.
- **`Token: value` or `Token #value`.** One token per line.
- **Use hyphens in tokens.** Multi-word tokens use `-`, not spaces
  (`Reviewed-by:`, `Signed-off-by:`). The only exception is `BREAKING CHANGE`.
- **Common tokens:**
  - `BREAKING CHANGE:` — describes a breaking change (see above).
  - `Closes #123` / `Fixes #456` / `Resolves #789` — link to issues. GitHub
    closing keywords auto-close issues on merge.
  - `Refs: #123` — non-closing reference.
  - `Reviewed-by: name <email>` — attribution.
  - `Signed-off-by: name <email>` — DCO sign-off.
  - `Co-authored-by: name <email>` — secondary author attribution. Spaces are
    allowed here as a GitHub-specific exception.

## Case sensitivity

Per the spec, type names are case-insensitive when parsed by tooling, but
**convention is lowercase**. Use `feat`, not `Feat` or `FEAT`.

The sole exception: `BREAKING CHANGE` (and `BREAKING-CHANGE`) must be
uppercase. Tooling depends on it.

## Revert commits

Reverting a previous commit:

```
revert: feat(auth): add SSO login

This reverts commit 1a2b3c4d5e6f7a8b9c0d.

Refs: #789
```

The subject after `revert:` reproduces the subject of the reverted commit.
The body names the SHA and, optionally, why the revert is needed.

## Multiple changes in one commit

Prefer splitting. A commit that touches two independent concerns should
usually be two commits — the type/scope of a conventional commit is a single
value, and stretching it distorts the changelog.

If a split isn't practical, pick the type that best captures the primary
change and mention the rest in the body. Don't invent compound types like
`feat+fix`.

## What not to do

- Don't invent new types outside the vocabulary (`update:`, `misc:`). If an
  existing type doesn't fit, the change probably isn't a single commit.
- Don't put parentheses in the subject (`feat: add login (oauth)`). Put the
  qualifier in the scope or the body.
- Don't write "WIP" or "temp" commits to the default branch. Squash them
  before merge.
