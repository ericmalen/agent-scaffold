---
name: gcds-ui
description: "GC Design System expert for building Canada.ca-compliant UIs with @gcds-core/components v1.1.0 — covers all 40 stable components, composition patterns, page templates, accessibility and bilingual invariants. Activate when implementing, reviewing, or translating designs into GCDS React components, or when handling EN/FR UI requirements."
argument-hint: "[component | pattern | page-template | topic]"
user-invocable: true
disable-model-invocation: false
---

# GC Design System (GCDS) UI Skill

The authoritative reference for building GCDS-compliant UIs in this monorepo. Targets **`@gcds-core/components-v1.1.0`** — the packages are under the `@gcds-core/*` scope (the old `@cdssnc/gcds-components*` packages are retired). Covers all 40 stable components, plus composition patterns, page templates, and copy-pasteable examples.

## When to Use

- Implementing any component, page, or form using `@gcds-core/components-react`
- Reviewing UI code for GCDS compliance
- Translating designs into GCDS-based implementations
- Handling bilingual (EN/FR) UI requirements

## Quick Reference

- [Component catalog](./references/component-catalog.md) — start here to find the right component
- [Foundations](./references/foundations.md) — colour, typography, spacing tokens
- [Accessibility](./references/accessibility.md) — WCAG AA invariants
- [Bilingual](./references/bilingual.md) — EN/FR invariants
- [Installation](./references/installation-setup.md) — package setup reference

## Workflow

1. Identify the need in the [component catalog](./references/component-catalog.md).
2. Open the matching [component deep-dive](./components/) for props, slots, events, a11y.
3. Compose using the relevant [pattern](./patterns/) and — if building a full page — a [page template](./page-templates/).
4. Verify against [accessibility](./references/accessibility.md) and [bilingual](./references/bilingual.md) before finishing.

## Components

Per-component files in [`./components/`](./components/) cover props, slots, events, methods, accessibility, bilingual notes, and shadow DOM details. Extracted directly from the Stencil source at tag `@gcds-core/components-v1.1.0`.

All 40 components grouped by role:

- **Actions** — [gcds-button](./components/gcds-button.md)
- **Inputs** — [gcds-input](./components/gcds-input.md), [gcds-textarea](./components/gcds-textarea.md), [gcds-select](./components/gcds-select.md), [gcds-radios](./components/gcds-radios.md), [gcds-checkboxes](./components/gcds-checkboxes.md), [gcds-date-input](./components/gcds-date-input.md), [gcds-file-uploader](./components/gcds-file-uploader.md), [gcds-fieldset](./components/gcds-fieldset.md), [gcds-label](./components/gcds-label.md), [gcds-hint](./components/gcds-hint.md), [gcds-error-message](./components/gcds-error-message.md)
- **Feedback** — [gcds-alert](./components/gcds-alert.md), [gcds-notice](./components/gcds-notice.md), [gcds-error-summary](./components/gcds-error-summary.md)
- **Content** — [gcds-card](./components/gcds-card.md), [gcds-details](./components/gcds-details.md), [gcds-icon](./components/gcds-icon.md)
- **Typography** — [gcds-heading](./components/gcds-heading.md), [gcds-text](./components/gcds-text.md)
- **Layout** — [gcds-container](./components/gcds-container.md), [gcds-grid](./components/gcds-grid.md), [gcds-grid-col](./components/gcds-grid-col.md)
- **Navigation** — [gcds-link](./components/gcds-link.md), [gcds-breadcrumbs](./components/gcds-breadcrumbs.md), [gcds-breadcrumbs-item](./components/gcds-breadcrumbs-item.md), [gcds-pagination](./components/gcds-pagination.md), [gcds-stepper](./components/gcds-stepper.md), [gcds-side-nav](./components/gcds-side-nav.md), [gcds-top-nav](./components/gcds-top-nav.md), [gcds-nav-group](./components/gcds-nav-group.md), [gcds-nav-link](./components/gcds-nav-link.md), [gcds-topic-menu](./components/gcds-topic-menu.md)
- **Structural** — [gcds-header](./components/gcds-header.md), [gcds-footer](./components/gcds-footer.md), [gcds-search](./components/gcds-search.md), [gcds-lang-toggle](./components/gcds-lang-toggle.md), [gcds-date-modified](./components/gcds-date-modified.md), [gcds-signature](./components/gcds-signature.md)
- **Utility** — [gcds-sr-only](./components/gcds-sr-only.md)

## Patterns

Composition guidance that spans multiple components:

- [Forms](./patterns/forms.md) — input grouping, validation, error summary, submit
- [Navigation](./patterns/navigation.md) — header/footer shell, top/side nav, breadcrumbs, skip links
- [Data display](./patterns/data-display.md) — cards, details, native tables with GCDS tokens
- [Feedback](./patterns/feedback.md) — alert vs notice vs error surfaces
- [Layout](./patterns/layout.md) — container, grid, spacing rhythm

## Page Templates

Full-page composition examples:

- [Landing page](./page-templates/landing-page.md)
- [Form page](./page-templates/form-page.md)
- [List / detail](./page-templates/list-detail.md)
- [Dashboard](./page-templates/dashboard.md)
- [Error page](./page-templates/error-page.md)

## Examples

- [Bilingual form](./examples/bilingual-form.tsx)
- [Paginated table](./examples/paginated-table.tsx)
- [Multi-step form](./examples/multi-step-form.tsx)
- [Authenticated layout](./examples/authenticated-layout.tsx)

## Never

- Use a non-GCDS component when a GCDS equivalent exists
- Import from `@cdssnc/gcds-components*` — those packages are retired; use `@gcds-core/*`
- Omit `lang` on the document root (`<html>`) in bilingual contexts
- Bypass GCDS tokens with raw CSS colours, pixel sizes, or font values
- Skip the error summary pattern on form pages
- Remove focus outlines on interactive elements
- Use `role="button"` on a `<div>` — use `<gcds-button>` or `<button>`

## Not Yet Shipped

Four docs slugs have no v1.1.0 implementation — see the bottom of [component catalog](./references/component-catalog.md). Do not use `gcds-checkbox` (singular), `gcds-radio-group`, `gcds-data-table`, or `gcds-image` — they are either deprecated or not built.
