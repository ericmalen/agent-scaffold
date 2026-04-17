---
tag: gcds-footer
package: "@gcds-core/components-react"
react-export: GcdsFooter
stability: stable
docs-en: https://design-system.canada.ca/en/components/footer/
docs-fr: https://design-system.canada.ca/fr/composants/pied-de-page/
---

# GcdsFooter (`gcds-footer`)

The footer is the responsive Government of Canada branded footer landmark.

## When to use

- The end of a product or site page.
- A Government of Canada digital service or product offering a broad range of services and information.
- The Government of Canada identity through the wordmark.

## When NOT to use

_GCDS docs do not enumerate explicit 'when not to use' cases per component. See **Related** below for alternative components, and the [component catalog](../references/component-catalog.md) for the shape of adjacent options._

## Props

| Name | Attribute | Required | Type | Default | Description |
| ---- | --------- | -------- | ---- | ------- | ----------- |
| `display` | `display` | — | `'compact' \| 'full'` | `'compact'` | Display mode of the footer |
| `contextualHeading` | `contextual-heading` | — | `string` | _undefined_ | Heading for contextual slot and nav landmark |
| `contextualLinks` | `contextual-links` | — | `string \| object` | _undefined_ | Object of list items for contextual band. Format: { link-label: link-href } |
| `subLinks` | `sub-links` | — | `string \| object` | _undefined_ | Object of list items for sub-footer. Format: { link-label: link-href } |

## Slots

_None._

## Events

| Name | Payload | Description |
| ---- | ------- | ----------- |
| `gcdsFocus` | `void` | Emitted when the link has focus. |
| `gcdsBlur` | `void` | Emitted when the link loses focus. |
| `gcdsClick` | `string` | Emitted when the link has been clicked. Contains the href in the event detail. |

## Methods

_None._

## Accessibility

- Uses native HTML semantics where possible — no custom ARIA required for the default case.
- `aria-*` attributes set on `<GcdsFooter>` are forwarded to the inner native element (via `inheritAttributes` in the Stencil source).
- Focus: component-level focus is delegated through the shadow root where applicable.
- See [accessibility reference](../references/accessibility.md) for cross-cutting invariants.

## Usage (React)

```tsx
import { GcdsFooter } from '@gcds-core/components-react';

<GcdsFooter />
```

## Bilingual

- Set `lang` on `<html>` (or a `[lang]` ancestor) and this component resolves it via `assignLanguage`. Any internal strings bundled in `packages/web/src/components/gcds-footer/i18n/i18n.js` flip automatically.
- User-authored content (props, slot text) is your responsibility to translate.
- See [bilingual reference](../references/bilingual.md).

```tsx
<GcdsFooter lang={locale} />
```

## Shadow DOM & styling

- Shadow: `true`
- Source file: `packages/web/src/components/gcds-footer/gcds-footer.tsx`
- Style with GCDS tokens only ([foundations](../references/foundations.md)). Do not pierce the shadow root.

## Dependencies

_None declared._

## Related

- Header for placing the Government of Canada branded header landmark.
- Top navigation for guiding navigation through a website using a landmark.

## Notes from source

> The footer is the responsive Government of Canada branded footer landmark.
