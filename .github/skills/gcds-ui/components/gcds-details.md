---
tag: gcds-details
package: "@gcds-core/components-react"
react-export: GcdsDetails
stability: stable
docs-en: https://design-system.canada.ca/en/components/details/
docs-fr: https://design-system.canada.ca/fr/composants/details/
---

# GcdsDetails (`gcds-details`)

Details is an interactive switch for a person to expand or collapse content.

## When to use

- Reduce page size and scrolling when the content is lengthy and not essential to read in full. For example in an address collection pattern, the shipping address may be hidden using a details when it's the same as the mailing or billing address.
- Give a summary of content that is secondary to the main task and may be overwhelming to some readers.
- Make a page with many subheadings scanable. For example, in a series of questions and answers, you can list the questions as details titles and a person can expand any section to read the answer content.
- Give readers the option to control content for subjects that may cause distress to some readers. They can access certain content when they are ready and hide content once they've reviewed it.

## When NOT to use

_GCDS docs do not enumerate explicit 'when not to use' cases per component. See **Related** below for alternative components, and the [component catalog](../references/component-catalog.md) for the shape of adjacent options._

## Props

| Name | Attribute | Required | Type | Default | Description |
| ---- | --------- | -------- | ---- | ------- | ----------- |
| `detailsTitle` | `details-title` | **yes** | `string` | _undefined_ | The details title summarizes the panel content. |
| `open` | `open` | — | `boolean` | `false` | Defines if the details panel is open by default or not. |

## Slots

| Name | Description |
| ---- | ----------- |
| `default` | Slot for the main content of the details panel. |

## Events

| Name | Payload | Description |
| ---- | ------- | ----------- |
| `gcdsFocus` | `void` | Emitted when the details has focus. |
| `gcdsBlur` | `void` | Emitted when the details loses focus. |
| `gcdsClick` | `void` | Emitted when the details has been clicked. |

## Methods

| Name | Signature | Description |
| ---- | --------- | ----------- |
| `toggle` | `toggle(): Promise<void>` | Methods |

## Accessibility

- Uses native HTML semantics where possible — no custom ARIA required for the default case.
- `aria-*` attributes set on `<GcdsDetails>` are forwarded to the inner native element (via `inheritAttributes` in the Stencil source).
- Focus: component-level focus is delegated through the shadow root where applicable.
- See [accessibility reference](../references/accessibility.md) for cross-cutting invariants.

## Usage (React)

```tsx
import { GcdsDetails } from '@gcds-core/components-react';

<GcdsDetails detailsTitle="...">details</GcdsDetails>
```

## Bilingual

- Set `lang` on `<html>` (or a `[lang]` ancestor) and this component resolves it via `assignLanguage`. Any internal strings bundled in `packages/web/src/components/gcds-details/i18n/i18n.js` flip automatically.
- User-authored content (props, slot text) is your responsibility to translate.
- See [bilingual reference](../references/bilingual.md).

```tsx
<GcdsDetails lang={locale} />
```

## Shadow DOM & styling

- Shadow: `true`
- Source file: `packages/web/src/components/gcds-details/gcds-details.tsx`
- Style with GCDS tokens only ([foundations](../references/foundations.md)). Do not pierce the shadow root.

## Dependencies

_None declared._

## Related

- Tabs when you want to replace the entire content of a section or a page.
- Links to provide navigation to a new page, website, or section on the current page or files for download.
- Buttons when a person modifies data, changes a state, or initiates a specific action.

## Notes from source

> Details is an interactive switch for a person to expand or collapse content.
