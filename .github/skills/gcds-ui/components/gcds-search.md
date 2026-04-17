---
tag: gcds-search
package: "@gcds-core/components-react"
react-export: GcdsSearch
stability: stable
docs-en: https://design-system.canada.ca/en/components/search/
docs-fr: https://design-system.canada.ca/fr/composants/recherche/
---

# GcdsSearch (`gcds-search`)

Search is a space for entering keywords to find relevant information.

## When to use

- Indexed on Canada.ca, across all Government of Canada content or at an institution or program level.
- From a subset of content you have locally indexed, using your own data set.

## When NOT to use

_GCDS docs do not enumerate explicit 'when not to use' cases per component. See **Related** below for alternative components, and the [component catalog](../references/component-catalog.md) for the shape of adjacent options._

## Props

| Name | Attribute | Required | Type | Default | Description |
| ---- | --------- | -------- | ---- | ------- | ----------- |
| `placeholder` | `placeholder` | — | `string` | `'Canada.ca'` | Set the placeholder and label for the search input. Becomes "Search [placeholder]" |
| `action` | `action` | — | `string` | `'/sr/srb.html'` | Sets the action for the search form. Default will be canada.ca global search |
| `method` | `method` | — | `'get' \| 'post'` | `'get'` | Set the form method of the search form |
| `name` | `name` | — | `string` | `'q'` | Set the name of the search input |
| `searchId` | `search-id` | — | `string` | `'search'` | Set the id of the search input |
| `value` | `value` | — | `string` | _undefined_ | Set the value of the search input |
| `suggested` | `suggested` | — | `string[] \| string` | _undefined_ | Set a list of predefined search terms |

## Slots

_None._

## Events

| Name | Payload | Description |
| ---- | ------- | ----------- |
| `gcdsInput` | `string` | Emitted when the search element has received input. |
| `gcdsChange` | `string` | Emitted when the search input value has changed. |
| `gcdsFocus` | `void` | Emitted when the search input has gained focus. |
| `gcdsBlur` | `void` | Emitted when the search input has lost focus. |
| `gcdsSubmit` | `string` | Emitted when the search form has submitted. |

## Methods

_None._

## Accessibility

- Uses native HTML semantics where possible — no custom ARIA required for the default case.
- `aria-*` attributes set on `<GcdsSearch>` are forwarded to the inner native element (via `inheritAttributes` in the Stencil source).
- Focus: component-level focus is delegated through the shadow root where applicable.
- See [accessibility reference](../references/accessibility.md) for cross-cutting invariants.

## Usage (React)

```tsx
import { GcdsSearch } from '@gcds-core/components-react';

<GcdsSearch />
```

## Bilingual

- Set `lang` on `<html>` (or a `[lang]` ancestor) and this component resolves it via `assignLanguage`. Any internal strings bundled in `packages/web/src/components/gcds-search/i18n/i18n.js` flip automatically.
- User-authored content (props, slot text) is your responsibility to translate.
- See [bilingual reference](../references/bilingual.md).

```tsx
<GcdsSearch lang={locale} />
```

## Shadow DOM & styling

- Shadow: `true`
- Source file: `packages/web/src/components/gcds-search/gcds-search.tsx`
- Style with GCDS tokens only ([foundations](../references/foundations.md)). Do not pierce the shadow root.

## Dependencies

_None declared._

## Related

- Header for placing the Government of Canada branded header landmark.
- Input for requesting a short written response from a person.

## Notes from source

> Search is a space for entering keywords to find relevant information.
