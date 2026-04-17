
# Feedback

Four components overlap in role. Pick by **urgency × scope**.

| Component | Urgency | Scope | Dismissible |
| --- | --- | --- | --- |
| `gcds-alert` | Medium-high | Page- or section-level | Often yes |
| `gcds-notice` | Medium | In-flow page content | No |
| `gcds-error-summary` | Critical | Form submit | No |
| `gcds-error-message` | Critical | Single form field | No |

## When to use

- **`gcds-alert`** — time-sensitive or contextual information that arrives after the page loads (save succeeded, system maintenance warning).
- **`gcds-notice`** — persistent, in-flow content (policy notice, out-of-office banner, deprecation warning).
- **`gcds-error-summary`** — always at the top of a form. Populated after a failed submit with links to each invalid field.
- **`gcds-error-message`** — directly below the field it belongs to. Rendered by the input component automatically when you set `errorMessage`.

## Composition — form with all four

```tsx
<form onSubmit={onSubmit} noValidate>
  {saveSucceeded && (
    <GcdsAlert alertRole="success" heading="Saved">Your changes were saved.</GcdsAlert>
  )}

  <GcdsNotice noticeRole="info" noticeTitle="This form closes April 30, 2026" noticeTitleTag="h2">
    <p>Applications after this date won't be processed.</p>
  </GcdsNotice>

  <GcdsErrorSummary />

  <GcdsInput
    inputId="name"
    name="name"
    label="Full name"
    errorMessage={errors.name}
    required
    validateOn="submit"
  />
  {/* ... */}
</form>
```

Only the input needs explicit `errorMessage` wiring; the input renders `<gcds-error-message>` internally and links it to the field via `aria-describedby`.

## Accessibility

- `<gcds-alert>` sets `role="alert"` / `aria-live="polite"` internally. Screen readers announce it when it mounts. **Do not stack alerts** — one visible alert at a time, or chain with a mount/unmount so each is announced cleanly.
- `<gcds-error-summary>` sets `role="alert"`. After a failed submit, move keyboard focus to the element directly — hold a React ref and call `ref.current.focus()`.
- `<gcds-notice>` is not live — it's page content. Don't use it for urgent messages.
- Colour alone never communicates urgency. Each feedback surface includes an icon; keep it.

## Bilingual

- Heading and body content are your responsibility. Translate them.
- The close/dismiss button label in `gcds-alert` flips automatically with `lang`.
- Don't translate `alertRole` / `noticeRole` values — they're identifiers.

## Timing

- Alerts for success messages: auto-dismiss after ~5s, or persist until user dismisses. Never both.
- Alerts for errors: persist until user acts or navigates.
- Notices are always persistent.

## Common mistakes

| Mistake | Fix |
| --- | --- |
| Stacking multiple alerts for the same submit | Use one `<gcds-error-summary>` at the top instead. |
| Using `<gcds-alert>` as a page banner | That's `<gcds-notice>`. |
| Toasting validation errors | Errors go in the summary + per-field message, not a toast. |
| Dismissible notice | Notices are persistent. If it should disappear, it's an alert. |
