---
tag: gcds-signature
package: "@gcds-core/components-react"
react-export: GcdsSignature
stability: stable
docs-en: https://design-system.canada.ca/en/components/signature/
docs-fr: https://design-system.canada.ca/fr/composants/signature/
---

# GcdsSignature (`gcds-signature`)

The signature is the Government of Canada landmark identifier found in the header or footer.

## When to use

_Docs page does not enumerate specific use cases — see upstream guidance._

## When NOT to use

_GCDS docs do not enumerate explicit 'when not to use' cases per component. See **Related** below for alternative components, and the [component catalog](../references/component-catalog.md) for the shape of adjacent options._

## Props

| Name | Attribute | Required | Type | Default | Description |
| ---- | --------- | -------- | ---- | ------- | ----------- |
| `type` | `type` | — | `'signature' \| 'wordmark'` | `'signature'` | The type of graphic to render |
| `variant` | `variant` | — | `'colour' \| 'white'` | `'colour'` | The colour variant to render |
| `hasLink` | `has-link` | — | `boolean` | `false` | Has link to canada.ca. Only applies to signature |

## Slots

_None._

## Events

_None._

## Methods

_None._

## Accessibility

- Uses native HTML semantics where possible — no custom ARIA required for the default case.
- `aria-*` attributes set on `<GcdsSignature>` are forwarded to the inner native element (via `inheritAttributes` in the Stencil source).
- Focus: component-level focus is delegated through the shadow root where applicable.
- See [accessibility reference](../references/accessibility.md) for cross-cutting invariants.

## Usage (React)

```tsx
import { GcdsSignature } from '@gcds-core/components-react';

<GcdsSignature />
```

## Bilingual

- Set `lang` on `<html>` (or a `[lang]` ancestor) and this component resolves it via `assignLanguage`. Any internal strings bundled in `packages/web/src/components/gcds-signature/i18n/i18n.js` flip automatically.
- User-authored content (props, slot text) is your responsibility to translate.
- See [bilingual reference](../references/bilingual.md).

```tsx
<GcdsSignature lang={locale} />
```

## Shadow DOM & styling

- Shadow: `true`
- Source file: `packages/web/src/components/gcds-signature/gcds-signature.tsx`
- Style with GCDS tokens only ([foundations](../references/foundations.md)). Do not pierce the shadow root.

## Dependencies

_None declared._

## Related

- Header for placing the Government of Canada branded header landmark.
- Footer for placing the Government of Canada branded footer landmark.

## Notes from source

> The signature is the Government of Canada landmark identifier found in the header or footer.
