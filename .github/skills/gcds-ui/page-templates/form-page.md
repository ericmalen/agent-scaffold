
# Form page

A single-step form page. For multi-step flows see [multi-step-form example](../examples/multi-step-form.tsx).

## Structure

```tsx
import { useRef, useState, FormEvent } from 'react';
import {
  GcdsHeader,
  GcdsFooter,
  GcdsContainer,
  GcdsBreadcrumbs,
  GcdsBreadcrumbsItem,
  GcdsHeading,
  GcdsText,
  GcdsErrorSummary,
  GcdsInput,
  GcdsTextarea,
  GcdsSelect,
  GcdsButton,
  GcdsDateModified,
} from '@gcds-core/components-react';

type FormData = { name: string; email: string; topic: string; message: string };

export default function FormPage({ locale }: { locale: 'en' | 'fr' }) {
  const formRef = useRef<FormData>({ name: '', email: '', topic: '', message: '' });
  const [, setTick] = useState(0);
  const onChange = (e: any) => { (formRef.current as any)[e.target.name] = e.target.value; setTick(t => t + 1); };
  const onSubmit = (e: FormEvent) => { e.preventDefault(); /* submit */ };

  const t = locale === 'fr' ? {
    crumb: 'Accueil', title: 'Nous joindre', intro: 'Envoyez-nous un message et nous répondrons dans les deux jours ouvrables.',
    name: 'Nom complet', email: 'Adresse courriel', topic: 'Sujet', select: 'Sélectionner', message: 'Message',
    submit: 'Soumettre', cancel: 'Annuler', modified: '2026-04-01'
  } : {
    crumb: 'Home', title: 'Contact us', intro: 'Send us a message and we will respond within two business days.',
    name: 'Full name', email: 'Email address', topic: 'Topic', select: 'Select an option', message: 'Message',
    submit: 'Submit', cancel: 'Cancel', modified: '2026-04-01'
  };

  return (
    <>
      <GcdsHeader skipToHref="#main" langHref={locale === 'fr' ? '/en/contact' : '/fr/contactez'}>
        <GcdsBreadcrumbs slot="breadcrumb">
          <GcdsBreadcrumbsItem href={locale === 'fr' ? '/fr' : '/en'}>{t.crumb}</GcdsBreadcrumbsItem>
        </GcdsBreadcrumbs>
      </GcdsHeader>

      <GcdsContainer tag="main" id="main" layout="page">
        <GcdsHeading tag="h1">{t.title}</GcdsHeading>
        <GcdsText>{t.intro}</GcdsText>

        <form onSubmit={onSubmit} noValidate lang={locale}>
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

          <GcdsInput
            type="email"
            inputId="email"
            name="email"
            label={t.email}
            autocomplete="email"
            value={formRef.current.email}
            onGcdsInput={onChange}
            validateOn="submit"
            required
          />

          <GcdsSelect
            selectId="topic"
            name="topic"
            label={t.topic}
            value={formRef.current.topic}
            onGcdsInput={onChange}
            validateOn="submit"
            required
          >
            <option value="">{t.select}</option>
            <option value="access">{locale === 'fr' ? 'Accessibilité' : 'Accessibility'}</option>
            <option value="other">{locale === 'fr' ? 'Autre' : 'Other'}</option>
          </GcdsSelect>

          <GcdsTextarea
            textareaId="message"
            name="message"
            label={t.message}
            value={formRef.current.message}
            onGcdsInput={onChange}
            validateOn="submit"
            required
          />

          <GcdsButton type="submit" buttonRole="primary">{t.submit}</GcdsButton>
          <GcdsButton type="reset" buttonRole="secondary">{t.cancel}</GcdsButton>
        </form>

        <GcdsDateModified>{t.modified}</GcdsDateModified>
      </GcdsContainer>

      <GcdsFooter />
    </>
  );
}
```

## Why each region

| Region | Reason |
| --- | --- |
| `GcdsBreadcrumbs slot="breadcrumb"` | Gives a trail back up the hierarchy. Placed inside the header via named slot. |
| `<h1>` | One per page. Matches the browser tab title. |
| Intro `<GcdsText>` | Sets expectations (response time, eligibility). Not optional for contact forms. |
| `<GcdsErrorSummary>` at top of form | Populated after a failed submit. Move focus to it. |
| `validateOn="submit"` | User-friendly — no per-keystroke validation. |
| `autocomplete="email"` | Lets browsers auto-fill. Use the correct token for each field (name, given-name, family-name, email, tel, postal-code, etc.). |
| Primary + secondary buttons | Primary for the forward action, secondary for cancel/reset. Never two primaries. |
| `<GcdsDateModified>` | Canada.ca convention — last modified date at the end of `<main>`. |

## Accessibility landmarks

- `<header>` / `<main>` / `<footer>` as in [landing-page](./landing-page.md).
- The breadcrumb renders its own `<nav aria-label="Breadcrumb">`.
- Focus management on submit: hold a React ref on `<GcdsErrorSummary>` and call `ref.current?.focus()` after validation fails — the component is focusable and already sets `role="alert"`.

## Bilingual notes

- `langHref` in header must point to the FR version of *this specific page*, with localized slug.
- `autocomplete` tokens are language-agnostic — never translate.
- FR labels are longer; inputs reflow naturally when not constrained by width.
- `noValidate` on the `<form>` — GCDS validation replaces native browser validation for a consistent bilingual error UX.

## Related

- [forms pattern](../patterns/forms.md)
- [feedback pattern](../patterns/feedback.md)
