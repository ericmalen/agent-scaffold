---
tag: gcds-grid
package: "@gcds-core/components-react"
react-export: GcdsGrid
stability: stable
docs-en: https://design-system.canada.ca/en/components/grid/
docs-fr: https://design-system.canada.ca/fr/composants/grille/
---

# GcdsGrid (`gcds-grid`)

A grid is a responsive, flexible column layout to position elements on a page.

## When to use

- Apply a flexible column layout that scales to the screen size (viewport) of the user's device.
- Guide focus by defining the width of a column and the spacing between columns.
- Create complex layouts with control over the sizing of each column.
- Accommodate different screen sizes by setting a custom, optimized layout for different viewports, like mobile, tablet, and desktop.
- Limit the width of content displayed to ensure lines wrap and are more readable.

## When NOT to use

_GCDS docs do not enumerate explicit 'when not to use' cases per component. See **Related** below for alternative components, and the [component catalog](../references/component-catalog.md) for the shape of adjacent options._

## Props

| Name | Attribute | Required | Type | Default | Description |
| ---- | --------- | -------- | ---- | ------- | ----------- |
| `columns` | `columns` | — | `string` | _undefined_ | Defines the default number of grid columns for all viewports if columns-tablet and columns-desktop are not defined. Option to set different layouts for desktop with columns-desktop and for tablet with columns-tablet. |
| `columnsTablet` | `columns-tablet` | — | `string` | _undefined_ | Provides option to set a different number of grid columns for tablet screens. If columns-desktop is not defined, columns-tablet will be used to define the number of columns for desktop as well. |
| `columnsDesktop` | `columns-desktop` | — | `string` | _undefined_ | Provides option to set a different number of grid columns for desktop screens. |
| `container` | `container` | — | `'full' \| 'xl' \| 'lg' \| 'md' \| 'sm' \| 'xs'` | _undefined_ | Defines grid container size |
| `display` | `display` | — | `'grid' \| 'inline-grid'` | `'grid'` | Defines element as grid or inline-grid container |
| `equalRowHeight` | `equal-row-height` | — | `boolean` | `false` | Sets all grid items to have an equal height, based on the tallest item. |
| `gap` | `gap` | — | `GridGapValues` | `'300'` | Defines the horizontal and vertical spacing between items in a grid container for all viewports if gap-tablet and gap-desktop are not defined. Option to set different spacing for desktop with gap-desktop and for tablet with gap-tablet. |
| `gapTablet` | `gap-tablet` | — | `GridGapValues` | _undefined_ | Provides option to set horizontal and vertical spacing between items in a grid container for tablet screens. If gap-desktop is not defined, gap-tablet will be used to define the spacing for desktop screens as well. |
| `gapDesktop` | `gap-desktop` | — | `GridGapValues` | _undefined_ | Provides option to set horizontal and vertical spacing between items in a grid container for desktop screens. |
| `tag` | `tag` | — | `\| 'article' \| 'aside' \| 'div' \| 'dl' \| 'main' \| 'nav' \| 'ol' \| 'section' \| 'ul'` | `'div'` | Set tag for grid container |
| `alignment` | `alignment` | — | `'start' \| 'center' \| 'end'` | _undefined_ | Defines the grid's alignment if the grid containers size is smaller than the parent's size. |
| `alignContent` | `align-content` | — | `ContentValues` | _undefined_ | If total grid size is less than the size of its grid container, this property aligns the grid along the block (column) axis |
| `justifyContent` | `justify-content` | — | `ContentValues` | _undefined_ | If total grid size is less than the size of its grid container, this property aligns the grid along the inline (row) axis |
| `placeContent` | `place-content` | — | `ContentValues` | _undefined_ | Sets both the align-content + justify-content properties |
| `alignItems` | `align-items` | — | `'baseline' \| 'center' \| 'end' \| 'start' \| 'stretch'` | _undefined_ | Aligns grid items along the block (column) axis |
| `justifyItems` | `justify-items` | — | `'center' \| 'end' \| 'start' \| 'stretch'` | _undefined_ | Aligns grid items along the inline (row) axis |
| `placeItems` | `place-items` | — | `'center' \| 'end' \| 'start' \| 'stretch'` | _undefined_ | Sets both the align-items + justify-items properties |

## Slots

| Name | Description |
| ---- | ----------- |
| `default` | Slot for the main content of the grid. |

## Events

_None._

## Methods

_None._

## Accessibility

- Uses native HTML semantics where possible — no custom ARIA required for the default case.
- `aria-*` attributes set on `<GcdsGrid>` are forwarded to the inner native element (via `inheritAttributes` in the Stencil source).
- Focus: component-level focus is delegated through the shadow root where applicable.
- See [accessibility reference](../references/accessibility.md) for cross-cutting invariants.

## Usage (React)

```tsx
import { GcdsGrid } from '@gcds-core/components-react';

<GcdsGrid>grid</GcdsGrid>
```

## Bilingual

- Set `lang` on `<html>` (or a `[lang]` ancestor) and this component resolves it via `assignLanguage`. Any internal strings bundled in `packages/web/src/components/gcds-grid/i18n/i18n.js` flip automatically.
- User-authored content (props, slot text) is your responsibility to translate.
- See [bilingual reference](../references/bilingual.md).

```tsx
<GcdsGrid lang={locale} />
```

## Shadow DOM & styling

- Shadow: `true`
- Source file: `packages/web/src/components/gcds-grid/gcds-grid.tsx`
- Style with GCDS tokens only ([foundations](../references/foundations.md)). Do not pierce the shadow root.

## Dependencies

_None declared._

## Related

- Container for applying a basic, single column layout across all viewports.
- Card for structuring actionable content in a group on a single topic.

## Notes from source

> A grid is a responsive, flexible column layout to position elements on a page.
