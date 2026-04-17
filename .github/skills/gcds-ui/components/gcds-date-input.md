---
tag: gcds-date-input
package: "@gcds-core/components-react"
react-export: GcdsDateInput
stability: stable
docs-en: https://design-system.canada.ca/en/components/date-input/
docs-fr: https://design-system.canada.ca/fr/composants/champ-de-date/
---

# GcdsDateInput (`gcds-date-input`)

A date input is a space to enter a known date.

## When to use

_Docs page does not enumerate specific use cases — see upstream guidance._

## When NOT to use

_GCDS docs do not enumerate explicit 'when not to use' cases per component. See **Related** below for alternative components, and the [component catalog](../references/component-catalog.md) for the shape of adjacent options._

## Props

| Name | Attribute | Required | Type | Default | Description |
| ---- | --------- | -------- | ---- | ------- | ----------- |
| `name` | `name` | **yes** | `string` | _undefined_ | Name attribute for the date input. |
| `legend` | `legend` | **yes** | `string` | _undefined_ | Fieldset legend |
| `format` | `format` | **yes** | `'full' \| 'compact'` | _undefined_ | Set this property to full to show month, day, and year form elements. Set it to compact to show only the month and year form elements. |
| `value` | `value` | — | `string` | _undefined_ | Combined date value from the two/three form elements. Format: YYYY-MM-DD or YYYY-MM |
| `required` | `required` | — | `boolean` | `false` | Specifies if a form field is required or not. |
| `hint` | `hint` | — | `string` | _undefined_ | Hint displayed below the legend and above form fields. |
| `errorMessage` | `error-message` | — | `string` | _undefined_ | Error message displayed below the legend and above form fields. |
| `disabled` | `disabled` | — | `boolean` | `false` | Specifies if the date input is disabled or not. |
| `autofocus` | `autofocus` | — | `boolean` | _undefined_ | If true, the date-input will be focused on component render |
| `max` | `max` | — | `string` | _undefined_ | The maximum date that the date-input field can accept. Format: YYYY-MM-DD or YYYY-MM |
| `min` | `min` | — | `string` | _undefined_ | The minimum date that the date-input field can accept. Format: YYYY-MM-DD or YYYY-MM |
| `form` | `form` | — | `string` | _undefined_ | The ID of the form that the date-input field belongs to. |
| `validator` | `validator` | — | `Array< string \| ValidatorEntry \| Validator<string> >` | _undefined_ | Array of validators |
| `validateOn` | `validate-on` | — | `'blur' \| 'submit' \| 'other'` | `'blur'` | Set event to call validator |
| `validity` | `validity` | — | `ValidityState` | _undefined_ | Read-only property of the date-input, returns a ValidityState object that represents the validity states this element is in. |

## Slots

_None._

## Events

| Name | Payload | Description |
| ---- | ------- | ----------- |
| `gcdsFocus` | `void` | Emitted when a date-input has focus. |
| `gcdsBlur` | `void` | Emitted when a date-input loses focus. |
| `gcdsInput` | `string` | Emitted when the date-input has received input. Contains the new value in the event detail. |
| `gcdsChange` | `string` | Emitted when a date-input has changed. Contains the new value in the event detail. |
| `gcdsError` | `object` | Emitted when a date-input has a validation error. |
| `gcdsValid` | `object` | Emitted when a date-input has validated. |

## Methods

| Name | Signature | Description |
| ---- | --------- | ----------- |
| `validate` | `validate(): Promise<void>` | Call any active validators |
| `checkValidity` | `checkValidity(): Promise<boolean>` | Check the validity of gcds-date-input |
| `getValidationMessage` | `getValidationMessage(): Promise<string>` | Get validationMessage of gcds-date-input |

## Accessibility

- Uses native HTML semantics where possible — no custom ARIA required for the default case.
- `aria-*` attributes set on `<GcdsDateInput>` are forwarded to the inner native element (via `inheritAttributes` in the Stencil source).
- Focus: component-level focus is delegated through the shadow root where applicable.
- See [accessibility reference](../references/accessibility.md) for cross-cutting invariants.

## Usage (React)

```tsx
import { GcdsDateInput } from '@gcds-core/components-react';

<GcdsDateInput name="..." legend="..." format="full" />
```

## Bilingual

- Set `lang` on `<html>` (or a `[lang]` ancestor) and this component resolves it via `assignLanguage`. Any internal strings bundled in `packages/web/src/components/gcds-date-input/i18n/i18n.js` flip automatically.
- User-authored content (props, slot text) is your responsibility to translate.
- See [bilingual reference](../references/bilingual.md).

```tsx
<GcdsDateInput lang={locale} />
```

## Shadow DOM & styling

- Shadow: `{ delegatesFocus: true }`
- Source file: `packages/web/src/components/gcds-date-input/gcds-date-input.tsx`
- Style with GCDS tokens only ([foundations](../references/foundations.md)). Do not pierce the shadow root.

## Dependencies

_None declared._

## Related

- Input when you want someone to input only a year or only a day of the month.
- Select when you want someone to input only a month.
- Date picker when you want someone to choose a not-yet-known date, like for appointment scheduling.

## Notes from source

> A date input is a space to enter a known date.
