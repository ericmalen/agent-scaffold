---
tag: gcds-sr-only
package: "@gcds-core/components-react"
react-export: GcdsSrOnly
stability: stable
docs-en: https://design-system.canada.ca/en/components/screenreader-only/
docs-fr: https://design-system.canada.ca/fr/composants/masquage-accessible/
---

# GcdsSrOnly (`gcds-sr-only`)

The screenreader-only component is text information only accessible with assistive technologies.

## When to use

- Provide context to people using screen reader assistive technologies.
- Offer a text option to communicate information typically solely available by visual means.
- Communicate effectively without adding more text to the main content. This helps reduce cognitive load for everyone by only providing content when and where it’s needed.
- Improve the assistive tech experience when there are no other suitable options in semantic HTML.

## When NOT to use

_GCDS docs do not enumerate explicit 'when not to use' cases per component. See **Related** below for alternative components, and the [component catalog](../references/component-catalog.md) for the shape of adjacent options._

## Props

| Name | Attribute | Required | Type | Default | Description |
| ---- | --------- | -------- | ---- | ------- | ----------- |
| `tag` | `tag` | — | `\| 'h1' \| 'h2' \| 'h3' \| 'h4' \| 'h5' \| 'h6' \| 'p' \| 'span'` | `'p'` | Sets the appropriate HTML tag for the content. |

## Slots

| Name | Description |
| ---- | ----------- |
| `default` | Slot for the hidden accessible content. |

## Events

_None._

## Methods

_None._

## Accessibility

- Uses native HTML semantics where possible — no custom ARIA required for the default case.
- `aria-*` attributes set on `<GcdsSrOnly>` are forwarded to the inner native element (via `inheritAttributes` in the Stencil source).
- Focus: component-level focus is delegated through the shadow root where applicable.
- See [accessibility reference](../references/accessibility.md) for cross-cutting invariants.

## Usage (React)

```tsx
import { GcdsSrOnly } from '@gcds-core/components-react';

<GcdsSrOnly>sr only</GcdsSrOnly>
```

## Bilingual

- Set `lang` on `<html>` (or a `[lang]` ancestor) and this component resolves it via `assignLanguage`. Any internal strings bundled in `packages/web/src/components/gcds-sr-only/i18n/i18n.js` flip automatically.
- User-authored content (props, slot text) is your responsibility to translate.
- See [bilingual reference](../references/bilingual.md).

```tsx
<GcdsSrOnly lang={locale} />
```

## Shadow DOM & styling

- Shadow: `true`
- Source file: `packages/web/src/components/gcds-sr-only/gcds-sr-only.tsx`
- Style with GCDS tokens only ([foundations](../references/foundations.md)). Do not pierce the shadow root.

## Dependencies

_None declared._

## Related

- Headings for structuring content by creating levels of hierarchy that organize page content visually and mentally, using GC Design System styles.
- Text for paragraphs displaying non-heading content with matching GC Design System styles.

## Notes from source

> The screenreader-only component is text information only accessible with assistive technologies.
