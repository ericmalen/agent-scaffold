---
tag: gcds-input
package: "@gcds-core/components-react"
react-export: GcdsInput
stability: stable
docs-en: https://design-system.canada.ca/en/components/input/
docs-fr: https://design-system.canada.ca/fr/composants/champ-de-saisie/
---

# GcdsInput (`gcds-input`)

An input is a space to enter short-form information in response to a question or instruction.

## When to use

- An individual or unique response.
- A short freeform response.
- A response that needs constraints around text length or the format of the response.
- Essential identifying or contact information.
- A date they already know, like a date of birth (for selection of an unknown date, use a date picker).

## When NOT to use

_GCDS docs do not enumerate explicit 'when not to use' cases per component. See **Related** below for alternative components, and the [component catalog](../references/component-catalog.md) for the shape of adjacent options._

## Props

| Name | Attribute | Required | Type | Default | Description |
| ---- | --------- | -------- | ---- | ------- | ----------- |
| `disabled` | `disabled` | — | `boolean` | `false` | Specifies if an input element is disabled or not. |
| `errorMessage` | `error-message` | — | `string` | _undefined_ | Error message for an invalid input element. |
| `hideLabel` | `hide-label` | — | `boolean` | `false` | Specifies if the label is hidden or not. |
| `hint` | `hint` | — | `string` | _undefined_ | Hint displayed below the label and above the input field. |
| `inputId` | `input-id` | **yes** | `string` | _undefined_ | Id  attribute for an input element. |
| `name` | `name` | **yes** | `string` | _undefined_ | Name attribute for an input element. |
| `label` | `label` | **yes** | `string` | _undefined_ | Form field label |
| `required` | `required` | — | `boolean` | `false` | Specifies if a form field is required or not. |
| `size` | `size` | — | `number` | _undefined_ | Size attribute for an input element to provide a visual indication of the expected text length to the user. |
| `type` | `type` | — | `'email' \| 'number' \| 'password' \| 'search' \| 'tel' \| 'text' \| 'url'` | `'text'` | Set Input types |
| `inputmode` | `inputmode` | — | `\| 'none' \| 'text' \| 'decimal' \| 'numeric' \| 'tel' \| 'search' \| 'email' \| 'url'` | `null` |  |
| `value` | `value` | — | `string` | _undefined_ | Default value for an input element. |
| `autocomplete` | `autocomplete` | — | `string` | _undefined_ | String to have autocomplete enabled. |
| `autofocus` | `autofocus` | — | `boolean` | _undefined_ | If true, the input will be focused on component render |
| `form` | `form` | — | `string` | _undefined_ | The ID of the form that the input field belongs to. |
| `max` | `max` | — | `number \| string` | _undefined_ | The maximum value that the input field can accept. Only applies to number input type. |
| `maxlength` | `maxlength` | — | `number` | _undefined_ | The maximum number of characters that the input field can accept. |
| `min` | `min` | — | `number \| string` | _undefined_ | The minimum value that the input field can accept. Only applies to number input type. |
| `minlength` | `minlength` | — | `number` | _undefined_ | The minimum number of characters that the input field can accept. |
| `pattern` | `pattern` | — | `string` | _undefined_ | Specifies a regular expression the form control's value should match. See: https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/pattern |
| `readonly` | `readonly` | — | `boolean` | _undefined_ | If true, the input field cannot be modified. |
| `step` | `step` | — | `number \| 'any'` | _undefined_ | A number that specifies the granularity that the value must adhere to. Valid for number type. See: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#step |
| `validator` | `validator` | — | `Array< string \| ValidatorEntry \| Validator<string> >` | _undefined_ | Array of validators |
| `validateOn` | `validate-on` | — | `'blur' \| 'submit' \| 'other'` | `'blur'` | Set event to call validator |
| `suggestions` | `suggestions` | — | `string \| Array<SuggestionOption>` | _undefined_ | Array of suggestion options. This creates a datalist element with options to represent permissible or recommended options available to choose from. |
| `validity` | `validity` | — | `ValidityState` | _undefined_ | Read-only property of the input, returns a ValidityState object that represents the validity states this element is in. |

## Slots

_None._

## Events

| Name | Payload | Description |
| ---- | ------- | ----------- |
| `gcdsFocus` | `void` | Emitted when the input has focus. |
| `gcdsBlur` | `void` | Emitted when the input loses focus. |
| `gcdsInput` | `string` | Emitted when the element has received input. |
| `gcdsSuggestionSelected` | `string` | Emitted when a suggestion is selected. |
| `gcdsChange` | `string` | Emitted when the input has changed. |
| `gcdsError` | `object` | Emitted when the input has a validation error. |
| `gcdsValid` | `object` | Emitted when the input has a validation error. |

## Methods

| Name | Signature | Description |
| ---- | --------- | ----------- |
| `validate` | `validate(): Promise<void>` | Call any active validators |
| `checkValidity` | `checkValidity(): Promise<boolean>` | Check the validity of gcds-input |
| `getValidationMessage` | `getValidationMessage(): Promise<string>` | Get validationMessage of gcds-input |

## Accessibility

- Uses native HTML semantics where possible — no custom ARIA required for the default case.
- `aria-*` attributes set on `<GcdsInput>` are forwarded to the inner native element (via `inheritAttributes` in the Stencil source).
- Focus: component-level focus is delegated through the shadow root where applicable.
- See [accessibility reference](../references/accessibility.md) for cross-cutting invariants.

## Usage (React)

```tsx
import { GcdsInput } from '@gcds-core/components-react';

<GcdsInput inputId="..." name="..." label="..." />
```

## Bilingual

- Set `lang` on `<html>` (or a `[lang]` ancestor) and this component resolves it via `assignLanguage`. Any internal strings bundled in `packages/web/src/components/gcds-input/i18n/i18n.js` flip automatically.
- User-authored content (props, slot text) is your responsibility to translate.
- See [bilingual reference](../references/bilingual.md).

```tsx
<GcdsInput lang={locale} />
```

## Shadow DOM & styling

- Shadow: `{ delegatesFocus: true }`
- Source file: `packages/web/src/components/gcds-input/gcds-input.tsx`
- Style with GCDS tokens only ([foundations](../references/foundations.md)). Do not pierce the shadow root.

## Dependencies

_None declared._

## Related

- Textareas for multi-line freeform responses.
- Date selectors when you want someone to choose a not-yet-known date, like for appointment scheduling.

## Notes from source

> An input is a space to enter short-form information in response to a question or instruction.
