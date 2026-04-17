---
tag: gcds-breadcrumbs-item
package: "@gcds-core/components-react"
react-export: GcdsBreadcrumbsItem
stability: stable
docs-en: (no dedicated docs page — see parent component)
docs-fr: (no dedicated docs page — see parent component)
---

# GcdsBreadcrumbsItem (`gcds-breadcrumbs-item`)

Breadcrumbs item represents a single link in the breadcrumbs navigation.

## When to use

_This component has no dedicated docs page. It is used as a sub-component of its parent — see the Related section below for the parent component._

## When NOT to use

_GCDS docs do not enumerate explicit 'when not to use' cases per component. See **Related** below for alternative components, and the [component catalog](../references/component-catalog.md) for the shape of adjacent options._

## Props

| Name | Attribute | Required | Type | Default | Description |
| ---- | --------- | -------- | ---- | ------- | ----------- |
| `href` | `href` | **yes** | `string \| undefined` | _undefined_ | Specifies the href of the breadcrumb item. |

## Slots

| Name | Description |
| ---- | ----------- |
| `default` | Slot for the breadcrumb item link label. |

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
- `aria-*` attributes set on `<GcdsBreadcrumbsItem>` are forwarded to the inner native element (via `inheritAttributes` in the Stencil source).
- Focus: component-level focus is delegated through the shadow root where applicable.
- See [accessibility reference](../references/accessibility.md) for cross-cutting invariants.

## Usage (React)

```tsx
import { GcdsBreadcrumbsItem } from '@gcds-core/components-react';

<GcdsBreadcrumbsItem href="...">breadcrumbs item</GcdsBreadcrumbsItem>
```

## Bilingual

- Set `lang` on `<html>` (or a `[lang]` ancestor) and this component resolves it via `assignLanguage`. Any internal strings bundled in `packages/web/src/components/gcds-breadcrumbs-item/i18n/i18n.js` flip automatically.
- User-authored content (props, slot text) is your responsibility to translate.
- See [bilingual reference](../references/bilingual.md).

```tsx
<GcdsBreadcrumbsItem lang={locale} />
```

## Shadow DOM & styling

- Shadow: `true`
- Source file: `packages/web/src/components/gcds-breadcrumbs-item/gcds-breadcrumbs-item.tsx`
- Style with GCDS tokens only ([foundations](../references/foundations.md)). Do not pierce the shadow root.

## Dependencies

_None declared._

## Related

_Not documented._

## Notes from source

> Breadcrumbs item represents a single link in the breadcrumbs navigation.
