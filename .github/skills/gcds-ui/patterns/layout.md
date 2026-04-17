
# Layout

GCDS provides three layout primitives: `gcds-container` (constrained width wrappers with vertical rhythm), `gcds-grid` (responsive column grid), and `gcds-grid-col` (grid children). Combine with GCDS spacing tokens — never hardcode pixel values.

## When to use this pattern

Any page needs at least a top-level container for `<main>`. Reach for grid when you have a list or card array that should reflow responsively.

## Top-level container

Wrap the main content region:

```tsx
<GcdsContainer tag="main" id="main" layout="page">
  {/* page content */}
</GcdsContainer>
```

- `layout="page"` — constrains to the GCDS page width and applies standard margins.
- `tag="main"` — renders as `<main>` for landmark purposes. Use this on one container per page.
- `id="main"` — matches the `skipToHref="#main"` on `<gcds-header>` so the skip link lands here.

Other layout values (see [gcds-container](../components/gcds-container.md)): `full-width`, `centered`, `content-width`. Pick by content type.

## Grid

```tsx
<GcdsGrid columns="1fr 1fr 1fr" gap="400">
  <GcdsGridCol>{/* ... */}</GcdsGridCol>
  <GcdsGridCol>{/* ... */}</GcdsGridCol>
  <GcdsGridCol>{/* ... */}</GcdsGridCol>
</GcdsGrid>
```

Responsive composition — use responsive `columns` values and let `<gcds-grid-col>` control column spans at each breakpoint. See [gcds-grid](../components/gcds-grid.md) for prop details.

Rules:

- The `gap` prop takes a spacing token number (e.g. `"400"` → `--gcds-spacing-400` → 2rem). Don't pass a raw pixel.
- Prefer grid over flexbox for 2D layouts (rows × columns). Use CSS flex for 1D runs.
- Grid is for layout, not tabular data — for tables see [data-display](./data-display.md).

## Spacing rhythm

All vertical spacing between components should be a GCDS spacing token. Use the CSS custom properties directly or the CSS shortcuts package (`mb-200`, `p-300`, etc.).

```tsx
<section className="mb-600">
  <GcdsHeading tag="h2" marginTop="0">Section heading</GcdsHeading>
  <p className="mb-300">Paragraph text.</p>
</section>
```

- Cluster related items with spacing-200/300.
- Separate logical groups with spacing-500/600/700.
- Page-level sections use spacing-800+.

See [foundations](../references/foundations.md) for the full spacing scale.

## Page shell — full composition

```tsx
<>
  <GcdsHeader skipToHref="#main" langHref="/fr">
    <GcdsTopNav slot="menu" label="Primary">
      <GcdsNavLink href="/services">Services</GcdsNavLink>
    </GcdsTopNav>
  </GcdsHeader>

  <GcdsContainer tag="main" id="main" layout="page">
    <GcdsHeading tag="h1">Page title</GcdsHeading>
    <GcdsGrid columns="2fr 1fr" gap="500">
      <GcdsGridCol>
        {/* main content */}
      </GcdsGridCol>
      <GcdsGridCol>
        {/* sidebar */}
      </GcdsGridCol>
    </GcdsGrid>
  </GcdsContainer>

  <GcdsFooter />
</>
```

## Accessibility

- Only one `<main>` per page. Use `tag="main"` on a single container.
- `<gcds-container>` does not introduce landmark semantics unless you set `tag`.
- Focus order follows DOM order — keep visual order consistent with source order (or use `flex-direction: row-reverse` sparingly with explicit `tabindex` management).
- Respect zoom: don't fix heights on containers holding translated text (FR is longer).

## Bilingual considerations

- Layout direction is LTR for both EN and FR — do not mirror.
- Column widths should allow ~25% more text in FR without breaking. Avoid fixed `px` widths on columns holding user-facing text.
- Spacing tokens are language-independent — no adjustment needed.

## Common mistakes

| Mistake | Fix |
| --- | --- |
| Setting `layout="full-width"` on every container | Use `page` for the main content region; reserve full-width for backgrounds and edge-to-edge sections. |
| Hardcoding pixel widths on grid columns | Use `1fr` units or `auto` — let content and tokens drive the sizing. |
| Adding `margin-top` to the first heading inside a container | Set `marginTop="0"` on the heading; the container already has top spacing. |
| Two `<main>` landmarks | Only one, even in complex dashboards. |
