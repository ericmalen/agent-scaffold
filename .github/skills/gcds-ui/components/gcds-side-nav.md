---
tag: gcds-side-nav
package: "@gcds-core/components-react"
react-export: GcdsSideNav
stability: stable
docs-en: https://design-system.canada.ca/en/components/side-navigation/
docs-fr: https://design-system.canada.ca/fr/composants/barre-de-navigation-laterale/
---

# GcdsSideNav (`gcds-side-nav`)

A side navigation is a vertical list of page links on the left side of the screen.

## When to use

_Docs page does not enumerate specific use cases — see upstream guidance._

## When NOT to use

_GCDS docs do not enumerate explicit 'when not to use' cases per component. See **Related** below for alternative components, and the [component catalog](../references/component-catalog.md) for the shape of adjacent options._

## Props

| Name | Attribute | Required | Type | Default | Description |
| ---- | --------- | -------- | ---- | ------- | ----------- |
| `label` | `label` | **yes** | `string` | _undefined_ | Label for navigation landmark |

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
- `aria-*` attributes set on `<GcdsSideNav>` are forwarded to the inner native element (via `inheritAttributes` in the Stencil source).
- Focus: component-level focus is delegated through the shadow root where applicable.
- See [accessibility reference](../references/accessibility.md) for cross-cutting invariants.

## Usage (React)

```tsx
import { GcdsSideNav } from '@gcds-core/components-react';

<GcdsSideNav label="...">side nav</GcdsSideNav>
```

## Bilingual

- Set `lang` on `<html>` (or a `[lang]` ancestor) and this component resolves it via `assignLanguage`. Any internal strings bundled in `packages/web/src/components/gcds-side-nav/i18n/i18n.js` flip automatically.
- User-authored content (props, slot text) is your responsibility to translate.
- See [bilingual reference](../references/bilingual.md).

```tsx
<GcdsSideNav lang={locale} />
```

## Shadow DOM & styling

- Shadow: `true`
- Source file: `packages/web/src/components/gcds-side-nav/gcds-side-nav.tsx`
- Style with GCDS tokens only ([foundations](../references/foundations.md)). Do not pierce the shadow root.

## Dependencies

_None declared._

## Related

- Top navigation for straightforward navigation of simple hierarchies.

## Notes from source

> A side navigation is a vertical list of page links on the left side of the screen.
