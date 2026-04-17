---
tag: gcds-icon
package: "@gcds-core/components-react"
react-export: GcdsIcon
stability: stable
docs-en: https://design-system.canada.ca/en/components/icon/
docs-fr: https://design-system.canada.ca/fr/composants/icone/
---

# GcdsIcon (`gcds-icon`)

An icon is a symbol that visually represents an action or idea.

## When to use

- Clarify information with a visual reference.
- Highlight key actions or states, like a checkmark for validation.
- Scan content quicker and reduce cognitive load.

## When NOT to use

_GCDS docs do not enumerate explicit 'when not to use' cases per component. See **Related** below for alternative components, and the [component catalog](../references/component-catalog.md) for the shape of adjacent options._

## Props

| Name | Attribute | Required | Type | Default | Description |
| ---- | --------- | -------- | ---- | ------- | ----------- |
| `label` | `label` | — | `string` | _undefined_ | Add icon description. |
| `marginLeft` | `margin-left` | — | `SpacingValues` | _undefined_ | Add margin to the left of the icon |
| `marginRight` | `margin-right` | — | `SpacingValues` | _undefined_ | Add margin to the right of the icon |
| `name` | `name` | **yes** | `\| 'checkmark-circle' \| 'chevron-down' \| 'chevron-left' \| 'chevron-right' \| 'chevron-up' \| 'close' \| 'download' \| 'email' \| 'exclamation-circle' \| 'external' \| 'info-circle' \| 'phone' \| 'search' \| 'warning-triangle'` | _undefined_ | Name of the icon. |
| `size` | `size` | — | `\| 'inherit' \| 'text-small' \| 'text' \| 'h6' \| 'h5' \| 'h4' \| 'h3' \| 'h2' \| 'h1'` | `'inherit'` | Defines the size of the icon. |

## Slots

_None._

## Events

_None._

## Methods

_None._

## Accessibility

- Uses native HTML semantics where possible — no custom ARIA required for the default case.
- `aria-*` attributes set on `<GcdsIcon>` are forwarded to the inner native element (via `inheritAttributes` in the Stencil source).
- Focus: component-level focus is delegated through the shadow root where applicable.
- See [accessibility reference](../references/accessibility.md) for cross-cutting invariants.

## Usage (React)

```tsx
import { GcdsIcon } from '@gcds-core/components-react';

<GcdsIcon name="checkmark-circle" />
```

## Bilingual

- Set `lang` on `<html>` (or a `[lang]` ancestor) and this component resolves it via `assignLanguage`. Any internal strings bundled in `packages/web/src/components/gcds-icon/i18n/i18n.js` flip automatically.
- User-authored content (props, slot text) is your responsibility to translate.
- See [bilingual reference](../references/bilingual.md).

```tsx
<GcdsIcon lang={locale} />
```

## Shadow DOM & styling

- Shadow: `true`
- Source file: `packages/web/src/components/gcds-icon/gcds-icon.tsx`
- Style with GCDS tokens only ([foundations](../references/foundations.md)). Do not pierce the shadow root.

## Dependencies

_None declared._

## Related

- Text to display written content in a styled and formatted paragraph.
- Notice to display a short, prominent message.

## Notes from source

> An icon is a symbol that visually represents an action or idea.
