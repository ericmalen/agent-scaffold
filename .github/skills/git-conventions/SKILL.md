---
name: git-conventions
description: "Applies Conventional Commits to commit messages, plus team-derived conventions for PR titles, PR descriptions, and branch names. Activate when writing a commit, preparing a pull request, or creating a new branch. Note: Conventional Commits is the official spec for commit messages only; the PR and branch conventions here are common team extensions derived from its type vocabulary, not part of the spec itself."
argument-hint: "[commit | pr | branch]"
user-invocable: true
disable-model-invocation: false
---

# Git Conventions

## When to Use

- Writing a commit message.
- Preparing a pull request (title and description).
- Creating a new branch.

Conventional Commits (the official spec) covers commit messages only. The PR
and branch guidance here are team extensions built on the same type
vocabulary.

## Quick Reference

**Commit format:** `<type>(<scope>)?: <subject>`

**Types:**

- `feat` — new feature (MINOR bump)
- `fix` — bug fix (PATCH bump)
- `docs` — documentation only
- `style` — formatting / whitespace, no code change
- `refactor` — change that neither fixes a bug nor adds a feature
- `perf` — performance improvement (PATCH bump)
- `test` — adding or fixing tests
- `build` — build system or dependencies
- `ci` — CI configuration
- `chore` — maintenance, no production code change
- `revert` — reverts a previous commit

**Breaking change:** append `!` before `:` (e.g., `feat(api)!: ...`) or add a
`BREAKING CHANGE:` footer. Using both is fine — the `!` draws attention; the
footer describes the impact.

**Subject rules:** imperative mood, present tense, lowercase, no trailing
period, under ~72 chars.

## Workflow

1. Determine the type (see table in [`references/commit-format.md`](./references/commit-format.md)).
2. Identify a scope if one applies — typically a package, module, or feature
   area, kebab-case.
3. Write an imperative subject ("add x", not "added x" or "adds x").
4. Add body and footers only if they add information the diff doesn't.
5. For PRs, mirror the commit format in the title and apply the description
   template in [`references/pr-guidelines.md`](./references/pr-guidelines.md).
6. For branches, use `<type>/<short-description>` — see
   [`references/branch-naming.md`](./references/branch-naming.md).

## References

- [`references/commit-format.md`](./references/commit-format.md) — full format
  spec, type vocabulary with SemVer mapping, scope, breaking-change, body and
  footer rules.
- [`references/pr-guidelines.md`](./references/pr-guidelines.md) — PR titles,
  description template, closing keywords.
- [`references/branch-naming.md`](./references/branch-naming.md) — branch
  naming pattern and anti-patterns.

## Examples

- [`examples/worked-examples.md`](./examples/worked-examples.md) — good and
  bad examples for commits, PRs, and branches, with rationale.

## Official Spec

- [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)
