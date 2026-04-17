---
tag: gcds-fieldset
package: "@gcds-core/components-react"
react-export: GcdsFieldset
stability: stable
docs-en: https://design-system.canada.ca/en/components/fieldset/
docs-fr: https://design-system.canada.ca/fr/composants/jeu-de-champs/
---

# GcdsFieldset (`gcds-fieldset`)

A fieldset is a group of multiple form components or elements.

## When to use

- Logically grouping form elements or components helps support understanding and usability. Use a fieldset to group form components when they relate to the same topic.

## When NOT to use

_GCDS docs do not enumerate explicit 'when not to use' cases per component. See **Related** below for alternative components, and the [component catalog](../references/component-catalog.md) for the shape of adjacent options._

## Props

| Name | Attribute | Required | Type | Default | Description |
| ---- | --------- | -------- | ---- | ------- | ----------- |
| `hint` | `hint` | — | `string` | _undefined_ | Hint displayed below the legend. |
| `legend` | `legend` | **yes** | `string` | _undefined_ | The title for the contents of the fieldset |
| `legendSize` | `legend-size` | **yes** | `'h2' \| 'h3' \| 'h4' \| 'h5' \| 'h6'` | _undefined_ | Sets the appropriate font size for the fieldset legend. |

## Slots

| Name | Description |
| ---- | ----------- |
| `default` | Slot for the form elements. |

## Events

_None._

## Methods

_None._

## Accessibility

- Uses native HTML semantics where possible — no custom ARIA required for the default case.
- `aria-*` attributes set on `<GcdsFieldset>` are forwarded to the inner native element (via `inheritAttributes` in the Stencil source).
- Focus: component-level focus is delegated through the shadow root where applicable.
- See [accessibility reference](../references/accessibility.md) for cross-cutting invariants.

## Usage (React)

```tsx
import { GcdsFieldset } from '@gcds-core/components-react';

<GcdsFieldset legend="..." legendSize="h2">fieldset</GcdsFieldset>
```

## Bilingual

- Set `lang` on `<html>` (or a `[lang]` ancestor) and this component resolves it via `assignLanguage`. Any internal strings bundled in `packages/web/src/components/gcds-fieldset/i18n/i18n.js` flip automatically.
- User-authored content (props, slot text) is your responsibility to translate.
- See [bilingual reference](../references/bilingual.md).

```tsx
<GcdsFieldset lang={locale} />
```

## Shadow DOM & styling

- Shadow: `{ delegatesFocus: true }`
- Source file: `packages/web/src/components/gcds-fieldset/gcds-fieldset.tsx`
- Style with GCDS tokens only ([foundations](../references/foundations.md)). Do not pierce the shadow root.

## Dependencies

_None declared._

## Related

- Inputs or textareas when you are requesting a written response from a person.

## Notes from source

> A fieldset is a group of multiple form components or elements.
