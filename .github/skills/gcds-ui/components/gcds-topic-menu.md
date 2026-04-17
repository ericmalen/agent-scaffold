---
tag: gcds-topic-menu
package: "@gcds-core/components-react"
react-export: GcdsTopicMenu
stability: stable
docs-en: https://design-system.canada.ca/en/components/theme-and-topic-menu/
docs-fr: https://design-system.canada.ca/fr/composants/menu-thematique/
---

# GcdsTopicMenu (`gcds-topic-menu`)

The theme and topic menu is a navigation to the top tasks of Government of Canada websites.

## When to use

_Docs page does not enumerate specific use cases — see upstream guidance._

## When NOT to use

_GCDS docs do not enumerate explicit 'when not to use' cases per component. See **Related** below for alternative components, and the [component catalog](../references/component-catalog.md) for the shape of adjacent options._

## Props

| Name | Attribute | Required | Type | Default | Description |
| ---- | --------- | -------- | ---- | ------- | ----------- |
| `home` | `home` | — | `boolean` | `false` | Sets the homepage styling |

## Slots

_None._

## Events

_None._

## Methods

| Name | Signature | Description |
| ---- | --------- | ----------- |
| `closeAllMenus` | `closeAllMenus(): Promise<void>` | Close all theme menus |
| `toggleNav` | `toggleNav(): Promise<void>` | Toggle open theme and topic menu |
| `updateNavSize` | `updateNavSize(size: any): Promise<void>` |  |
| `getNavSize` | `getNavSize(): Promise<"desktop" \| "mobile">` |  |
| `updateNavItemQueue` | `updateNavItemQueue(parent: any): Promise<void>` | Update keyboard focus queue |

## Accessibility

- Uses native HTML semantics where possible — no custom ARIA required for the default case.
- `aria-*` attributes set on `<GcdsTopicMenu>` are forwarded to the inner native element (via `inheritAttributes` in the Stencil source).
- Focus: component-level focus is delegated through the shadow root where applicable.
- See [accessibility reference](../references/accessibility.md) for cross-cutting invariants.

## Usage (React)

```tsx
import { GcdsTopicMenu } from '@gcds-core/components-react';

<GcdsTopicMenu />
```

## Bilingual

- Set `lang` on `<html>` (or a `[lang]` ancestor) and this component resolves it via `assignLanguage`. Any internal strings bundled in `packages/web/src/components/gcds-topic-menu/i18n/i18n.js` flip automatically.
- User-authored content (props, slot text) is your responsibility to translate.
- See [bilingual reference](../references/bilingual.md).

```tsx
<GcdsTopicMenu lang={locale} />
```

## Shadow DOM & styling

- Shadow: `true`
- Source file: `packages/web/src/components/gcds-topic-menu/gcds-topic-menu.tsx`
- Style with GCDS tokens only ([foundations](../references/foundations.md)). Do not pierce the shadow root.

## Dependencies

_None declared._

## Related

- Header for placing the Government of Canada branded header landmark.
- Footer for placing the Government of Canada branded footer landmark.
- Top navigation and side navigation for a more customized navigation.

## Notes from source

> The theme and topic menu is a navigation to the top tasks of Government of Canada websites.
