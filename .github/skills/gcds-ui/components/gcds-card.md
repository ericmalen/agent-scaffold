---
tag: gcds-card
package: "@gcds-core/components-react"
react-export: GcdsCard
stability: stable
docs-en: https://design-system.canada.ca/en/components/card/
docs-fr: https://design-system.canada.ca/fr/composants/carte/
---

# GcdsCard (`gcds-card`)

A card is a box containing structured, actionable content on a single topic.

## When to use

- Group small pieces of related information as a unit.
- Present bite-sized previews and summaries of information with a means to obtain more details elsewhere.
- Support content discovery by creating more visual interest.

## When NOT to use

_GCDS docs do not enumerate explicit 'when not to use' cases per component. See **Related** below for alternative components, and the [component catalog](../references/component-catalog.md) for the shape of adjacent options._

## Props

| Name | Attribute | Required | Type | Default | Description |
| ---- | --------- | -------- | ---- | ------- | ----------- |
| `cardTitle` | `card-title` | **yes** | `string` | _undefined_ | The card title attribute specifies the title that appears on the card |
| `href` | `href` | **yes** | `string` | _undefined_ | The href attribute specifies the URL of the page the link goes to |
| `cardTitleTag` | `card-title-tag` | — | `'h3' \| 'h4' \| 'h5' \| 'h6'` | _undefined_ | The card title tag property specifies the HTML heading element for the title. This property does not modify the font size. It is used to assign the heading level in order to maintain heading hierarchy and accessibility for assistive technologies. |
| `description` | `description` | — | `string` | _undefined_ | The description attribute specifies the body of text that appears on the card |
| `badge` | `badge` | — | `string` | _undefined_ | The badge attribute specifies the badge text that appears in the top left corner of the card. 20 character limit. |
| `imgSrc` | `img-src` | — | `string` | _undefined_ | The img src attribute specifies the path to the image |
| `imgAlt` | `img-alt` | — | `string` | _undefined_ | The img alt attribute specifies the alt text for the image provided, if none, image will be decorative |
| `rel` | `rel` | — | `string \| undefined` | _undefined_ | The rel attribute specifies the relationship between the current document and the linked document |
| `target` | `target` | — | `string` | _undefined_ | The target attribute specifies where to open the linked document |

## Slots

| Name | Description |
| ---- | ----------- |
| `default` | Slot for the card description. Will overwrite the description prop if used. |

## Events

| Name | Payload | Description |
| ---- | ------- | ----------- |
| `gcdsFocus` | `void` | Emitted when the card has focus. |
| `gcdsBlur` | `void` | Emitted when the card loses focus. |
| `gcdsClick` | `string` | Emitted when the card has been clicked. Contains the href in the event detail. |

## Methods

_None._

## Accessibility

- Uses native HTML semantics where possible — no custom ARIA required for the default case.
- `aria-*` attributes set on `<GcdsCard>` are forwarded to the inner native element (via `inheritAttributes` in the Stencil source).
- Focus: component-level focus is delegated through the shadow root where applicable.
- See [accessibility reference](../references/accessibility.md) for cross-cutting invariants.

## Usage (React)

```tsx
import { GcdsCard } from '@gcds-core/components-react';

<GcdsCard cardTitle="..." href="...">card</GcdsCard>
```

## Bilingual

- Set `lang` on `<html>` (or a `[lang]` ancestor) and this component resolves it via `assignLanguage`. Any internal strings bundled in `packages/web/src/components/gcds-card/i18n/i18n.js` flip automatically.
- User-authored content (props, slot text) is your responsibility to translate.
- See [bilingual reference](../references/bilingual.md).

```tsx
<GcdsCard lang={locale} />
```

## Shadow DOM & styling

- Shadow: `true`
- Source file: `packages/web/src/components/gcds-card/gcds-card.tsx`
- Style with GCDS tokens only ([foundations](../references/foundations.md)). Do not pierce the shadow root.

## Dependencies

_None declared._

## Related

- Details to hide secondary information that a person can expand on the same page.
- Container for basic layouts with a set width.

## Notes from source

> A card is a box containing structured, actionable content on a single topic.
