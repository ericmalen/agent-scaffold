---
tag: gcds-select
package: "@gcds-core/components-react"
react-export: GcdsSelect
stability: stable
docs-en: https://design-system.canada.ca/en/components/select/
docs-fr: https://design-system.canada.ca/fr/composants/selection/
---

# GcdsSelect (`gcds-select`)

A select provides a large list of options for single selection.

## When to use

- Specify more than 7 possible answers in a predefined scrollable list.
- Limit the number of possible answers to a question.
- Give a person the ability to answer without writing, by selecting one item from a list.

## When NOT to use

_GCDS docs do not enumerate explicit 'when not to use' cases per component. See **Related** below for alternative components, and the [component catalog](../references/component-catalog.md) for the shape of adjacent options._

## Props

| Name | Attribute | Required | Type | Default | Description |
| ---- | --------- | -------- | ---- | ------- | ----------- |
| `selectId` | `select-id` | **yes** | `string` | _undefined_ | Id attribute for a select element. |
| `label` | `label` | **yes** | `string` | _undefined_ | Form field label. |
| `hideLabel` | `hide-label` | — | `boolean` | `false` | Specifies if the label is hidden or not. |
| `name` | `name` | **yes** | `string` | _undefined_ | Name attribute for select form element. |
| `required` | `required` | — | `boolean` | `false` | Specifies if a form field is required or not. |
| `disabled` | `disabled` | — | `boolean` | `false` | Specifies if a select element is disabled or not. |
| `defaultValue` | `default-value` | — | `string` | _undefined_ | The default value is an optional value that gets displayed before the user selects an option. |
| `autofocus` | `autofocus` | — | `boolean` | _undefined_ | If true, the select will be focused on component render |
| `form` | `form` | — | `string` | _undefined_ | The ID of the form that the select field belongs to. |
| `autocomplete` | `autocomplete` | — | `string` | _undefined_ | String to have autocomplete enabled. |
| `value` | `value` | — | `string` | _undefined_ | Value for a select element. |
| `errorMessage` | `error-message` | — | `string` | _undefined_ | Error message for an invalid select element. |
| `hint` | `hint` | — | `string` | _undefined_ | Hint displayed below the label. |
| `validator` | `validator` | — | `Array< string \| ValidatorEntry \| Validator<string> >` | _undefined_ | Array of validators |
| `validateOn` | `validate-on` | — | `'blur' \| 'submit' \| 'other'` | `'blur'` | Set event to call validator |
| `validity` | `validity` | — | `ValidityState` | _undefined_ | Read-only property of the select, returns a ValidityState object that represents the validity states this element is in. |

## Slots

| Name | Description |
| ---- | ----------- |
| `default` | Slot for options and option groups. |

## Events

| Name | Payload | Description |
| ---- | ------- | ----------- |
| `gcdsChange` | `string` | Emitted when the select value has changed. |
| `gcdsInput` | `string` | Emitted when the select has received input. |
| `gcdsFocus` | `void` | Emitted when the select has focus. |
| `gcdsBlur` | `void` | Emitted when the select loses focus. |
| `gcdsError` | `object` | Emitted when the select has a validation error. |
| `gcdsValid` | `object` | Emitted when the select has a validation error. |

## Methods

| Name | Signature | Description |
| ---- | --------- | ----------- |
| `validate` | `validate(): Promise<void>` | Call any active validators |
| `checkValidity` | `checkValidity(): Promise<boolean>` | Check the validity of gcds-select |
| `getValidationMessage` | `getValidationMessage(): Promise<string>` | Get validationMessage of gcds-select |

## Accessibility

- Uses native HTML semantics where possible — no custom ARIA required for the default case.
- `aria-*` attributes set on `<GcdsSelect>` are forwarded to the inner native element (via `inheritAttributes` in the Stencil source).
- Focus: component-level focus is delegated through the shadow root where applicable.
- See [accessibility reference](../references/accessibility.md) for cross-cutting invariants.

## Usage (React)

```tsx
import { GcdsSelect } from '@gcds-core/components-react';

<GcdsSelect selectId="..." label="..." name="...">select</GcdsSelect>
```

## Bilingual

- Set `lang` on `<html>` (or a `[lang]` ancestor) and this component resolves it via `assignLanguage`. Any internal strings bundled in `packages/web/src/components/gcds-select/i18n/i18n.js` flip automatically.
- User-authored content (props, slot text) is your responsibility to translate.
- See [bilingual reference](../references/bilingual.md).

```tsx
<GcdsSelect lang={locale} />
```

## Shadow DOM & styling

- Shadow: `{ delegatesFocus: true }`
- Source file: `packages/web/src/components/gcds-select/gcds-select.tsx`
- Style with GCDS tokens only ([foundations](../references/foundations.md)). Do not pierce the shadow root.

## Dependencies

_None declared._

## Related

- Checkboxes when you are expecting the user to select 1 or more options from a list of items.
- Radios when you can give someone a small set of options for a known single selection with less than 7 options.

## Notes from source

> A select provides a large list of options for single selection.
