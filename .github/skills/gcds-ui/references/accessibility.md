
# Accessibility

GCDS meets or exceeds **WCAG 2.1 AA**, with some styles at AAA (typography and spacing). Using components unmodified gets you most of the way. This page is the checklist for everything else.

## Non-negotiable invariants

1. **Never bypass tokens with raw CSS colour or sizes.** Global tokens encode tested contrast ratios — custom values break AA.
2. **Every interactive element has a visible focus state.** GCDS ships focus styles via `--gcds-focus-background/-border/-text`. Do not remove `:focus` rings.
3. **Order headings numerically.** `<h1>` → `<h2>` → `<h3>`. One `<h1>` per page. Never skip levels. Use `<gcds-heading>` to enforce the scale.
4. **Forms always include labels.** Every input takes a `label` prop. Never rely on placeholder as label.
5. **Errors use the summary pattern.** `<gcds-error-summary>` at the top of the form aggregates errors and links to each field. Individual `<gcds-error-message>` stays next to the field.
6. **Colour is never the only cue.** Pair colour with icon, shape, or text — users with colour blindness or low vision need the secondary cue.
7. **Set `lang` at the root.** The `<html lang="...">` attribute (or nearest `[lang]` ancestor) drives in-component translations via `assignLanguage(el)`. See [bilingual](./bilingual.md).

## Keyboard patterns

| Component type | Expected keys |
| --- | --- |
| Buttons, links | `Enter` / `Space` to activate. `Tab` to focus. |
| Checkboxes, radios | `Tab` to enter group, arrow keys to move within a radio group, `Space` to toggle a checkbox. |
| Select | `Space`/`Enter` opens native dropdown, arrows move options (native semantics). |
| Details / disclosure | `Enter` / `Space` toggles expansion. |
| Pagination | `Tab` through page links; `Enter` activates. |
| Stepper | `Tab` through steps; current step is announced via `aria-current`. |

GCDS components use native HTML under the hood (`<button>`, `<input>`, `<select>`, `<details>`) — native keyboard support comes with them. Don't re-implement keyboard handling; rely on the native element.

## ARIA usage

- **Prefer semantic HTML over ARIA.** `<gcds-button>` wraps `<button>`; `<gcds-link>` wraps `<a>`. Don't reach for `role="button"` on a div.
- **Aria attributes pass through.** Components forward any `aria-*` attribute set on the host element to the inner native element via `inheritAttributes` (see `packages/web/src/utils/utils.ts`).
- **`aria-live` regions are the responsibility of the feedback component.** `<gcds-alert>` and `<gcds-error-summary>` set `role="alert"` / `aria-live="polite"` internally — don't add another.
- **`aria-describedby` wiring is automatic** on form inputs — hint text and error messages are linked to the input for you when you use `<gcds-hint>` and `<gcds-error-message>` in the component.

## Focus management

- Components with `shadow: { delegatesFocus: true }` (buttons, inputs, links, etc.) delegate focus so `el.focus()` hits the native element inside the shadow DOM.
- After a form submit fails, move focus to `<gcds-error-summary>` via its exposed `focusSummary()` method so screen reader users hear the errors.
- When a route changes in SPAs, move focus to the new `<h1>` or the main landmark so assistive tech announces the new page.

## Landmarks

Every page needs recognisable landmarks. GCDS provides:

- `<gcds-header>` — renders `<header role="banner">` with skip-to-content link and language toggle slot.
- `<gcds-footer>` — renders `<footer role="contentinfo">` with required Canada.ca footer links.
- **You are responsible for `<main>`.** Wrap your primary content in `<gcds-container tag="main">` or a plain `<main>` element. Only one per page.
- Navigation landmarks come from `<gcds-top-nav>` and `<gcds-side-nav>`, which render `<nav>` elements with appropriate labels.

## Visual checklist

- Minimum text contrast: 4.5:1 for body, 3:1 for large text (≥18.66px bold or ≥24px regular). Global tokens meet or exceed this.
- Tap targets: ≥44×44 CSS pixels. GCDS buttons and interactive elements comply by default.
- Allow 200% zoom without content loss. Don't fix heights on containers that hold dynamic text.
- Respect `prefers-reduced-motion`. GCDS components ship minimal motion; any custom animation you add must be wrapped.

## Testing

Before release, the GCDS team runs automated scans plus testing with users of assistive technologies. For your own code:

1. Keyboard-only walkthrough — can you reach, activate, and exit every interactive element?
2. Screen reader pass — VoiceOver (macOS/iOS) or NVDA (Windows). Every control has a meaningful name; every landmark is reachable.
3. Run `axe DevTools` or Lighthouse accessibility audit — fix violations before PR.
4. 200% zoom and a narrow viewport (320px). Content must not overflow or clip.
5. Bilingual pass — translate via the `lang` prop and spot-check FR text doesn't truncate or wrap awkwardly (FR averages ~25% longer than EN).

## When docs are silent

The GCDS accessibility page publishes high-level principles, not per-component ARIA trees. For component-specific ARIA, the **component's Stencil source and its shadow DOM output are the source of truth** — individual component files reference the ARIA roles and wiring observed in source.
