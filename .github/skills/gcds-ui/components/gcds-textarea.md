---
tag: gcds-textarea
package: "@gcds-core/components-react"
react-export: GcdsTextarea
stability: stable
docs-en: https://design-system.canada.ca/en/components/textarea/
docs-fr: https://design-system.canada.ca/fr/composants/zone-de-texte/
---

# GcdsTextarea (`gcds-textarea`)

A text area is a space to enter long-form information in response to a question or instruction.

## When to use

- An individual or unique response.
- To provide space for a long, freeform response.

## When NOT to use

_GCDS docs do not enumerate explicit 'when not to use' cases per component. See **Related** below for alternative components, and the [component catalog](../references/component-catalog.md) for the shape of adjacent options._

## Props

| Name | Attribute | Required | Type | Default | Description |
| ---- | --------- | -------- | ---- | ------- | ----------- |
| `autofocus` | `autofocus` | — | `boolean` | _undefined_ | If true, the textarea will be focused on component render. |
| `form` | `form` | — | `string` | _undefined_ | The ID of the form that the textarea belongs to. |
| `hideLimit` | `hide-limit` | — | `boolean` | `false` | If true, character limit counter will not be displayed under the textarea. |
| `maxlength` | `maxlength` | — | `number` | _undefined_ | The maximum number of characters that the textarea field can accept. |
| `minlength` | `minlength` | — | `number` | _undefined_ | The minimum number of characters that the textarea field can accept. |
| `cols` | `cols` | — | `number` | _undefined_ | Defines width for textarea cols (the min-width for textarea's is 50%). |
| `disabled` | `disabled` | — | `boolean` | `false` | Specifies if a textarea element is disabled or not. |
| `errorMessage` | `error-message` | — | `string` | _undefined_ | Error message for an invalid textarea element. |
| `hideLabel` | `hide-label` | — | `boolean` | `false` | Specifies if the label is hidden or not. |
| `hint` | `hint` | — | `string` | _undefined_ | Hint displayed below the label and above the textarea field. |
| `label` | `label` | **yes** | `string` | _undefined_ | Form field label |
| `name` | `name` | **yes** | `string` | _undefined_ | Name attribute for a textarea element. |
| `required` | `required` | — | `boolean` | `false` | Specifies if a form field is required or not. |
| `rows` | `rows` | — | `number` | `5` | Default value for textarea rows. |
| `textareaId` | `textarea-id` | **yes** | `string` | _undefined_ | Id attribute for a textarea element. |
| `value` | `value` | — | `string` | _undefined_ | Default value for an input element. |
| `validator` | `validator` | — | `Array< string \| ValidatorEntry \| Validator<string> >` | _undefined_ | Array of validators |
| `validateOn` | `validate-on` | — | `'blur' \| 'submit' \| 'other'` | `'blur'` | Set event to call validator |
| `validity` | `validity` | — | `ValidityState` | _undefined_ | Read-only property of the textarea, returns a ValidityState object that represents the validity states this element is in. |

## Slots

_None._

## Events

| Name | Payload | Description |
| ---- | ------- | ----------- |
| `gcdsFocus` | `void` | Emitted when the textarea has focus. |
| `gcdsBlur` | `void` | Emitted when the textarea loses focus. |
| `gcdsChange` | `string` | Emitted when the textarea has changed. |
| `gcdsInput` | `string` | Emitted when the textarea has received input. |
| `gcdsError` | `object` | Emitted when the textarea has a validation error. |
| `gcdsValid` | `object` | Emitted when the textarea has a validation error. |

## Methods

| Name | Signature | Description |
| ---- | --------- | ----------- |
| `validate` | `validate(): Promise<void>` | Call any active validators |
| `checkValidity` | `checkValidity(): Promise<boolean>` | Check the validity of gcds-textarea |
| `getValidationMessage` | `getValidationMessage(): Promise<string>` | Get validationMessage of gcds-textarea |

## Accessibility

- Uses native HTML semantics where possible — no custom ARIA required for the default case.
- `aria-*` attributes set on `<GcdsTextarea>` are forwarded to the inner native element (via `inheritAttributes` in the Stencil source).
- Focus: component-level focus is delegated through the shadow root where applicable.
- See [accessibility reference](../references/accessibility.md) for cross-cutting invariants.

## Usage (React)

```tsx
import { GcdsTextarea } from '@gcds-core/components-react';

<GcdsTextarea label="..." name="..." textareaId="..." />
```

## Bilingual

- Set `lang` on `<html>` (or a `[lang]` ancestor) and this component resolves it via `assignLanguage`. Any internal strings bundled in `packages/web/src/components/gcds-textarea/i18n/i18n.js` flip automatically.
- User-authored content (props, slot text) is your responsibility to translate.
- See [bilingual reference](../references/bilingual.md).

```tsx
<GcdsTextarea lang={locale} />
```

## Shadow DOM & styling

- Shadow: `{ delegatesFocus: true }`
- Source file: `packages/web/src/components/gcds-textarea/gcds-textarea.tsx`
- Style with GCDS tokens only ([foundations](../references/foundations.md)). Do not pierce the shadow root.

## Dependencies

_None declared._

## Related

- Input for short, single-line responses.

## Notes from source

> A text area is a space to enter long-form information in response to a question or instruction.
