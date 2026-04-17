---
tag: gcds-lang-toggle
package: "@gcds-core/components-react"
react-export: GcdsLangToggle
stability: stable
docs-en: https://design-system.canada.ca/en/components/language-toggle/
docs-fr: https://design-system.canada.ca/fr/composants/bascule-de-langue/
---

# GcdsLangToggle (`gcds-lang-toggle`)

The language toggle is a link to the same content in the other Official Language.

## When to use

_Docs page does not enumerate specific use cases — see upstream guidance._

## When NOT to use

_GCDS docs do not enumerate explicit 'when not to use' cases per component. See **Related** below for alternative components, and the [component catalog](../references/component-catalog.md) for the shape of adjacent options._

## Props

| Name | Attribute | Required | Type | Default | Description |
| ---- | --------- | -------- | ---- | ------- | ----------- |
| `href` | `href` | **yes** | `string` | _undefined_ | The href attribute specifies the URL of the opposite language page |

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
- `aria-*` attributes set on `<GcdsLangToggle>` are forwarded to the inner native element (via `inheritAttributes` in the Stencil source).
- Focus: component-level focus is delegated through the shadow root where applicable.
- See [accessibility reference](../references/accessibility.md) for cross-cutting invariants.

## Usage (React)

```tsx
import { GcdsLangToggle } from '@gcds-core/components-react';

<GcdsLangToggle href="..." />
```

## Bilingual

- Set `lang` on `<html>` (or a `[lang]` ancestor) and this component resolves it via `assignLanguage`. Any internal strings bundled in `packages/web/src/components/gcds-lang-toggle/i18n/i18n.js` flip automatically.
- User-authored content (props, slot text) is your responsibility to translate.
- See [bilingual reference](../references/bilingual.md).

```tsx
<GcdsLangToggle lang={locale} />
```

## Shadow DOM & styling

- Shadow: `true`
- Source file: `packages/web/src/components/gcds-lang-toggle/gcds-lang-toggle.tsx`
- Style with GCDS tokens only ([foundations](../references/foundations.md)). Do not pierce the shadow root.

## Dependencies

_None declared._

## Related

- Header for placing the Government of Canada branded header landmark.

## Notes from source

> The language toggle is a link to the same content in the other Official Language.
