---
tag: gcds-nav-link
package: "@gcds-core/components-react"
react-export: GcdsNavLink
stability: stable
docs-en: (no dedicated docs page — see parent component)
docs-fr: (no dedicated docs page — see parent component)
---

# GcdsNavLink (`gcds-nav-link`)

Navigation link within a navigation group or menu, allowing users to navigate to different sections of a website or application.

## When to use

_This component has no dedicated docs page. It is used as a sub-component of its parent — see the Related section below for the parent component._

## When NOT to use

_GCDS docs do not enumerate explicit 'when not to use' cases per component. See **Related** below for alternative components, and the [component catalog](../references/component-catalog.md) for the shape of adjacent options._

## Props

| Name | Attribute | Required | Type | Default | Description |
| ---- | --------- | -------- | ---- | ------- | ----------- |
| `href` | `href` | **yes** | `string` | _undefined_ | Link href |
| `current` | `current` | — | `boolean` | _undefined_ | Current page flag |

## Slots

| Name | Description |
| ---- | ----------- |
| `default` | Slot for the navigation link content. |

## Events

| Name | Payload | Description |
| ---- | ------- | ----------- |
| `gcdsClick` | `string` | Emitted when the link has been clicked. |
| `gcdsFocus` | `void` | Emitted when the link has focus. |
| `gcdsBlur` | `void` | Emitted when the link loses focus. |

## Methods

| Name | Signature | Description |
| ---- | --------- | ----------- |
| `focusLink` | `focusLink(): Promise<void>` | Focus the link element |

## Accessibility

- Uses native HTML semantics where possible — no custom ARIA required for the default case.
- `aria-*` attributes set on `<GcdsNavLink>` are forwarded to the inner native element (via `inheritAttributes` in the Stencil source).
- Focus: component-level focus is delegated through the shadow root where applicable.
- See [accessibility reference](../references/accessibility.md) for cross-cutting invariants.

## Usage (React)

```tsx
import { GcdsNavLink } from '@gcds-core/components-react';

<GcdsNavLink href="...">nav link</GcdsNavLink>
```

## Bilingual

- Set `lang` on `<html>` (or a `[lang]` ancestor) and this component resolves it via `assignLanguage`. Any internal strings bundled in `packages/web/src/components/gcds-nav-link/i18n/i18n.js` flip automatically.
- User-authored content (props, slot text) is your responsibility to translate.
- See [bilingual reference](../references/bilingual.md).

```tsx
<GcdsNavLink lang={locale} />
```

## Shadow DOM & styling

- Shadow: `true`
- Source file: `packages/web/src/components/gcds-nav-link/gcds-nav-link.tsx`
- Style with GCDS tokens only ([foundations](../references/foundations.md)). Do not pierce the shadow root.

## Dependencies

_None declared._

## Related

_Not documented._

## Notes from source

> Navigation link within a navigation group or menu, allowing users to navigate to different sections of a website or application.
