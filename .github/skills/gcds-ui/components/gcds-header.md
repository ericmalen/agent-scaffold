---
tag: gcds-header
package: "@gcds-core/components-react"
react-export: GcdsHeader
stability: stable
docs-en: https://design-system.canada.ca/en/components/header/
docs-fr: https://design-system.canada.ca/fr/composants/en-tete/
---

# GcdsHeader (`gcds-header`)

The header is the responsive Government of Canada branded header landmark.

## When to use

- Consistently identify a GC digital service or product.
- Signal the start of a page.
- Support ease of navigation for people using GC services.
- Include the required Federal Identity Program branded Government of Canada signature.

## When NOT to use

_GCDS docs do not enumerate explicit 'when not to use' cases per component. See **Related** below for alternative components, and the [component catalog](../references/component-catalog.md) for the shape of adjacent options._

## Props

| Name | Attribute | Required | Type | Default | Description |
| ---- | --------- | -------- | ---- | ------- | ----------- |
| `langHref` | `lang-href` | **yes** | `string` | _undefined_ | GcdsLangToggle - The href attribute specifies the URL of the opposite language page |
| `signatureHasLink` | `signature-has-link` | — | `boolean` | `true` | GcdsSignature - GCDS signature links to Canada.ca |
| `skipToHref` | `skip-to-href` | **yes** | `string` | _undefined_ | Top navigation - Skip to content href |

## Slots

| Name | Description |
| ---- | ----------- |
| `banner` | Slot to add a banner across the top of the header. |
| `breadcrumb` | Slot to add breadcrumbs at the bottom of the header. |
| `menu` | Slot to add a menu below the divider line. |
| `search` | Slot to add a search field to the right of the header. |
| `skip-to-nav` | Slot to add a hidden skip to content navigation at the top of the header. |
| `signature` | Slot to replace Government of Canada signature. |
| `toggle` | Slot to add a custom language toggle in the top-right of the header. |

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
- `aria-*` attributes set on `<GcdsHeader>` are forwarded to the inner native element (via `inheritAttributes` in the Stencil source).
- Focus: component-level focus is delegated through the shadow root where applicable.
- See [accessibility reference](../references/accessibility.md) for cross-cutting invariants.

## Usage (React)

```tsx
import { GcdsHeader } from '@gcds-core/components-react';

<GcdsHeader langHref="..." skipToHref="..." />
```

## Bilingual

- Set `lang` on `<html>` (or a `[lang]` ancestor) and this component resolves it via `assignLanguage`. Any internal strings bundled in `packages/web/src/components/gcds-header/i18n/i18n.js` flip automatically.
- User-authored content (props, slot text) is your responsibility to translate.
- See [bilingual reference](../references/bilingual.md).

```tsx
<GcdsHeader lang={locale} />
```

## Shadow DOM & styling

- Shadow: `true`
- Source file: `packages/web/src/components/gcds-header/gcds-header.tsx`
- Style with GCDS tokens only ([foundations](../references/foundations.md)). Do not pierce the shadow root.

## Dependencies

_None declared._

## Related

- Footer to signal the end of a page with a Government of Canada branded landmark.
- Signature to identify Government of Canada brand and identity.

## Notes from source

> The header is the responsive Government of Canada branded header landmark.
