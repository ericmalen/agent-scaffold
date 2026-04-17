---
tag: gcds-notice
package: "@gcds-core/components-react"
react-export: GcdsNotice
stability: stable
docs-en: https://design-system.canada.ca/en/components/notice/
docs-fr: https://design-system.canada.ca/fr/composants/avis/
---

# GcdsNotice (`gcds-notice`)

The notice is a short, prominent message that’s part of the page content.

## When to use

- Communicate updates, warnings, and confirmations about the tasks on a page or about an activity or event that could affect people using the service.
- Make key messages stand out within page content, through sparing use.
- Provide context or additional information on the page content for better understanding.

## When NOT to use

_GCDS docs do not enumerate explicit 'when not to use' cases per component. See **Related** below for alternative components, and the [component catalog](../references/component-catalog.md) for the shape of adjacent options._

## Props

| Name | Attribute | Required | Type | Default | Description |
| ---- | --------- | -------- | ---- | ------- | ----------- |
| `noticeRole` | `notice-role` | **yes** | `'danger' \| 'info' \| 'success' \| 'warning'` | _undefined_ | The notice role property specifies the style of notice to be displayed. |
| `noticeTitle` | `notice-title` | **yes** | `string` | _undefined_ | Set the notice title. |
| `noticeTitleTag` | `notice-title-tag` | **yes** | `'h2' \| 'h3' \| 'h4' \| 'h5'` | _undefined_ | The notice title tag property specifies the HTML heading element for the title. This property does not modify the font size. It is used to assign the heading level in order to maintain heading hierarchy and accessibility for assistive technologies. |

## Slots

| Name | Description |
| ---- | ----------- |
| `default` | Slot for the main content of the notice. |

## Events

_None._

## Methods

_None._

## Accessibility

- Uses native HTML semantics where possible — no custom ARIA required for the default case.
- `aria-*` attributes set on `<GcdsNotice>` are forwarded to the inner native element (via `inheritAttributes` in the Stencil source).
- Focus: component-level focus is delegated through the shadow root where applicable.
- See [accessibility reference](../references/accessibility.md) for cross-cutting invariants.

## Usage (React)

```tsx
import { GcdsNotice } from '@gcds-core/components-react';

<GcdsNotice noticeRole="danger" noticeTitle="..." noticeTitleTag="h2">notice</GcdsNotice>
```

## Bilingual

- Set `lang` on `<html>` (or a `[lang]` ancestor) and this component resolves it via `assignLanguage`. Any internal strings bundled in `packages/web/src/components/gcds-notice/i18n/i18n.js` flip automatically.
- User-authored content (props, slot text) is your responsibility to translate.
- See [bilingual reference](../references/bilingual.md).

```tsx
<GcdsNotice lang={locale} />
```

## Shadow DOM & styling

- Shadow: `true`
- Source file: `packages/web/src/components/gcds-notice/gcds-notice.tsx`
- Style with GCDS tokens only ([foundations](../references/foundations.md)). Do not pierce the shadow root.

## Dependencies

_None declared._

## Related

- Error message or error summary for errors in a form field, on a page, or in a flow.
- Banner for a message that applies to part of or the entire site or product.

## Notes from source

> The notice is a short, prominent message that’s part of the page content.
