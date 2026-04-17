---
tag: gcds-link
package: "@gcds-core/components-react"
react-export: GcdsLink
stability: stable
docs-en: https://design-system.canada.ca/en/components/link/
docs-fr: https://design-system.canada.ca/fr/composants/lien/
---

# GcdsLink (`gcds-link`)

A link is a navigational element that brings a person to a new page, website, file, or section on the current page.

## When to use

- Allow a person to move fluidly between different pages or sections of a website or application.
- Direct people to external websites, clearly indicating when the link leads outside the current site.
- Let a person skip to a section heading using anchor links in a table of contents or page summary. They can then directly access specific sections or content without scrolling.
- Connect to email addresses or phone numbers, so a person can initiate communication directly by selecting the link.
- Start downloads for files, providing users with direct access to documents, media, or other downloadable content.
- Skip past navigational elements to get to main content.

## When NOT to use

_GCDS docs do not enumerate explicit 'when not to use' cases per component. See **Related** below for alternative components, and the [component catalog](../references/component-catalog.md) for the shape of adjacent options._

## Props

| Name | Attribute | Required | Type | Default | Description |
| ---- | --------- | -------- | ---- | ------- | ----------- |
| `linkRole` | `link-role` | — | `'default' \| 'light'` | `'default'` | Sets the main style of the link. |
| `size` | `size` | — | `'regular' \| 'small' \| 'inherit'` | `'inherit'` | Set the link size |
| `display` | `display` | — | `'block' \| 'inline'` | `'inline'` | Sets the display behavior of the link |
| `href` | `href` | **yes** | `string` | _undefined_ | The href attribute specifies the URL of the page the link goes to |
| `rel` | `rel` | — | `string \| undefined` | _undefined_ | The rel attribute specifies the relationship between the current document and the linked document |
| `target` | `target` | — | `string` | `'_self'` | The target attribute specifies where to open the linked document |
| `external` | `external` | — | `boolean` | `false` | Whether the link is external or not |
| `download` | `download` | — | `string \| undefined` | _undefined_ | The download attribute specifies that the target (the file specified in the href attribute) will be downloaded when a user clicks on the hyperlink |
| `type` | `type` | — | `string \| undefined` | _undefined_ | The type specifies the media type of the linked document |

## Slots

| Name | Description |
| ---- | ----------- |
| `default` | Slot for the link content. |

## Events

| Name | Payload | Description |
| ---- | ------- | ----------- |
| `gcdsFocus` | `void` | Emitted when the link has focus. |
| `gcdsBlur` | `void` | Emitted when the link loses focus. |
| `gcdsClick` | `string` | Emitted when the link has been clicked. Contains the href in the event detail. |

## Methods

_None._

## Accessibility

- Uses native HTML semantics where possible — no custom ARIA required for the default case.
- `aria-*` attributes set on `<GcdsLink>` are forwarded to the inner native element (via `inheritAttributes` in the Stencil source).
- Focus: component-level focus is delegated through the shadow root where applicable.
- See [accessibility reference](../references/accessibility.md) for cross-cutting invariants.

## Usage (React)

```tsx
import { GcdsLink } from '@gcds-core/components-react';

<GcdsLink href="...">link</GcdsLink>
```

## Bilingual

- Set `lang` on `<html>` (or a `[lang]` ancestor) and this component resolves it via `assignLanguage`. Any internal strings bundled in `packages/web/src/components/gcds-link/i18n/i18n.js` flip automatically.
- User-authored content (props, slot text) is your responsibility to translate.
- See [bilingual reference](../references/bilingual.md).

```tsx
<GcdsLink lang={locale} />
```

## Shadow DOM & styling

- Shadow: `true`
- Source file: `packages/web/src/components/gcds-link/gcds-link.tsx`
- Style with GCDS tokens only ([foundations](../references/foundations.md)). Do not pierce the shadow root.

## Dependencies

_None declared._

## Related

- Buttons to emphasize an action.
- Details to provide a way to hide or show a section of content.

## Notes from source

> A link is a navigational element that brings a person to a new page, website, file, or section on the current page.
