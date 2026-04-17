---
tag: gcds-file-uploader
package: "@gcds-core/components-react"
react-export: GcdsFileUploader
stability: stable
docs-en: https://design-system.canada.ca/en/components/file-uploader/
docs-fr: https://design-system.canada.ca/fr/composants/televerseur-de-fichiers/
---

# GcdsFileUploader (`gcds-file-uploader`)

A file uploader is a space to select and add supporting documentation.

## When to use

_Docs page does not enumerate specific use cases — see upstream guidance._

## When NOT to use

_GCDS docs do not enumerate explicit 'when not to use' cases per component. See **Related** below for alternative components, and the [component catalog](../references/component-catalog.md) for the shape of adjacent options._

## Props

| Name | Attribute | Required | Type | Default | Description |
| ---- | --------- | -------- | ---- | ------- | ----------- |
| `uploaderId` | `uploader-id` | **yes** | `string` | _undefined_ | Id attribute for a file uploader element. |
| `name` | `name` | **yes** | `string` | _undefined_ | Name attribute for file input element. |
| `label` | `label` | **yes** | `string` | _undefined_ | Form field label. |
| `hideLabel` | `hide-label` | — | `boolean` | `false` | Specifies if the label is hidden or not. |
| `required` | `required` | — | `boolean` | `false` | Specifies if a form field is required or not. |
| `disabled` | `disabled` | — | `boolean` | `false` | Specifies if a file uploader element is disabled or not. |
| `value` | `value` | — | `string[]` | `[]` | Value for a file uploader element. |
| `accept` | `accept` | — | `string` | _undefined_ | Defines the file types the file uploader accepts. |
| `multiple` | `multiple` | — | `boolean` | _undefined_ | Boolean that specifies if the user is allowed to select more than one file. |
| `files` | `files` | — | `FileList` | _undefined_ | FileList of uploaded files to input |
| `errorMessage` | `error-message` | — | `string` | _undefined_ | Error message for an invalid file uploader element. |
| `hint` | `hint` | — | `string` | _undefined_ | Hint displayed below the label. |
| `validator` | `validator` | — | `Array< string \| ValidatorEntry \| Validator<string \| number \| FileList> >` | _undefined_ | Array of validators |
| `validateOn` | `validate-on` | — | `'blur' \| 'submit' \| 'other'` | `'blur'` | Set event to call validator |
| `autofocus` | `autofocus` | — | `boolean` | _undefined_ | If true, the file uploader will be focused on component render |
| `form` | `form` | — | `string` | _undefined_ | The ID of the form that the file uploader field belongs to. |
| `validity` | `validity` | — | `ValidityState` | _undefined_ | Read-only property of the file uploader, returns a ValidityState object that represents the validity states this element is in. |

## Slots

_None._

## Events

| Name | Payload | Description |
| ---- | ------- | ----------- |
| `gcdsFocus` | `void` | Emitted when the uploader has focus. |
| `gcdsBlur` | `void` | Emitted when the uploader loses focus. |
| `gcdsChange` | `string[]` | Emitted when the user has made a file selection. Contains the new value in the event detail. |
| `gcdsInput` | `string[]` | Emitted when the user has uploaded a file. Contains the new value in the event detail. |
| `gcdsRemoveFile` | `unknown` | Remove file and update value. |
| `gcdsError` | `object` | Emitted when the uploader has a validation error. |
| `gcdsValid` | `object` | Emitted when the uploader has a validation error. |

## Methods

| Name | Signature | Description |
| ---- | --------- | ----------- |
| `validate` | `validate(): Promise<void>` | Call any active validators |
| `checkValidity` | `checkValidity(): Promise<boolean>` | Check the validity of gcds-file-uploader |
| `getValidationMessage` | `getValidationMessage(): Promise<string>` | Get validationMessage of gcds-file-uploader |

## Accessibility

- Uses native HTML semantics where possible — no custom ARIA required for the default case.
- `aria-*` attributes set on `<GcdsFileUploader>` are forwarded to the inner native element (via `inheritAttributes` in the Stencil source).
- Focus: component-level focus is delegated through the shadow root where applicable.
- See [accessibility reference](../references/accessibility.md) for cross-cutting invariants.

## Usage (React)

```tsx
import { GcdsFileUploader } from '@gcds-core/components-react';

<GcdsFileUploader uploaderId="..." name="..." label="..." />
```

## Bilingual

- Set `lang` on `<html>` (or a `[lang]` ancestor) and this component resolves it via `assignLanguage`. Any internal strings bundled in `packages/web/src/components/gcds-file-uploader/i18n/i18n.js` flip automatically.
- User-authored content (props, slot text) is your responsibility to translate.
- See [bilingual reference](../references/bilingual.md).

```tsx
<GcdsFileUploader lang={locale} />
```

## Shadow DOM & styling

- Shadow: `{ delegatesFocus: true }`
- Source file: `packages/web/src/components/gcds-file-uploader/gcds-file-uploader.tsx`
- Style with GCDS tokens only ([foundations](../references/foundations.md)). Do not pierce the shadow root.

## Dependencies

_None declared._

## Related

- Textareas for multi-line freeform responses.
- Buttons when you want to take a person to another page to access additional content or move to the next step in a task.

## Notes from source

> A file uploader is a space to select and add supporting documentation.
