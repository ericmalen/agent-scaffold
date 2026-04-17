---
tag: gcds-breadcrumbs
package: "@gcds-core/components-react"
react-export: GcdsBreadcrumbs
stability: stable
docs-en: https://design-system.canada.ca/en/components/breadcrumbs/
docs-fr: https://design-system.canada.ca/fr/composants/chemin-de-navigation/
---

# GcdsBreadcrumbs (`gcds-breadcrumbs`)

Breadcrumbs is a path to the current page from each preceding level of the site's hierarchy.

## When to use

- Provide a linear way to move between multiple levels of a website.
- Surface part of the site's structure to help people understand where to find what they need.
- Situate the current page in relation to its parent in the site structure.
- Organize websites in a hierarchy of more than two levels.

## When NOT to use

_GCDS docs do not enumerate explicit 'when not to use' cases per component. See **Related** below for alternative components, and the [component catalog](../references/component-catalog.md) for the shape of adjacent options._

## Props

| Name | Attribute | Required | Type | Default | Description |
| ---- | --------- | -------- | ---- | ------- | ----------- |
| `hideCanadaLink` | `hide-canada-link` | — | `boolean` | `false` | Defines if the default canada.ca link is displayed or omitted. |

## Slots

| Name | Description |
| ---- | ----------- |
| `default` | Slot for the breadcrumb items. |

## Events

_None._

## Methods

_None._

## Accessibility

- Uses native HTML semantics where possible — no custom ARIA required for the default case.
- `aria-*` attributes set on `<GcdsBreadcrumbs>` are forwarded to the inner native element (via `inheritAttributes` in the Stencil source).
- Focus: component-level focus is delegated through the shadow root where applicable.
- See [accessibility reference](../references/accessibility.md) for cross-cutting invariants.

## Usage (React)

```tsx
import { GcdsBreadcrumbs } from '@gcds-core/components-react';

<GcdsBreadcrumbs>breadcrumbs</GcdsBreadcrumbs>
```

## Bilingual

- Set `lang` on `<html>` (or a `[lang]` ancestor) and this component resolves it via `assignLanguage`. Any internal strings bundled in `packages/web/src/components/gcds-breadcrumbs/i18n/i18n.js` flip automatically.
- User-authored content (props, slot text) is your responsibility to translate.
- See [bilingual reference](../references/bilingual.md).

```tsx
<GcdsBreadcrumbs lang={locale} />
```

## Shadow DOM & styling

- Shadow: `true`
- Source file: `packages/web/src/components/gcds-breadcrumbs/gcds-breadcrumbs.tsx`
- Style with GCDS tokens only ([foundations](../references/foundations.md)). Do not pierce the shadow root.

## Dependencies

_None declared._

## Related

- Footer for placing the Government of Canada branded footer landmark.
- Header for placing the Government of Canada branded header landmark.
- Top navigation for guiding navigation through a website using a landmark.

## Notes from source

> Breadcrumbs is a path to the current page from each preceding level of the site's hierarchy.
