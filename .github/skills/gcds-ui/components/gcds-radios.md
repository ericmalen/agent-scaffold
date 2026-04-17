---
tag: gcds-radios
package: "@gcds-core/components-react"
react-export: GcdsRadios
stability: stable
docs-en: https://design-system.canada.ca/en/components/radios/
docs-fr: https://design-system.canada.ca/fr/composants/boutons-radio/
---

# GcdsRadios (`gcds-radios`)

Radios provide a set of options for a single response.

## When to use

- Limit the number of answers to your question.
- Specify the possible answers to your question.
- Give a person the ability to answer without writing by selecting one item from a list.

## When NOT to use

_GCDS docs do not enumerate explicit 'when not to use' cases per component. See **Related** below for alternative components, and the [component catalog](../references/component-catalog.md) for the shape of adjacent options._

## Props

| Name | Attribute | Required | Type | Default | Description |
| ---- | --------- | -------- | ---- | ------- | ----------- |
| `options` | `options` | **yes** | `string \| Array<RadioObject>` | _undefined_ | Options to render radio buttons |
| `name` | `name` | **yes** | `string` | _undefined_ | The `name` attribute for the radios, used to group radio elements together |
| `autofocus` | `autofocus` | — | `boolean` | _undefined_ | If true, the input will be focused on component render |
| `form` | `form` | — | `string` | _undefined_ | The ID of the form that the radios belong to. |
| `legend` | `legend` | **yes** | `string` | _undefined_ | Label or legend for the group of radio elements |
| `required` | `required` | — | `boolean` | _undefined_ | Specifies if a form field is required or not. |
| `hint` | `hint` | — | `string` | _undefined_ | Hint displayed below the label and above the radio elements |
| `errorMessage` | `error-message` | — | `string` | _undefined_ | Set this to display an error message for invalid radios |
| `disabled` | `disabled` | — | `boolean` | _undefined_ | Specifies if an input element is disabled or not. |
| `value` | `value` | — | `string` | _undefined_ | Default value for the element |
| `validator` | `validator` | — | `Array< string \| ValidatorEntry \| Validator<string> >` | _undefined_ | Array of validators |
| `validateOn` | `validate-on` | — | `'blur' \| 'submit' \| 'other'` | `'blur'` | Set event to call validator |
| `hideLegend` | `hide-legend` | — | `boolean` | `false` | Specifies if the legend is hidden or not. |
| `validity` | `validity` | — | `ValidityState` | _undefined_ | Read-only property of the input, returns a ValidityState object that represents the validity states this element is in. |

## Slots

_None._

## Events

| Name | Payload | Description |
| ---- | ------- | ----------- |
| `gcdsInput` | `string` | Emitted when radios has been changed as a direct result of a user action (a radio option has been selected). Contains new value in event detail |
| `gcdsChange` | `string` | Emitted when a radios option is checked (but not when unchecked). Contains new value in event detail |
| `gcdsFocus` | `void` | Emitted when radios has received focus |
| `gcdsBlur` | `void` | Emitted when the radios has lost focus |
| `gcdsValid` | `void` | Emitted when radios has passed validation |
| `gcdsError` | `object` | Emitted when radios has a validation error |

## Methods

| Name | Signature | Description |
| ---- | --------- | ----------- |
| `validate` | `validate(): Promise<void>` | Call any active validators |
| `checkValidity` | `checkValidity(): Promise<boolean>` | Check the validity of gcds-radios |
| `getValidationMessage` | `getValidationMessage(): Promise<string>` | Get validationMessage of gcds-radios |

## Accessibility

- Uses native HTML semantics where possible — no custom ARIA required for the default case.
- `aria-*` attributes set on `<GcdsRadios>` are forwarded to the inner native element (via `inheritAttributes` in the Stencil source).
- Focus: component-level focus is delegated through the shadow root where applicable.
- See [accessibility reference](../references/accessibility.md) for cross-cutting invariants.

## Usage (React)

```tsx
import { GcdsRadios } from '@gcds-core/components-react';

<GcdsRadios options="..." name="..." legend="..." />
```

## Bilingual

- Set `lang` on `<html>` (or a `[lang]` ancestor) and this component resolves it via `assignLanguage`. Any internal strings bundled in `packages/web/src/components/gcds-radios/i18n/i18n.js` flip automatically.
- User-authored content (props, slot text) is your responsibility to translate.
- See [bilingual reference](../references/bilingual.md).

```tsx
<GcdsRadios lang={locale} />
```

## Shadow DOM & styling

- Shadow: `{ delegatesFocus: true }`
- Source file: `packages/web/src/components/gcds-radios/gcds-radios.tsx`
- Style with GCDS tokens only ([foundations](../references/foundations.md)). Do not pierce the shadow root.

## Dependencies

_None declared._

## Related

- Checkboxes when you are expecting the user to select multiple options from a list of items.
- Select when you can give someone a medium to large set of options for a known single selection.

## Notes from source

> Radios provide a set of options for a single response.
