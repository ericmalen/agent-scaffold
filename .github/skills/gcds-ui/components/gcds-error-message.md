---
tag: gcds-error-message
package: "@gcds-core/components-react"
react-export: GcdsErrorMessage
stability: stable
docs-en: https://design-system.canada.ca/en/components/error-message/
docs-fr: https://design-system.canada.ca/fr/composants/message-derreur/
---

# GcdsErrorMessage (`gcds-error-message`)

An error message is a description of a problem blocking a user goal.

## When to use

_Docs page does not enumerate specific use cases — see upstream guidance._

## When NOT to use

_GCDS docs do not enumerate explicit 'when not to use' cases per component. See **Related** below for alternative components, and the [component catalog](../references/component-catalog.md) for the shape of adjacent options._

## Props

| Name | Attribute | Required | Type | Default | Description |
| ---- | --------- | -------- | ---- | ------- | ----------- |
| `messageId` | `message-id` | **yes** | `string` | _undefined_ | Id attribute for the error message. |

## Slots

| Name | Description |
| ---- | ----------- |
| `default` | Slot for the error message content. |

## Events

_None._

## Methods

_None._

## Accessibility

- Uses native HTML semantics where possible — no custom ARIA required for the default case.
- `aria-*` attributes set on `<GcdsErrorMessage>` are forwarded to the inner native element (via `inheritAttributes` in the Stencil source).
- Focus: component-level focus is delegated through the shadow root where applicable.
- See [accessibility reference](../references/accessibility.md) for cross-cutting invariants.

## Usage (React)

```tsx
import { GcdsErrorMessage } from '@gcds-core/components-react';

<GcdsErrorMessage messageId="...">error message</GcdsErrorMessage>
```

## Bilingual

- Set `lang` on `<html>` (or a `[lang]` ancestor) and this component resolves it via `assignLanguage`. Any internal strings bundled in `packages/web/src/components/gcds-error-message/i18n/i18n.js` flip automatically.
- User-authored content (props, slot text) is your responsibility to translate.
- See [bilingual reference](../references/bilingual.md).

```tsx
<GcdsErrorMessage lang={locale} />
```

## Shadow DOM & styling

- Shadow: `true`
- Source file: `packages/web/src/components/gcds-error-message/gcds-error-message.tsx`
- Style with GCDS tokens only ([foundations](../references/foundations.md)). Do not pierce the shadow root.

## Dependencies

_None declared._

## Related

- Error summary for listing all problems to address for response submission.
- Alert for communicating an important or time-sensitive change.

## Notes from source

> An error message is a description of a problem blocking a user goal.
