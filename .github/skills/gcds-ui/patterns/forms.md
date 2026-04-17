
# Forms

Forms in GCDS are assembled from the input family (`gcds-input`, `gcds-textarea`, `gcds-select`, `gcds-radios`, `gcds-checkboxes`, `gcds-date-input`, `gcds-file-uploader`) plus the structural helpers (`gcds-fieldset`, `gcds-hint`, `gcds-label`, `gcds-error-message`) and a top-level `gcds-error-summary`.

## When to use this pattern

Any page that collects data — contact forms, applications, multi-step wizards, search forms. If the user is supplying information, this is the shape.

## Composition

```
<form>
  <gcds-error-summary />           ← always at the top, empty until submit fails
  <gcds-input required />
  <gcds-textarea required />
  <gcds-date-input required />
  <gcds-select required />
  <gcds-radios required />
  <gcds-checkboxes required />
  <gcds-button type="submit" />
</form>
```

Rules:

- **One `gcds-error-summary` per form**, at the top. After a failed submit, move focus to the summary element (use a React ref on the `<GcdsErrorSummary>` and call `.focus()` on the host) so screen readers hear the errors immediately.
- Use `validateOn="submit"` on each input — don't validate on keystroke; that's hostile to users.
- The `name` prop on each input drives form serialization. Match it to the state key.
- Include a `label` prop (or use `<gcds-label>`). Never rely on placeholder as label.
- Wrap related inputs in `<gcds-fieldset>` with a `legend` prop (e.g. "Address" around street/city/postal code).

## Accessibility

- `<gcds-error-summary>` renders `role="alert"` internally — browsers announce new content.
- Every input links its `<gcds-hint>` and `<gcds-error-message>` via `aria-describedby` automatically.
- Required fields are marked with text ("required") plus the `required` attribute, not colour alone.
- After a failed submit, move focus to the `<gcds-error-summary>` host element — hold a React ref and call `ref.current.focus()`. The component itself sets `role="alert"` so new content is announced.

## Full example (React)

```tsx
import { useRef, useState, FormEvent } from 'react';
import {
  GcdsHeading,
  GcdsInput,
  GcdsTextarea,
  GcdsSelect,
  GcdsRadios,
  GcdsCheckboxes,
  GcdsDateInput,
  GcdsButton,
  GcdsErrorSummary,
} from '@gcds-core/components-react';

type FormData = { name: string; message: string; topic: string; consent: string[]; date: string; contact: string };

export default function ContactForm({ locale }: { locale: 'en' | 'fr' }) {
  const formRef = useRef<FormData>({ name: '', message: '', topic: '', consent: [], date: '', contact: '' });
  const [, setTick] = useState(0);

  const onChange = (e: any) => {
    (formRef.current as any)[e.target.name] = e.target.value;
    setTick(t => t + 1);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Submit handling; GCDS inputs already surfaced per-field errors via validateOn="submit"
  };

  const t = locale === 'fr'
    ? { heading: 'Nous joindre', name: 'Nom complet', message: 'Message', topic: 'Sujet', selectOpt: 'Sélectionner', date: 'Date de naissance', consent: 'Consentements', contact: 'Mode de contact préféré', submit: 'Soumettre' }
    : { heading: 'Contact us', name: 'Full name', message: 'Message', topic: 'Topic', selectOpt: 'Select an option', date: 'Date of birth', consent: 'Consent', contact: 'Preferred contact method', submit: 'Submit' };

  return (
    <form onSubmit={onSubmit} noValidate lang={locale}>
      <GcdsHeading tag="h1">{t.heading}</GcdsHeading>
      <GcdsErrorSummary />

      <GcdsInput
        type="text"
        inputId="name"
        name="name"
        label={t.name}
        value={formRef.current.name}
        onGcdsInput={onChange}
        validateOn="submit"
        required
      />

      <GcdsTextarea
        textareaId="message"
        name="message"
        label={t.message}
        value={formRef.current.message}
        onGcdsInput={onChange}
        validateOn="submit"
        required
      />

      <GcdsSelect selectId="topic" name="topic" label={t.topic} value={formRef.current.topic} onGcdsInput={onChange} validateOn="submit" required>
        <option value="">{t.selectOpt}</option>
        <option value="accessibility">{locale === 'fr' ? 'Accessibilité' : 'Accessibility'}</option>
        <option value="bilingual">{locale === 'fr' ? 'Bilinguisme' : 'Bilingual'}</option>
      </GcdsSelect>

      <GcdsDateInput legend={t.date} name="date" format="full" value={formRef.current.date} onInput={onChange} validateOn="submit" required />

      <GcdsRadios
        name="contact"
        legend={t.contact}
        options={[
          { label: locale === 'fr' ? 'Courriel' : 'Email', id: 'email', value: 'email' },
          { label: locale === 'fr' ? 'Téléphone' : 'Phone', id: 'phone', value: 'phone' },
        ]}
        value={formRef.current.contact}
        onGcdsInput={onChange}
        validateOn="submit"
        required
      />

      <GcdsCheckboxes
        name="consent"
        legend={t.consent}
        options={[
          { label: locale === 'fr' ? "J'accepte les conditions" : 'I accept the terms', id: 'terms', value: 'terms' },
        ]}
        value={formRef.current.consent}
        onGcdsInput={onChange}
        validateOn="submit"
        required
      />

      <GcdsButton type="submit" buttonRole="primary">{t.submit}</GcdsButton>
    </form>
  );
}
```

## Bilingual considerations

- Always set `lang` on the form (or higher). Validators and internal strings flip automatically.
- FR labels are ~25% longer — don't hardcode input widths.
- Radio/checkbox `id` and `value` stay in English (they're identifiers). Only `label` is translated.
- Date format: use ISO (`YYYY-MM-DD`) for `value`; GCDS formats display per locale.

## Common mistakes

| Mistake | Fix |
| --- | --- |
| Validating on every keystroke | Use `validateOn="submit"`. |
| Omitting `gcds-error-summary` | Always include it — required for AA compliance on forms with multiple fields. |
| Using `placeholder` as label | Add `label` prop. |
| Skipping `name` prop | Serialization won't work; error summary can't link to the field. |
| Wrapping radios in their own `<form>` mid-page | Keep one `<form>` per logical submission. |
