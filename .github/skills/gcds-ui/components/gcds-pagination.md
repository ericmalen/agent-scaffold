---
tag: gcds-pagination
package: "@gcds-core/components-react"
react-export: GcdsPagination
stability: stable
docs-en: https://design-system.canada.ca/en/components/pagination/
docs-fr: https://design-system.canada.ca/fr/composants/pagination/
---

# GcdsPagination (`gcds-pagination`)

Pagination is a division of content into multiple linked pages.

## When to use

_Docs page does not enumerate specific use cases — see upstream guidance._

## When NOT to use

_GCDS docs do not enumerate explicit 'when not to use' cases per component. See **Related** below for alternative components, and the [component catalog](../references/component-catalog.md) for the shape of adjacent options._

## Props

| Name | Attribute | Required | Type | Default | Description |
| ---- | --------- | -------- | ---- | ------- | ----------- |
| `display` | `display` | — | `'list' \| 'simple'` | `'list'` | Determines the pagination display style. |
| `label` | `label` | **yes** | `string` | _undefined_ | Navigation element label |
| `previousHref` | `previous-href` | — | `string` | _undefined_ | Simple display - href for previous link |
| `previousLabel` | `previous-label` | — | `string` | _undefined_ | Simple display - label for previous link |
| `nextHref` | `next-href` | — | `string` | _undefined_ | Simple display - href for next link |
| `nextLabel` | `next-label` | — | `string` | _undefined_ | Simple display - lable for next link |
| `totalPages` | `total-pages` | — | `number` | _undefined_ | List display - Total number of pages |
| `currentPage` | `current-page` | — | `number` | _undefined_ | List display - Current page number |
| `url` | `url` | — | `string \| object` | _undefined_ | List display - URL object to create query strings and fragment on links |

## Slots

_None._

## Events

| Name | Payload | Description |
| ---- | ------- | ----------- |
| `gcdsFocus` | `void` | Emitted when the link has focus. |
| `gcdsBlur` | `void` | Emitted when the link loses focus. |
| `gcdsClick` | `object \| string` | Emitted when the link has been clicked. Contains the href in event detail when using simple display, or an object with page and href when using list display. |

## Methods

_None._

## Accessibility

- Uses native HTML semantics where possible — no custom ARIA required for the default case.
- `aria-*` attributes set on `<GcdsPagination>` are forwarded to the inner native element (via `inheritAttributes` in the Stencil source).
- Focus: component-level focus is delegated through the shadow root where applicable.
- See [accessibility reference](../references/accessibility.md) for cross-cutting invariants.

## Usage (React)

```tsx
import { GcdsPagination } from '@gcds-core/components-react';

<GcdsPagination label="..." />
```

## Bilingual

- Set `lang` on `<html>` (or a `[lang]` ancestor) and this component resolves it via `assignLanguage`. Any internal strings bundled in `packages/web/src/components/gcds-pagination/i18n/i18n.js` flip automatically.
- User-authored content (props, slot text) is your responsibility to translate.
- See [bilingual reference](../references/bilingual.md).

```tsx
<GcdsPagination lang={locale} />
```

## Shadow DOM & styling

- Shadow: `true`
- Source file: `packages/web/src/components/gcds-pagination/gcds-pagination.tsx`
- Style with GCDS tokens only ([foundations](../references/foundations.md)). Do not pierce the shadow root.

## Dependencies

_None declared._

## Related

- Stepper to track progress in a multi-step process.
- Links in the button component to navigate between non-sequential pages or to external sites.

## Notes from source

> Pagination is a division of content into multiple linked pages.
