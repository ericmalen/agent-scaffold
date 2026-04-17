---
tag: gcds-stepper
package: "@gcds-core/components-react"
react-export: GcdsStepper
stability: stable
docs-en: https://design-system.canada.ca/en/components/stepper/
docs-fr: https://design-system.canada.ca/fr/composants/indicateur-detape/
---

# GcdsStepper (`gcds-stepper`)

A stepper is a progress tracker for a multi-step process.

## When to use

- Show a person which step they're on in a process, like in a multi-step form.
- Make the structure of a path clear by showing the total number of steps.

## When NOT to use

_GCDS docs do not enumerate explicit 'when not to use' cases per component. See **Related** below for alternative components, and the [component catalog](../references/component-catalog.md) for the shape of adjacent options._

## Props

| Name | Attribute | Required | Type | Default | Description |
| ---- | --------- | -------- | ---- | ------- | ----------- |
| `currentStep` | `current-step` | **yes** | `number` | _undefined_ | Defines the current step. |
| `totalSteps` | `total-steps` | **yes** | `number` | _undefined_ | Defines the total amount of steps. |
| `tag` | `tag` | — | `'h1' \| 'h2' \| 'h3'` | `'h2'` | Defines the heading tag to render |

## Slots

| Name | Description |
| ---- | ----------- |
| `default` | Slot for the heading content. |

## Events

_None._

## Methods

_None._

## Accessibility

- Uses native HTML semantics where possible — no custom ARIA required for the default case.
- `aria-*` attributes set on `<GcdsStepper>` are forwarded to the inner native element (via `inheritAttributes` in the Stencil source).
- Focus: component-level focus is delegated through the shadow root where applicable.
- See [accessibility reference](../references/accessibility.md) for cross-cutting invariants.

## Usage (React)

```tsx
import { GcdsStepper } from '@gcds-core/components-react';

<GcdsStepper currentStep="..." totalSteps="...">stepper</GcdsStepper>
```

## Bilingual

- Set `lang` on `<html>` (or a `[lang]` ancestor) and this component resolves it via `assignLanguage`. Any internal strings bundled in `packages/web/src/components/gcds-stepper/i18n/i18n.js` flip automatically.
- User-authored content (props, slot text) is your responsibility to translate.
- See [bilingual reference](../references/bilingual.md).

```tsx
<GcdsStepper lang={locale} />
```

## Shadow DOM & styling

- Shadow: `true`
- Source file: `packages/web/src/components/gcds-stepper/gcds-stepper.tsx`
- Style with GCDS tokens only ([foundations](../references/foundations.md)). Do not pierce the shadow root.

## Dependencies

_None declared._

## Related

- Pagination when a user needs to navigate a range of pages that are not part of a multi-step process. It provides controls to select the next or previous page.

## Notes from source

> A stepper is a progress tracker for a multi-step process.
