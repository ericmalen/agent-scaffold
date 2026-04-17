---
tag: gcds-error-summary
package: "@gcds-core/components-react"
react-export: GcdsErrorSummary
stability: stable
docs-en: https://design-system.canada.ca/en/components/error-summary/
docs-fr: https://design-system.canada.ca/fr/composants/resume-de-erreurs/
---

# GcdsErrorSummary (`gcds-error-summary`)

An error summary is a list of user errors in a form.

## When to use

_Docs page does not enumerate specific use cases — see upstream guidance._

## When NOT to use

_GCDS docs do not enumerate explicit 'when not to use' cases per component. See **Related** below for alternative components, and the [component catalog](../references/component-catalog.md) for the shape of adjacent options._

## Props

| Name | Attribute | Required | Type | Default | Description |
| ---- | --------- | -------- | ---- | ------- | ----------- |
| `heading` | `heading` | — | `string` | _undefined_ | Set error summary heading |
| `listen` | `listen` | — | `boolean` | `true` | Specifies if the error summary should listen for GcdsError event to generate error list. |
| `errorLinks` | `error-links` | — | `string \| object` | _undefined_ | Object of list items for error list. Format: { link-href: link-label } |

## Slots

_None._

## Events

| Name | Payload | Description |
| ---- | ------- | ----------- |
| `gcdsFocus` | `void` | Emitted when the link has focus. |
| `gcdsBlur` | `void` | Emitted when the link loses focus. |
| `gcdsClick` | `string` | Emitted when the link has been clicked. |

## Methods

_None._

## Accessibility

- Uses native HTML semantics where possible — no custom ARIA required for the default case.
- `aria-*` attributes set on `<GcdsErrorSummary>` are forwarded to the inner native element (via `inheritAttributes` in the Stencil source).
- Focus: component-level focus is delegated through the shadow root where applicable.
- See [accessibility reference](../references/accessibility.md) for cross-cutting invariants.

## Usage (React)

```tsx
import { GcdsErrorSummary } from '@gcds-core/components-react';

<GcdsErrorSummary />
```

## Bilingual

- Set `lang` on `<html>` (or a `[lang]` ancestor) and this component resolves it via `assignLanguage`. Any internal strings bundled in `packages/web/src/components/gcds-error-summary/i18n/i18n.js` flip automatically.
- User-authored content (props, slot text) is your responsibility to translate.
- See [bilingual reference](../references/bilingual.md).

```tsx
<GcdsErrorSummary lang={locale} />
```

## Shadow DOM & styling

- Shadow: `true`
- Source file: `packages/web/src/components/gcds-error-summary/gcds-error-summary.tsx`
- Style with GCDS tokens only ([foundations](../references/foundations.md)). Do not pierce the shadow root.

## Dependencies

_None declared._

## Related

- Error message for describing a problem blocking a user action, related to a single component.

## Notes from source

> An error summary is a list of user errors in a form.
