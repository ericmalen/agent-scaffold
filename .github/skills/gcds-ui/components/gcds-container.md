---
tag: gcds-container
package: "@gcds-core/components-react"
react-export: GcdsContainer
stability: stable
docs-en: https://design-system.canada.ca/en/components/container/
docs-fr: https://design-system.canada.ca/fr/composants/conteneur/
---

# GcdsContainer (`gcds-container`)

A container is a basic box layout with a set width for its contents.

## When to use

- Arrange content and components in a basic vertical layout using a wrapper.
- Limit the width of content in a given space within a site or product.
- Support readability and scannability by reducing the overall length of a line of text and presenting smaller chunks of content at a time.
- Centre content on a screen or within a viewport.

## When NOT to use

_GCDS docs do not enumerate explicit 'when not to use' cases per component. See **Related** below for alternative components, and the [component catalog](../references/component-catalog.md) for the shape of adjacent options._

## Props

| Name | Attribute | Required | Type | Default | Description |
| ---- | --------- | -------- | ---- | ------- | ----------- |
| `alignment` | `alignment` | — | `'start' \| 'center' \| 'end'` | _undefined_ | Defines the container's alignment. This property is ignored when `layout` is set to `page`, as the page layout has higher priority. |
| `border` | `border` | — | `boolean` | `false` | Defines if the container has a border. |
| `layout` | `layout` | — | `'full' \| 'page'` | _undefined_ | Controls how the container aligns with the page layout. When set to `page`, the container uses a max width of 1140px and switches to 90% width on smaller screens to scale consistently with core page layout components such as the header and footer. When set to `full`, the container spans the full width (100%) of its parent. |
| `margin` | `margin` | — | `SpacingValues` | _undefined_ | Container margin. Horizontal margins (left and right) are not applied if the container’s alignment property is defined, since alignment has higher priority. |
| `padding` | `padding` | — | `SpacingValues` | _undefined_ | Defines the container's padding. |
| `size` | `size` | — | `'full' \| 'xl' \| 'lg' \| 'md' \| 'sm' \| 'xs'` | `'full'` | Defines container size. |
| `tag` | `tag` | — | `string` | `'div'` | Set tag for container. |

## Slots

| Name | Description |
| ---- | ----------- |
| `default` | Slot for the main content of the container. |

## Events

_None._

## Methods

_None._

## Accessibility

- Uses native HTML semantics where possible — no custom ARIA required for the default case.
- `aria-*` attributes set on `<GcdsContainer>` are forwarded to the inner native element (via `inheritAttributes` in the Stencil source).
- Focus: component-level focus is delegated through the shadow root where applicable.
- See [accessibility reference](../references/accessibility.md) for cross-cutting invariants.

## Usage (React)

```tsx
import { GcdsContainer } from '@gcds-core/components-react';

<GcdsContainer>container</GcdsContainer>
```

## Bilingual

- Set `lang` on `<html>` (or a `[lang]` ancestor) and this component resolves it via `assignLanguage`. Any internal strings bundled in `packages/web/src/components/gcds-container/i18n/i18n.js` flip automatically.
- User-authored content (props, slot text) is your responsibility to translate.
- See [bilingual reference](../references/bilingual.md).

```tsx
<GcdsContainer lang={locale} />
```

## Shadow DOM & styling

- Shadow: `true`
- Source file: `packages/web/src/components/gcds-container/gcds-container.tsx`
- Style with GCDS tokens only ([foundations](../references/foundations.md)). Do not pierce the shadow root.

## Dependencies

_None declared._

## Related

- Grid for a responsive, flexible column layout to position elements on a page.
- Card for grouping small pieces of related information as a single unit.

## Notes from source

> A container is a basic box layout with a set width for its contents.
