---
tag: gcds-alert
package: "@gcds-core/components-react"
react-export: GcdsAlert
stability: stable
docs-en: https://design-system.canada.ca/en/components/alert/
docs-fr: https://design-system.canada.ca/fr/composants/alerte/
---

# GcdsAlert (`gcds-alert`)

Alert displays an alert message with an optional heading, icon, and close button.

## When to use

_Docs page does not enumerate specific use cases — see upstream guidance._

## When NOT to use

_GCDS docs do not enumerate explicit 'when not to use' cases per component. See **Related** below for alternative components, and the [component catalog](../references/component-catalog.md) for the shape of adjacent options._

## Props

| Name | Attribute | Required | Type | Default | Description |
| ---- | --------- | -------- | ---- | ------- | ----------- |
| `alertRole` | `alert-role` | — | `'danger' \| 'info' \| 'success' \| 'warning'` | `'info'` | Defines alert role. |
| `container` | `container` | — | `'full' \| 'xl' \| 'lg' \| 'md' \| 'sm' \| 'xs'` | `'full'` | Defines the max width of the alert content. |
| `heading` | `heading` | **yes** | `string` | _undefined_ | Defines the alert heading. |
| `hideCloseBtn` | `hide-close-btn` | — | `boolean` | `false` | Defines if the alert's close button is displayed or not. |
| `hideRoleIcon` | `hide-role-icon` | — | `boolean` | `false` | Defines if the alert's role icon is displayed or not. |
| `isFixed` | `is-fixed` | — | `boolean` | `false` | Defines if the alert's position is fixed. |

## Slots

| Name | Description |
| ---- | ----------- |
| `default` | Slot for the main content of the alert. |

## Events

| Name | Payload | Description |
| ---- | ------- | ----------- |
| `gcdsDismiss` | `void` |  |

## Methods

_None._

## Accessibility

- Uses native HTML semantics where possible — no custom ARIA required for the default case.
- `aria-*` attributes set on `<GcdsAlert>` are forwarded to the inner native element (via `inheritAttributes` in the Stencil source).
- Focus: component-level focus is delegated through the shadow root where applicable.
- See [accessibility reference](../references/accessibility.md) for cross-cutting invariants.

## Usage (React)

```tsx
import { GcdsAlert } from '@gcds-core/components-react';

<GcdsAlert heading="...">alert</GcdsAlert>
```

## Bilingual

- Set `lang` on `<html>` (or a `[lang]` ancestor) and this component resolves it via `assignLanguage`. Any internal strings bundled in `packages/web/src/components/gcds-alert/i18n/i18n.js` flip automatically.
- User-authored content (props, slot text) is your responsibility to translate.
- See [bilingual reference](../references/bilingual.md).

```tsx
<GcdsAlert lang={locale} />
```

## Shadow DOM & styling

- Shadow: `true`
- Source file: `packages/web/src/components/gcds-alert/gcds-alert.tsx`
- Style with GCDS tokens only ([foundations](../references/foundations.md)). Do not pierce the shadow root.

## Dependencies

_None declared._

## Related

_Not documented._

## Notes from source

> Alert displays an alert message with an optional heading, icon, and close button.
