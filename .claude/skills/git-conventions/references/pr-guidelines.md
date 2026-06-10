# Pull Request Guidelines

How to apply Conventional Commits conventions to pull requests. This is a
team extension of the spec, not part of it — the official spec covers commit
messages only. The guidance here is common practice on teams that adopt
Conventional Commits and want the PR surface to match.

## PR title

A PR title should follow the Conventional Commits header format and describe
what **merging the PR** accomplishes:

```
<type>(<scope>)?: <subject>
```

- Under a **squash-merge** workflow, the PR title becomes the commit message
  subject. It must be a valid Conventional Commits header.
- Under a **merge commit** or **rebase-merge** workflow, the PR title
  describes the feature as a whole; individual commits on the branch still
  carry their own Conventional Commits headers.

Apply the same subject rules from
[`commit-format.md`](./commit-format.md#subject-rules): imperative mood,
lowercase start, no trailing period, under ~72 characters.

### CI validation

Many teams enforce this with CI:

- **[`commitlint`](https://commitlint.js.org/)** validates commit messages
  against the spec.
- **[`amannn/action-semantic-pull-request`](https://github.com/amannn/action-semantic-pull-request)**
  (and similar GitHub Actions) validate PR titles.
- **Azure DevOps build validation** can enforce the same via policy.

If CI is enforcing the spec, a non-conventional PR title is a merge blocker —
fix the title, not the CI rule.

## PR description template

A reasonable default. Adjust per team.

```markdown
## Summary

One paragraph describing what and why.

## Changes

- Bullet list of the key changes
- Keep to the highlights; the diff tells the rest

## Breaking Changes

(Only if applicable. Describe the change and migration path.)

## Testing

How this was tested. Commands, coverage, manual steps.

## Related

- Closes #123
- Relates to #456
```

### Section notes

- **Summary.** _Why_ the change exists — the problem, constraint, or request
  that produced it. The diff shows the _what_.
- **Changes.** Highlights, not a line-by-line recount. If the bullets restate
  the diff, cut them.
- **Breaking Changes.** Only for breaking-change PRs. Always include migration
  guidance. Don't rely solely on the commit footer — reviewers read PRs, not
  commit headers.
- **Testing.** Reproducible steps a reviewer can follow. "Tested locally" is
  not sufficient.
- **Related.** Linked issues and PRs.

## Linking issues

### GitHub

Closing keywords in the PR description auto-close the referenced issue on
merge. Case-insensitive.

- `Closes #123`
- `Fixes #456`
- `Resolves #789`

Non-closing references: `Refs #123`, `Relates to #123`.

For cross-repo links: `Closes owner/repo#123`.

### Azure DevOps

Link work items with `AB#<id>` (or `#<id>` when the PR is in an ADO-linked
repo).

- `AB#1234` — references the work item.
- `Fixes AB#1234` — auto-completes the work item on merge when the repo is
  configured for it.

## Breaking changes in PRs

When a PR contains a breaking change:

1. Use `!` in the PR title (`feat(api)!: remove /v1 endpoints`).
2. Include a **Breaking Changes** section in the description with the impact
   and migration path.
3. Use a `BREAKING CHANGE:` footer on the commit(s), especially for
   squash-merge so the footer ends up on the main branch.

All three layers — title, description, commit footer — should match. If they
disagree, release tooling and release notes will lie.

## Draft PRs

Open a PR in draft when you want early feedback but the work isn't ready to
merge. Conventional Commits conventions still apply to the title — the spec
doesn't care about merge state.

## What not to do

- **Non-conventional titles on squash-merge repos.** The title _becomes_ the
  commit; an invalid title means an invalid commit on `main`.
- **Missing Breaking Changes section on a breaking-change PR.** Reviewers
  shouldn't have to infer the impact from the diff.
- **Duplicating the diff in the Changes section.** If every bullet can be
  derived by reading the patch, cut the bullets.
- **Picking a platform prematurely.** Where GitHub and Azure DevOps diverge
  (closing keywords, work item references), follow whichever platform your
  repo is hosted on, and document the choice once at the team level.
