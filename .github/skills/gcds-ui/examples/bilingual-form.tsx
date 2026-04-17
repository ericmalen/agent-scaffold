// Bilingual contact form: single-page submission with error summary, field-level validation,
// and per-locale copy driven by a `locale` prop.
import { useRef, useState, FormEvent } from 'react';
import {
  GcdsHeading,
  GcdsErrorSummary,
  GcdsInput,
  GcdsTextarea,
  GcdsSelect,
  GcdsButton,
} from '@gcds-core/components-react';

type FormData = { name: string; email: string; topic: string; message: string };

const COPY = {
  en: {
    heading: 'Contact us',
    name: 'Full name',
    email: 'Email address',
    topic: 'Topic',
    topicPlaceholder: 'Select an option',
    optAccess: 'Accessibility',
    optBilingual: 'Bilingual support',
    optOther: 'Other',
    message: 'Message',
    submit: 'Submit',
    cancel: 'Cancel',
  },
  fr: {
    heading: 'Nous joindre',
    name: 'Nom complet',
    email: 'Adresse courriel',
    topic: 'Sujet',
    topicPlaceholder: 'Sélectionner une option',
    optAccess: 'Accessibilité',
    optBilingual: 'Soutien bilingue',
    optOther: 'Autre',
    message: 'Message',
    submit: 'Soumettre',
    cancel: 'Annuler',
  },
} as const;

export default function BilingualForm({ locale }: { locale: 'en' | 'fr' }) {
  const t = COPY[locale];
  const formRef = useRef<FormData>({ name: '', email: '', topic: '', message: '' });
  const [, setTick] = useState(0);

  const onChange = (e: any) => {
    (formRef.current as any)[e.target.name] = e.target.value;
    setTick(x => x + 1);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Submit handling here. GCDS inputs with validateOn="submit" will surface their own errors
    // and populate gcds-error-summary. Move focus to the summary after validation fails.
  };

  return (
    <form onSubmit={onSubmit} noValidate lang={locale}>
      <GcdsHeading tag="h1">{t.heading}</GcdsHeading>
      <GcdsErrorSummary />

      <GcdsInput
        type="text"
        inputId="name"
        name="name"
        label={t.name}
        autocomplete="name"
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
        <option value="">{t.topicPlaceholder}</option>
        <option value="accessibility">{t.optAccess}</option>
        <option value="bilingual">{t.optBilingual}</option>
        <option value="other">{t.optOther}</option>
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
  );
}
