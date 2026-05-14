# Branch Naming

A branch naming convention that derives from the Conventional Commits type
vocabulary, so commits, PRs, and branches all use the same mental model.

This is a team extension; the Conventional Commits spec does not define
branch names.

## Recommended pattern

```
<type>/<short-description>
```

- **`<type>`** — a Conventional Commits type: `feat`, `fix`, `docs`, `style`,
  `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- **`<short-description>`** — kebab-case, two to five words, imperative.

### Examples

- `feat/oauth-login`
- `fix/navbar-overflow`
- `chore/upgrade-node-20`
- `docs/readme-examples`
- `refactor/extract-user-service`
- `perf/cache-hot-paths`

## With issue tracking

When branches should carry an issue or work-item ID:

```
<type>/<issue-id>-<short-description>
```

### Examples

- `feat/123-oauth-login` (GitHub issue #123)
- `fix/ab-456-navbar-overflow` (Azure DevOps work item AB#456)
- `chore/jira-789-upgrade-node` (Jira ticket)

Pick one form per repo and stick with it. Mixed forms (`feat/123-foo` and
`feat/foo`) defeat the point.

## What to avoid

- **Personal prefixes.** `eric/feature`, `alice-wip`. Doesn't survive
  handoffs or team churn; makes ownership look personal even when it isn't.
- **Spaces, underscores, or punctuation.** Kebab-case only. `feat/Oauth Login`
  and `FIX_BUG` both break tooling that assumes lowercase kebab-case.
- **Vague descriptions.** `fix/bug`, `feat/changes`, `chore/stuff`. A branch
  name should make the change identifiable from the list.
- **Long names.** Over ~50 characters is hard to type and hard to read in
  PR lists. Trim adjectives; keep verbs.
- **Type mismatches with the commits.** A branch named `feat/...` that only
  contains `chore:` commits is a signal that the branch name is wrong.

## Protected names to steer clear of

Unless they're part of your flow, don't use:

- `main`, `master` — the default branch.
- `develop`, `dev` — GitFlow integration branch.
- `release/*` — GitFlow release branches.
- `hotfix/*` — GitFlow hotfix branches.

If your team uses GitFlow (or a variant), follow its conventions for those
prefixes. Otherwise, avoid them to prevent confusion.
