---
tag: gcds-checkboxes
package: "@gcds-core/components-react"
react-export: GcdsCheckboxes
stability: stable
docs-en: https://design-system.canada.ca/en/components/checkboxes/
docs-fr: https://design-system.canada.ca/fr/composants/cases-a-cocher/
---

# GcdsCheckboxes (`gcds-checkboxes`)

Checkboxes provide a set of options for multiple responses.

## When to use

- Limit the number of answers to your question.
- Let a person choose one or several answers from a contained list by checking off the right ones.
- Give a person the ability to answer without writing by selecting one or multiple items from a list.

## When NOT to use

_GCDS docs do not enumerate explicit 'when not to use' cases per component. See **Related** below for alternative components, and the [component catalog](../references/component-catalog.md) for the shape of adjacent options._

## Props

| Name | Attribute | Required | Type | Default | Description |
| ---- | --------- | -------- | ---- | ------- | ----------- |
| `name` | `name` | **yes** | `string` | _undefined_ | Name attribute for a checkboxes element. |
| `legend` | `legend` | — | `string` | _undefined_ | Set the legend for fieldset form group. |
| `options` | `options` | **yes** | `string \| Array<CheckboxObject>` | _undefined_ | Options to render checkboxes buttons |
| `required` | `required` | — | `boolean` | _undefined_ | Specifies if the checkboxes are required or not. |
| `disabled` | `disabled` | — | `boolean` | _undefined_ | Specifies if the checkboxes are disabled or not. |
| `autofocus` | `autofocus` | — | `boolean` | _undefined_ | If true, the checkobox will be focused on component render |
| `form` | `form` | — | `string` | _undefined_ | The ID of the form that the checkboxes belong to. |
| `hideLabel` | `hide-label` | — | `boolean` | `false` | For single checkbox, specifies if the label is hidden or not. |
| `hideLegend` | `hide-legend` | — | `boolean` | `false` | For checkbox groups, specifies if the legend is hidden or not. |
| `value` | `value` | — | `string \| Array<string>` | `[]` | Value for checkboxes component. |
| `errorMessage` | `error-message` | — | `string` | _undefined_ | Set this to display an error message for invalid <gcds-checkboxes> |
| `hint` | `hint` | — | `string` | _undefined_ | Hint displayed below the label. |
| `validator` | `validator` | — | `Array< string \| ValidatorEntry \| Validator<string> >` | _undefined_ | Array of validators |
| `validateOn` | `validate-on` | — | `'blur' \| 'submit' \| 'other'` | `'blur'` | Set event to call validator |
| `validity` | `validity` | — | `ValidityState` | _undefined_ | Read-only property of the checkboxes, returns a ValidityState object that represents the validity states this element is in. |

## Slots

_None._

## Events

| Name | Payload | Description |
| ---- | ------- | ----------- |
| `gcdsClick` | `void` | Emitted when the checkbox has been clicked. |
| `gcdsFocus` | `void` | Emitted when the checkbox has focus. |
| `gcdsBlur` | `void` | Emitted when the checkbox loses focus. |
| `gcdsInput` | `string[]` | Emitted when a checkbox has been inputted. Contains the new value in the event detail. |
| `gcdsChange` | `string[]` | Emitted when a checkbox has been changed. Contains the new value in the event detail. |
| `gcdsError` | `object` | Emitted when the checkbox has a validation error. |
| `gcdsValid` | `object` | Emitted when the checkbox has a validation error. |

## Methods

| Name | Signature | Description |
| ---- | --------- | ----------- |
| `validate` | `validate(): Promise<void>` | Call any active validators |
| `checkValidity` | `checkValidity(): Promise<boolean>` | Check the validity of gcds-checkboxes |
| `getValidationMessage` | `getValidationMessage(): Promise<string>` | Get validationMessage of gcds-checkboxes |

## Accessibility

- Uses native HTML semantics where possible — no custom ARIA required for the default case.
- `aria-*` attributes set on `<GcdsCheckboxes>` are forwarded to the inner native element (via `inheritAttributes` in the Stencil source).
- Focus: component-level focus is delegated through the shadow root where applicable.
- See [accessibility reference](../references/accessibility.md) for cross-cutting invariants.

## Usage (React)

```tsx
import { GcdsCheckboxes } from '@gcds-core/components-react';

<GcdsCheckboxes name="..." options="..." />
```

## Bilingual

- Set `lang` on `<html>` (or a `[lang]` ancestor) and this component resolves it via `assignLanguage`. Any internal strings bundled in `packages/web/src/components/gcds-checkboxes/i18n/i18n.js` flip automatically.
- User-authored content (props, slot text) is your responsibility to translate.
- See [bilingual reference](../references/bilingual.md).

```tsx
<GcdsCheckboxes lang={locale} />
```

## Shadow DOM & styling

- Shadow: `{ delegatesFocus: true }`
- Source file: `packages/web/src/components/gcds-checkboxes/gcds-checkboxes.tsx`
- Style with GCDS tokens only ([foundations](../references/foundations.md)). Do not pierce the shadow root.

## Dependencies

_None declared._

## Related

- Radios to give a single option from a larger set of options.
- Select to give a single option from a medium to long sized list in a dropdown format.
- Inputs for short, single-line responses.

## Notes from source

> Checkboxes provide a set of options for multiple responses.
