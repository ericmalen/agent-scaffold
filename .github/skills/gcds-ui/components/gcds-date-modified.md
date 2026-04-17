---
tag: gcds-date-modified
package: "@gcds-core/components-react"
react-export: GcdsDateModified
stability: stable
docs-en: https://design-system.canada.ca/en/components/date-modified/
docs-fr: https://design-system.canada.ca/fr/composants/date-de-modification/
---

# GcdsDateModified (`gcds-date-modified`)

Date modified is an indicator of the last update to a webpage or application.

## When to use

_Docs page does not enumerate specific use cases — see upstream guidance._

## When NOT to use

_GCDS docs do not enumerate explicit 'when not to use' cases per component. See **Related** below for alternative components, and the [component catalog](../references/component-catalog.md) for the shape of adjacent options._

## Props

| Name | Attribute | Required | Type | Default | Description |
| ---- | --------- | -------- | ---- | ------- | ----------- |
| `type` | `type` | — | `'date' \| 'version'` | `'date'` | Set date modified type. Default is date. |

## Slots

| Name | Description |
| ---- | ----------- |
| `default` | Slot for the date/version number. |

## Events

_None._

## Methods

_None._

## Accessibility

- Uses native HTML semantics where possible — no custom ARIA required for the default case.
- `aria-*` attributes set on `<GcdsDateModified>` are forwarded to the inner native element (via `inheritAttributes` in the Stencil source).
- Focus: component-level focus is delegated through the shadow root where applicable.
- See [accessibility reference](../references/accessibility.md) for cross-cutting invariants.

## Usage (React)

```tsx
import { GcdsDateModified } from '@gcds-core/components-react';

<GcdsDateModified>date modified</GcdsDateModified>
```

## Bilingual

- Set `lang` on `<html>` (or a `[lang]` ancestor) and this component resolves it via `assignLanguage`. Any internal strings bundled in `packages/web/src/components/gcds-date-modified/i18n/i18n.js` flip automatically.
- User-authored content (props, slot text) is your responsibility to translate.
- See [bilingual reference](../references/bilingual.md).

```tsx
<GcdsDateModified lang={locale} />
```

## Shadow DOM & styling

- Shadow: `true`
- Source file: `packages/web/src/components/gcds-date-modified/gcds-date-modified.tsx`
- Style with GCDS tokens only ([foundations](../references/foundations.md)). Do not pierce the shadow root.

## Dependencies

_None declared._

## Related

- Footer for placing the Government of Canada branded footer landmark.

## Notes from source

> Date modified is an indicator of the last update to a webpage or application.
