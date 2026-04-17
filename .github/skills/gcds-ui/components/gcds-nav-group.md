---
tag: gcds-nav-group
package: "@gcds-core/components-react"
react-export: GcdsNavGroup
stability: stable
docs-en: (no dedicated docs page — see parent component)
docs-fr: (no dedicated docs page — see parent component)
---

# GcdsNavGroup (`gcds-nav-group`)

Navigational group with expandable or dropdown functionality, allowing for better organization of navigation links.

## When to use

_This component has no dedicated docs page. It is used as a sub-component of its parent — see the Related section below for the parent component._

## When NOT to use

_GCDS docs do not enumerate explicit 'when not to use' cases per component. See **Related** below for alternative components, and the [component catalog](../references/component-catalog.md) for the shape of adjacent options._

## Props

| Name | Attribute | Required | Type | Default | Description |
| ---- | --------- | -------- | ---- | ------- | ----------- |
| `closeTrigger` | `close-trigger` | — | `string` | _undefined_ | Label for the expanded button trigger |
| `menuLabel` | `menu-label` | **yes** | `string` | _undefined_ | Label for the nav group menu |
| `openTrigger` | `open-trigger` | **yes** | `string` | _undefined_ | Label for the collapsed button trigger |
| `open` | `open` | — | `boolean` | `false` | Has the nav group been expanded |

## Slots

| Name | Description |
| ---- | ----------- |
| `default` | Slot for the list of navigation links. |

## Events

| Name | Payload | Description |
| ---- | ------- | ----------- |
| `gcdsClick` | `void` | Emitted when the button has been clicked. |
| `gcdsFocus` | `void` | Emitted when the button has been focus. |
| `gcdsBlur` | `void` | Emitted when the button blurs. |

## Methods

| Name | Signature | Description |
| ---- | --------- | ----------- |
| `focusTrigger` | `focusTrigger(): Promise<void>` | Focus button element |
| `toggleNav` | `toggleNav(): Promise<void>` | Toggle the nav open or closed |

## Accessibility

- Uses native HTML semantics where possible — no custom ARIA required for the default case.
- `aria-*` attributes set on `<GcdsNavGroup>` are forwarded to the inner native element (via `inheritAttributes` in the Stencil source).
- Focus: component-level focus is delegated through the shadow root where applicable.
- See [accessibility reference](../references/accessibility.md) for cross-cutting invariants.

## Usage (React)

```tsx
import { GcdsNavGroup } from '@gcds-core/components-react';

<GcdsNavGroup menuLabel="..." openTrigger="...">nav group</GcdsNavGroup>
```

## Bilingual

- Set `lang` on `<html>` (or a `[lang]` ancestor) and this component resolves it via `assignLanguage`. Any internal strings bundled in `packages/web/src/components/gcds-nav-group/i18n/i18n.js` flip automatically.
- User-authored content (props, slot text) is your responsibility to translate.
- See [bilingual reference](../references/bilingual.md).

```tsx
<GcdsNavGroup lang={locale} />
```

## Shadow DOM & styling

- Shadow: `true`
- Source file: `packages/web/src/components/gcds-nav-group/gcds-nav-group.tsx`
- Style with GCDS tokens only ([foundations](../references/foundations.md)). Do not pierce the shadow root.

## Dependencies

_None declared._

## Related

_Not documented._

## Notes from source

> Navigational group with expandable or dropdown functionality, allowing for better organization of navigation links.
