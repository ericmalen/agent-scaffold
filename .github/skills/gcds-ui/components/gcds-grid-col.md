---
tag: gcds-grid-col
package: "@gcds-core/components-react"
react-export: GcdsGridCol
stability: stable
docs-en: (no dedicated docs page — see parent component)
docs-fr: (no dedicated docs page — see parent component)
---

# GcdsGridCol (`gcds-grid-col`)

A grid column is a single column in a grid layout, allowing for flexible content arrangement.

## When to use

_This component has no dedicated docs page. It is used as a sub-component of its parent — see the Related section below for the parent component._

## When NOT to use

_GCDS docs do not enumerate explicit 'when not to use' cases per component. See **Related** below for alternative components, and the [component catalog](../references/component-catalog.md) for the shape of adjacent options._

## Props

| Name | Attribute | Required | Type | Default | Description |
| ---- | --------- | -------- | ---- | ------- | ----------- |
| `tag` | `tag` | — | `string` | `'div'` | Set tag for grid column |
| `tablet` | `tablet` | — | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `6` | Optimize grid column size for tablet (768px - 1023px). Tablet grid column sizes are based on a 6 column grid. The tablet size will also be used for desktop, if desktop is undefined. |
| `desktop` | `desktop` | — | `\| 1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 7 \| 8 \| 9 \| 10 \| 11 \| 12` | _undefined_ | Optimize grid column size for desktop (1024px and above). Desktop grid column sizes are based on a 12 column grid. |

## Slots

| Name | Description |
| ---- | ----------- |
| `default` | Slot for the main content of the grid coloumn. |

## Events

_None._

## Methods

_None._

## Accessibility

- Uses native HTML semantics where possible — no custom ARIA required for the default case.
- `aria-*` attributes set on `<GcdsGridCol>` are forwarded to the inner native element (via `inheritAttributes` in the Stencil source).
- Focus: component-level focus is delegated through the shadow root where applicable.
- See [accessibility reference](../references/accessibility.md) for cross-cutting invariants.

## Usage (React)

```tsx
import { GcdsGridCol } from '@gcds-core/components-react';

<GcdsGridCol>grid col</GcdsGridCol>
```

## Bilingual

- Set `lang` on `<html>` (or a `[lang]` ancestor) and this component resolves it via `assignLanguage`. Any internal strings bundled in `packages/web/src/components/gcds-grid-col/i18n/i18n.js` flip automatically.
- User-authored content (props, slot text) is your responsibility to translate.
- See [bilingual reference](../references/bilingual.md).

```tsx
<GcdsGridCol lang={locale} />
```

## Shadow DOM & styling

- Shadow: `true`
- Source file: `packages/web/src/components/gcds-grid-col/gcds-grid-col.tsx`
- Style with GCDS tokens only ([foundations](../references/foundations.md)). Do not pierce the shadow root.

## Dependencies

_None declared._

## Related

_Not documented._

## Notes from source

> A grid column is a single column in a grid layout, allowing for flexible content arrangement.
