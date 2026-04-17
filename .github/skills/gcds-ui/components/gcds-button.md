---
tag: gcds-button
package: "@gcds-core/components-react"
react-export: GcdsButton
stability: stable
docs-en: https://design-system.canada.ca/en/components/button/
docs-fr: https://design-system.canada.ca/fr/composants/bouton/
---

# GcdsButton (`gcds-button`)

The button is an interactive object that emphasizes an action.

## When to use

- Start a task or flow.
- Submit, save, or delete form data.
- Make a choice or give consent.
- Sign in to an account.
- Move forward or back in a sequence.

## When NOT to use

_GCDS docs do not enumerate explicit 'when not to use' cases per component. See **Related** below for alternative components, and the [component catalog](../references/component-catalog.md) for the shape of adjacent options._

## Props

| Name | Attribute | Required | Type | Default | Description |
| ---- | --------- | -------- | ---- | ------- | ----------- |
| `type` | `type` | — | `'submit' \| 'reset' \| 'button' \| 'link'` | `'button'` | Set button types |
| `buttonRole` | `button-role` | — | `\| 'start' \| 'primary' \| 'secondary' \| 'danger'` | `'primary'` | Set the main style |
| `size` | `size` | — | `'regular' \| 'small'` | `'regular'` | Set the button size |
| `buttonId` | `button-id` | — | `string` | _undefined_ | The buttonId attribute specifies the id for a <button> element. |
| `name` | `name` | — | `string \| undefined` | _undefined_ | The name attribute specifies the name for a <button> element. |
| `disabled` | `disabled` | — | `boolean` | _undefined_ | The disabled attribute for a <button> element. |
| `value` | `value` | — | `string` | _undefined_ | The value attribute specifies the value for a <button> element. |
| `href` | `href` | — | `string \| undefined` | _undefined_ | The href attribute specifies the URL of the page the link goes to |
| `rel` | `rel` | — | `string \| undefined` | _undefined_ | The rel attribute specifies the relationship between the current document and the linked document |
| `target` | `target` | — | `string \| undefined` | _undefined_ | The target attribute specifies where to open the linked document |
| `download` | `download` | — | `string \| undefined` | _undefined_ | The download attribute specifies that the target (the file specified in the href attribute) will be downloaded when a user clicks on the hyperlink |

## Slots

| Name | Description |
| ---- | ----------- |
| `default` | Slot for the button/link label. |

## Events

| Name | Payload | Description |
| ---- | ------- | ----------- |
| `gcdsClick` | `string \| void` | Emitted when the button has been clicked. Contains the value or href in the event detail. |
| `gcdsFocus` | `void` | Emitted when the button has focus. |
| `gcdsBlur` | `void` | Emitted when the button loses focus. |

## Methods

_None._

## Accessibility

- Uses native HTML semantics where possible — no custom ARIA required for the default case.
- `aria-*` attributes set on `<GcdsButton>` are forwarded to the inner native element (via `inheritAttributes` in the Stencil source).
- Focus: component-level focus is delegated through the shadow root where applicable.
- See [accessibility reference](../references/accessibility.md) for cross-cutting invariants.

## Usage (React)

```tsx
import { GcdsButton } from '@gcds-core/components-react';

<GcdsButton>button</GcdsButton>
```

## Bilingual

- Set `lang` on `<html>` (or a `[lang]` ancestor) and this component resolves it via `assignLanguage`. Any internal strings bundled in `packages/web/src/components/gcds-button/i18n/i18n.js` flip automatically.
- User-authored content (props, slot text) is your responsibility to translate.
- See [bilingual reference](../references/bilingual.md).

```tsx
<GcdsButton lang={locale} />
```

## Shadow DOM & styling

- Shadow: `{ delegatesFocus: true }`
- Source file: `packages/web/src/components/gcds-button/gcds-button.tsx`
- Style with GCDS tokens only ([foundations](../references/foundations.md)). Do not pierce the shadow root.

## Dependencies

_None declared._

## Related

- Links to navigate to a new page, website, file, or section on the current page.
- Details to hide or show a section of content.

## Notes from source

> The button is an interactive object that emphasizes an action.
