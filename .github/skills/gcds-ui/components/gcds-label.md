---
tag: gcds-label
package: "@gcds-core/components-react"
react-export: GcdsLabel
stability: stable
docs-en: (no dedicated docs page — see parent component)
docs-fr: (no dedicated docs page — see parent component)
---

# GcdsLabel (`gcds-label`)

Label for form fields, providing accessibility and context for users.

## When to use

_This component has no dedicated docs page. It is used as a sub-component of its parent — see the Related section below for the parent component._

## When NOT to use

_GCDS docs do not enumerate explicit 'when not to use' cases per component. See **Related** below for alternative components, and the [component catalog](../references/component-catalog.md) for the shape of adjacent options._

## Props

| Name | Attribute | Required | Type | Default | Description |
| ---- | --------- | -------- | ---- | ------- | ----------- |
| `hideLabel` | `hide-label` | — | `boolean` | _undefined_ | Specifies if the label is hidden or not. |
| `label` | `label` | — | `string` | _undefined_ | Form field label |
| `labelFor` | `label-for` | — | `string` | _undefined_ | Defines the label's for attribute. |
| `required` | `required` | — | `boolean` | _undefined_ | Specifies if a form field is required or not. |

## Slots

| Name | Description |
| ---- | ----------- |
| `default` | Slot for the label content. |

## Events

_None._

## Methods

_None._

## Accessibility

- Uses native HTML semantics where possible — no custom ARIA required for the default case.
- `aria-*` attributes set on `<GcdsLabel>` are forwarded to the inner native element (via `inheritAttributes` in the Stencil source).
- Focus: component-level focus is delegated through the shadow root where applicable.
- See [accessibility reference](../references/accessibility.md) for cross-cutting invariants.

## Usage (React)

```tsx
import { GcdsLabel } from '@gcds-core/components-react';

<GcdsLabel>label</GcdsLabel>
```

## Bilingual

- Set `lang` on `<html>` (or a `[lang]` ancestor) and this component resolves it via `assignLanguage`. Any internal strings bundled in `packages/web/src/components/gcds-label/i18n/i18n.js` flip automatically.
- User-authored content (props, slot text) is your responsibility to translate.
- See [bilingual reference](../references/bilingual.md).

```tsx
<GcdsLabel lang={locale} />
```

## Shadow DOM & styling

- Shadow: `false`
- Source file: `packages/web/src/components/gcds-label/gcds-label.tsx`
- Style with GCDS tokens only ([foundations](../references/foundations.md)). Do not pierce the shadow root.

## Dependencies

_None declared._

## Related

_Not documented._

## Notes from source

> Label for form fields, providing accessibility and context for users.
