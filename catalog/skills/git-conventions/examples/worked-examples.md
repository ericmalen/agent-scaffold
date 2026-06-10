# Worked Examples

Good and bad examples across commits, pull requests, and branches. Teaches
by contrast — each bad example is paired with its fix.

---

## Commits

### Good

**Straightforward feature.**

```
feat: add user registration endpoint
```

✅ Clear type, imperative subject, no trailing period, no scope needed.

**Feature with scope.**

```
feat(auth): add OAuth login via Google
```

✅ Scope narrows the area of change; subject describes the outcome.

**Fix with issue footer.**

```
fix(cart): handle empty cart on checkout redirect

When the cart was empty, the checkout handler threw a NullReferenceException
instead of redirecting to /products. This change short-circuits the empty
case and redirects with a flash message.

Closes #412
```

✅ Header is concise; body explains _why_; footer closes the issue on merge.

**Breaking change using `!`.**

```
feat(api)!: remove deprecated /v1 endpoints
```

✅ `!` makes the breaking change scannable in `git log`.

**Breaking change using the footer form.**

```
feat(api): add v2 query endpoint

The new endpoint supports filter pushdown and server-side aggregation.

BREAKING CHANGE: /v1/query has been removed. Callers must migrate to
/v2/query — see docs/migration-v2.md.
```

✅ Footer carries the migration detail. Uppercase `BREAKING CHANGE` required.

**Chore without a scope.**

```
chore: bump node to 20.12 LTS
```

✅ Cross-cutting change; a scope would add no information.

### Bad → Good

**No type prefix.**

- ❌ `add user registration endpoint`
- ✅ `feat: add user registration endpoint`

Rationale: without a type, tooling can't parse intent and the change won't
contribute to SemVer bumps.

**Past-tense subject.**

- ❌ `feat: added OAuth login`
- ✅ `feat: add OAuth login`

Rationale: the convention reads as "if applied, this commit will _add_ OAuth
login" — imperative mood only.

**Sentence-case subject with trailing period.**

- ❌ `fix(cart): Handle empty cart on checkout redirect.`
- ✅ `fix(cart): handle empty cart on checkout redirect`

Rationale: the subject is a header, not a sentence — lowercase start, no
trailing period.

---

## Pull Requests

### Good

**Simple feature PR.**

- **Title:** `feat(auth): add OAuth login via Google`
- **Description:**

  ```markdown
  ## Summary

  Adds Google OAuth as a second sign-in option. Users can now link a Google
  account from their profile page; new users can register via Google.

  ## Changes

  - New `GoogleOAuthProvider` using the `google-auth-library` package
  - `/auth/google` and `/auth/google/callback` routes
  - UI affordance on the sign-in page

  ## Testing

  - Added integration tests covering happy path and state mismatch
  - Manually verified the callback flow against staging credentials

  ## Related

  - Closes #512
  ```

✅ Title mirrors the squash-merge commit; description explains _why_;
testing is reproducible; issue linked.

**Breaking-change PR.**

- **Title:** `feat(api)!: remove deprecated /v1 endpoints`
- **Description:**

  ```markdown
  ## Summary

  The /v1 API was deprecated in the 3.x line. This PR removes it entirely
  and cleans up the associated handlers, tests, and docs.

  ## Changes

  - Removes `/v1/query`, `/v1/ingest`, `/v1/status`
  - Deletes `src/api/v1/` and its tests
  - Updates OpenAPI spec to drop /v1 paths

  ## Breaking Changes

  Any client still calling /v1 endpoints will receive 404 after this merges.
  Migration to /v2 is documented in `docs/migration-v2.md`. Release notes
  for 4.0 will link to that doc.

  ## Testing

  - Full test suite green
  - Verified /v1 routes return 404 in staging
  - Confirmed /v2 endpoints unchanged via existing integration tests
  ```

✅ `!` in title; explicit Breaking Changes section with migration path; no
reliance on reviewers inferring the impact.

**Fix PR linked to an issue.**

- **Title:** `fix(cart): handle empty cart on checkout redirect`
- **Description:**

  ```markdown
  ## Summary

  Empty carts threw a NullReferenceException on the checkout redirect. Now
  they redirect cleanly to /products with a flash message.

  ## Changes

  - Guard in `CheckoutController.Redirect()`
  - Regression test for the empty-cart path

  ## Testing

  - New test fails on `main`, passes on this branch
  - Manually verified the redirect in staging

  ## Related

  - Closes #412
  ```

✅ Concise; testing demonstrates the fix; issue linked.

### Bad → Good

**Non-conventional title on a squash-merge repo.**

- ❌ Title: `OAuth login`
- ✅ Title: `feat(auth): add OAuth login via Google`

Rationale: on squash-merge, the PR title becomes the commit. A non-
conventional title produces a non-conventional commit on `main`.

**Missing Breaking Changes section on a breaking-change PR.**

- ❌ Title: `feat(api)!: remove /v1 endpoints` with a description that only
  lists the changes.
- ✅ Same title, plus a **Breaking Changes** section with the migration path.

Rationale: the `!` flags the break for `git log` readers; the description
has to carry the migration detail for PR reviewers and release-notes
consumers.

---

## Branches

### Good

- `feat/oauth-login`
- `fix/navbar-overflow`
- `chore/upgrade-node-20`
- `docs/readme-examples`
- `feat/123-password-reset` (with issue ID)
- `refactor/extract-user-service`

### Bad → Good

- ❌ `my-branch` → ✅ `feat/user-dashboard`
  - Rationale: type prefix + identifiable description; no personal or
    placeholder names.
- ❌ `FIX_BUG` → ✅ `fix/login-redirect`
  - Rationale: lowercase kebab-case only; describe the actual fix.
- ❌ `eric-testing` → ✅ `chore/experiment-ci-runner`
  - Rationale: no personal prefixes; scope the experiment to what it's
    actually testing.
