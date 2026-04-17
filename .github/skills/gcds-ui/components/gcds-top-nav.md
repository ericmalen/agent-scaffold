---
tag: gcds-top-nav
package: "@gcds-core/components-react"
react-export: GcdsTopNav
stability: stable
docs-en: https://design-system.canada.ca/en/components/top-navigation/
docs-fr: https://design-system.canada.ca/fr/composants/barre-de-navigation-superieure/
---

# GcdsTopNav (`gcds-top-nav`)

A top navigation is a horizontal list of page links.

## When to use

_Docs page does not enumerate specific use cases — see upstream guidance._

## When NOT to use

_GCDS docs do not enumerate explicit 'when not to use' cases per component. See **Related** below for alternative components, and the [component catalog](../references/component-catalog.md) for the shape of adjacent options._

## Props

| Name | Attribute | Required | Type | Default | Description |
| ---- | --------- | -------- | ---- | ------- | ----------- |
| `label` | `label` | **yes** | `string` | _undefined_ | Label for navigation landmark |
| `alignment` | `alignment` | — | `'start' \| 'end'` | `'start'` | Nav alignment |

## Slots

| Name | Description |
| ---- | ----------- |
| `home` | Slot for the home link or site title. |
| `default` | Slot for the navigation groups and navigation links. |

## Events

_None._

## Methods

| Name | Signature | Description |
| ---- | --------- | ----------- |
| `getNavSize` | `getNavSize(): Promise<"desktop" \| "mobile">` |  |
| `updateNavSize` | `updateNavSize(size: any): Promise<void>` |  |
| `updateNavItemQueue` | `updateNavItemQueue(el: any, includeElement: boolean): Promise<void>` |  |

## Accessibility

- Uses native HTML semantics where possible — no custom ARIA required for the default case.
- `aria-*` attributes set on `<GcdsTopNav>` are forwarded to the inner native element (via `inheritAttributes` in the Stencil source).
- Focus: component-level focus is delegated through the shadow root where applicable.
- See [accessibility reference](../references/accessibility.md) for cross-cutting invariants.

## Usage (React)

```tsx
import { GcdsTopNav } from '@gcds-core/components-react';

<GcdsTopNav label="...">top nav</GcdsTopNav>
```

## Bilingual

- Set `lang` on `<html>` (or a `[lang]` ancestor) and this component resolves it via `assignLanguage`. Any internal strings bundled in `packages/web/src/components/gcds-top-nav/i18n/i18n.js` flip automatically.
- User-authored content (props, slot text) is your responsibility to translate.
- See [bilingual reference](../references/bilingual.md).

```tsx
<GcdsTopNav lang={locale} />
```

## Shadow DOM & styling

- Shadow: `true`
- Source file: `packages/web/src/components/gcds-top-nav/gcds-top-nav.tsx`
- Style with GCDS tokens only ([foundations](../references/foundations.md)). Do not pierce the shadow root.

## Dependencies

_None declared._

## Related

- Side navigation for products with up to three levels of navigation when the main content fits a narrow page width.
- Header for placing the Government of Canada branded header landmark.
- Breadcrumbs for a path from each level of the site's hierarchy to the current page.

## Notes from source

> A top navigation is a horizontal list of page links.
