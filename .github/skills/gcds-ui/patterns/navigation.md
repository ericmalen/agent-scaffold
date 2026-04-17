
# Navigation

GCDS gives you three navigation tiers: **page chrome** (`gcds-header`, `gcds-footer`), **sitewide nav** (`gcds-top-nav`, `gcds-side-nav`, `gcds-topic-menu`), and **in-flow navigation** (`gcds-breadcrumbs`, `gcds-pagination`, `gcds-stepper`, `gcds-link`).

## When to use this pattern

Every page has at least the header + footer shell. Add the other tiers based on the app's depth and task shape.

## Composition — standard Canada.ca page shell

```tsx
<GcdsHeader langHref="/fr" skipToHref="#main">
  <GcdsTopNav slot="menu" label="Primary navigation">
    <GcdsNavLink href="/services">Services</GcdsNavLink>
    <GcdsNavGroup menuLabel="About" openTrigger="About">
      <GcdsNavLink href="/about">Overview</GcdsNavLink>
      <GcdsNavLink href="/contact">Contact</GcdsNavLink>
    </GcdsNavGroup>
  </GcdsTopNav>
  <GcdsBreadcrumbs slot="breadcrumb">
    <GcdsBreadcrumbsItem href="/services">Services</GcdsBreadcrumbsItem>
  </GcdsBreadcrumbs>
</GcdsHeader>

<GcdsContainer tag="main" id="main" layout="page">
  {/* page content */}
  <GcdsPagination display="list" label="Page navigation" totalPages={12} currentPage={3} />
</GcdsContainer>

<GcdsFooter />
```

## Rules

- **Skip link** is provided by `<gcds-header>` via `skipToHref`. Target must be `id="main"` (or whatever you supplied).
- **One `<main>` per page** — wrap it in `<gcds-container tag="main">` or a plain `<main>`. The skip link jumps here.
- **Breadcrumbs always in `slot="breadcrumb"` of the header**, not free-floating.
- **Side nav** is for deep sections with many peers; top nav is for shallow, app-level menus. Don't use both at the top level.
- **Stepper** is for multi-step forms or flows with a linear order — see [multi-step-form example](../examples/multi-step-form.tsx).
- **Pagination** is for paged lists. Use `display="simple"` (prev/next only) on narrow layouts, `display="list"` for full page-number lists.

## Accessibility

- `<gcds-header>` renders `role="banner"`; `<gcds-footer>` renders `role="contentinfo"`. Do not nest additional landmarks of the same role.
- `<gcds-top-nav>` and `<gcds-side-nav>` render `<nav>` elements. Each takes a `label` prop — set it. Screen readers enumerate named navigation landmarks.
- `<gcds-breadcrumbs>` renders `<nav aria-label="Breadcrumb">` with an ordered list.
- Keyboard: `Tab` moves between top-level items; `Enter` / `Space` activates; nested `<gcds-nav-group>` expands with `Enter`/`Space` and closes with `Escape`.
- Current page in pagination and breadcrumbs uses `aria-current="page"`.

## Bilingual considerations

- Header takes `langHref` — the URL of the current page in the opposite language. Wire it from the router.
- Breadcrumb labels and nav link labels are your content — translate them.
- Slugs in hrefs should be localized (`/en/services` ↔ `/fr/services-federaux`). Don't share a single URL across languages.

## Per-route vs per-layout rendering

Mount the header and footer at the **layout** level (e.g. `app/layout.tsx` in Next, an `<App>` outlet in Vite), not on each page. Breadcrumbs vary per route, so wire those via a per-route prop or context.

## Common mistakes

| Mistake | Fix |
| --- | --- |
| Placing breadcrumbs below the header | Put them in `slot="breadcrumb"`. |
| Omitting `id="main"` on the main landmark | Skip link breaks. |
| Using `<a href>` instead of `<gcds-link>` for in-content nav | `gcds-link` handles external icon, visited state, and token styling. |
| Duplicating top-nav and side-nav | Pick one sitewide nav pattern. |
| Hardcoding language-toggle text | `<gcds-lang-toggle>` labels itself in the target language. |
