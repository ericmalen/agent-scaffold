---
tag: gcds-heading
package: "@gcds-core/components-react"
react-export: GcdsHeading
stability: stable
docs-en: https://design-system.canada.ca/en/components/heading/
docs-fr: https://design-system.canada.ca/fr/composants/titre/
---

# GcdsHeading (`gcds-heading`)

A heading is a title that establishes levels of hierarchy to organize page content into a structure and matches Canada.

## When to use

- Aid both sighted and non-sighted people to navigate page content with a clear and organized hierarchy.
- Allow assistive technologies to scan heading levels that signal or summarize the content they contain. A person can then choose what they want to read without reviewing the entire page.
- Introduce a page or emphasize key sections or topics, making it easier for a person to scan and locate relevant information.
- Divide lengthy content into manageable sections. Breaking up your content supports readability, simplifies site navigation, and reduces the risk of people abandoning their task.
- Apply consistent typography styles and sizes throughout a website to create a cohesive and user-friendly design.

## When NOT to use

_GCDS docs do not enumerate explicit 'when not to use' cases per component. See **Related** below for alternative components, and the [component catalog](../references/component-catalog.md) for the shape of adjacent options._

## Props

| Name | Attribute | Required | Type | Default | Description |
| ---- | --------- | -------- | ---- | ------- | ----------- |
| `tag` | `tag` | **yes** | `'h1' \| 'h2' \| 'h3' \| 'h4' \| 'h5' \| 'h6'` | _undefined_ | Sets the appropriate HTML tag for the selected level. |
| `headingRole` | `heading-role` | — | `'light' \| 'primary' \| 'secondary'` | `'primary'` | Sets the main style of the heading. |
| `characterLimit` | `character-limit` | — | `boolean` | `true` | Sets the line length to a maximum amount of characters per line for each heading level, ensuring a comfortable, accessible reading length. |
| `marginTop` | `margin-top` | — | `SpacingValues` | _undefined_ | Adds margin above the heading. The default margin-top for h1 is set to 0, while for h2 to h6 headings, it's 600. |
| `marginBottom` | `margin-bottom` | — | `SpacingValues` | `'300'` | Adds margin below the heading. The default margin-botttom is 300. |

## Slots

| Name | Description |
| ---- | ----------- |
| `default` | Slot for the heading content |

## Events

_None._

## Methods

_None._

## Accessibility

- Uses native HTML semantics where possible — no custom ARIA required for the default case.
- `aria-*` attributes set on `<GcdsHeading>` are forwarded to the inner native element (via `inheritAttributes` in the Stencil source).
- Focus: component-level focus is delegated through the shadow root where applicable.
- See [accessibility reference](../references/accessibility.md) for cross-cutting invariants.

## Usage (React)

```tsx
import { GcdsHeading } from '@gcds-core/components-react';

<GcdsHeading tag="h1">heading</GcdsHeading>
```

## Bilingual

- Set `lang` on `<html>` (or a `[lang]` ancestor) and this component resolves it via `assignLanguage`. Any internal strings bundled in `packages/web/src/components/gcds-heading/i18n/i18n.js` flip automatically.
- User-authored content (props, slot text) is your responsibility to translate.
- See [bilingual reference](../references/bilingual.md).

```tsx
<GcdsHeading lang={locale} />
```

## Shadow DOM & styling

- Shadow: `true`
- Source file: `packages/web/src/components/gcds-heading/gcds-heading.tsx`
- Style with GCDS tokens only ([foundations](../references/foundations.md)). Do not pierce the shadow root.

## Dependencies

_None declared._

## Related

- Text for paragraphs displaying non-heading content with matching GC Design System styles.
- Screenreader-only for information that's detectable with assistive technologies like screen readers, but invisible to sighted users.

## Notes from source

> A heading is a title that establishes levels of hierarchy to organize page content into a structure and matches Canada.ca typography styles.
