---
tag: gcds-text
package: "@gcds-core/components-react"
react-export: GcdsText
stability: stable
docs-en: https://design-system.canada.ca/en/components/text/
docs-fr: https://design-system.canada.ca/fr/composants/texte/
---

# GcdsText (`gcds-text`)

Text is a styled and formatted paragraph that displays written content in an accessible way and matches Canada.

## When to use

- Convey information in small or large blocks of written content to provide essential details about a program or service without adding a high degree of structure or emphasis.
- Insert written content after a heading with a sentence, paragraph, or caption.
- Apply consistent font sizes, colour contrast, and white space that we've optimized for accessibility.
- Reinforce brand identity with consistent messaging styles and formats across web pages. For example, using GC Design System typography as a standard for consistent font style.
- Divide content into understandable sections with vertical and horizontal margins. Breaking up content supports readability, simplifies site navigation, and reduces task abandonment.

## When NOT to use

_GCDS docs do not enumerate explicit 'when not to use' cases per component. See **Related** below for alternative components, and the [component catalog](../references/component-catalog.md) for the shape of adjacent options._

## Props

| Name | Attribute | Required | Type | Default | Description |
| ---- | --------- | -------- | ---- | ------- | ----------- |
| `textRole` | `text-role` | — | `'light' \| 'primary' \| 'secondary'` | `'primary'` | Sets the main style of the text. |
| `characterLimit` | `character-limit` | — | `boolean` | `true` | Sets the line length to a maximum amount of characters per line to ensure a comfortable, accessible reading length. |
| `display` | `display` | — | `\| 'block' \| 'flex' \| 'inline' \| 'inline-block' \| 'inline-flex' \| 'none'` | `'block'` | Specifies the display behaviour of the text. |
| `marginTop` | `margin-top` | — | `SpacingValues` | `'0'` | Adds margin above the text. |
| `marginBottom` | `margin-bottom` | — | `SpacingValues` | `'300'` | Adds margin below the text. |
| `size` | `size` | — | `'body' \| 'small'` | `'body'` | Sets the appropriate HTML tags for the selected size. |

## Slots

| Name | Description |
| ---- | ----------- |
| `default` | Slot for the content of the text element. |

## Events

_None._

## Methods

_None._

## Accessibility

- Uses native HTML semantics where possible — no custom ARIA required for the default case.
- `aria-*` attributes set on `<GcdsText>` are forwarded to the inner native element (via `inheritAttributes` in the Stencil source).
- Focus: component-level focus is delegated through the shadow root where applicable.
- See [accessibility reference](../references/accessibility.md) for cross-cutting invariants.

## Usage (React)

```tsx
import { GcdsText } from '@gcds-core/components-react';

<GcdsText>text</GcdsText>
```

## Bilingual

- Set `lang` on `<html>` (or a `[lang]` ancestor) and this component resolves it via `assignLanguage`. Any internal strings bundled in `packages/web/src/components/gcds-text/i18n/i18n.js` flip automatically.
- User-authored content (props, slot text) is your responsibility to translate.
- See [bilingual reference](../references/bilingual.md).

```tsx
<GcdsText lang={locale} />
```

## Shadow DOM & styling

- Shadow: `true`
- Source file: `packages/web/src/components/gcds-text/gcds-text.tsx`
- Style with GCDS tokens only ([foundations](../references/foundations.md)). Do not pierce the shadow root.

## Dependencies

_None declared._

## Related

- Headings for structuring content by creating levels of hierarchy that organize page content visually and mentally, using GC Design System styles.
- Screenreader-only for information that is accessible for assistive technologies like screen readers, but invisible for sighted users.

## Notes from source

> Text is a styled and formatted paragraph that displays written content in an accessible way and matches Canada.ca typography styles.
