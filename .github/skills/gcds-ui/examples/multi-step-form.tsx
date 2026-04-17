// Multi-step form with gcds-stepper driving progress. Validates per step before allowing Next.
// State is held in a single ref across steps so back-nav doesn't lose input.
import { useRef, useState, FormEvent } from 'react';
import {
  GcdsStepper,
  GcdsHeading,
  GcdsErrorSummary,
  GcdsInput,
  GcdsSelect,
  GcdsTextarea,
  GcdsButton,
} from '@gcds-core/components-react';

type Step1 = { name: string; email: string };
type Step2 = { topic: string; otherTopic: string };
type Step3 = { message: string };
type AllData = Step1 & Step2 & Step3;

const EMPTY: AllData = { name: '', email: '', topic: '', otherTopic: '', message: '' };

const COPY = {
  en: {
    stepLabels: ['Your info', 'Topic', 'Message', 'Review'],
    step1: 'Your info', name: 'Full name', email: 'Email address',
    step2: 'Topic', topic: 'Topic', selectOpt: 'Select an option',
    otherTopic: 'Tell us about "Other"',
    step3: 'Message', message: 'Message',
    review: 'Review and submit', next: 'Next', back: 'Back', submit: 'Submit',
  },
  fr: {
    stepLabels: ['Vos informations', 'Sujet', 'Message', 'Révision'],
    step1: 'Vos informations', name: 'Nom complet', email: 'Adresse courriel',
    step2: 'Sujet', topic: 'Sujet', selectOpt: 'Sélectionner',
    otherTopic: 'Parlez-nous de « Autre »',
    step3: 'Message', message: 'Message',
    review: 'Révision et soumission', next: 'Suivant', back: 'Précédent', submit: 'Soumettre',
  },
} as const;

export default function MultiStepForm({ locale }: { locale: 'en' | 'fr' }) {
  const t = COPY[locale];
  const data = useRef<AllData>({ ...EMPTY });
  const [step, setStep] = useState(1);
  const [, setTick] = useState(0);

  const onChange = (e: any) => {
    (data.current as any)[e.target.name] = e.target.value;
    setTick(x => x + 1);
  };

  const canAdvance = () => {
    if (step === 1) return !!data.current.name && !!data.current.email;
    if (step === 2) return !!data.current.topic && (data.current.topic !== 'other' || !!data.current.otherTopic);
    if (step === 3) return !!data.current.message;
    return true;
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      if (canAdvance()) setStep(step + 1);
      return;
    }
    // Final submission
  };

  return (
    <form onSubmit={onSubmit} noValidate lang={locale}>
      <GcdsStepper currentStep={step} totalSteps={4}>
        {t.stepLabels[step - 1]}
      </GcdsStepper>

      <GcdsErrorSummary />

      {step === 1 && (
        <section aria-labelledby="step1-heading">
          <GcdsHeading tag="h1" id="step1-heading">{t.step1}</GcdsHeading>
          <GcdsInput type="text" inputId="name" name="name" label={t.name} autocomplete="name"
            value={data.current.name} onGcdsInput={onChange} validateOn="submit" required />
          <GcdsInput type="email" inputId="email" name="email" label={t.email} autocomplete="email"
            value={data.current.email} onGcdsInput={onChange} validateOn="submit" required />
        </section>
      )}

      {step === 2 && (
        <section aria-labelledby="step2-heading">
          <GcdsHeading tag="h1" id="step2-heading">{t.step2}</GcdsHeading>
          <GcdsSelect selectId="topic" name="topic" label={t.topic}
            value={data.current.topic} onGcdsInput={onChange} validateOn="submit" required>
            <option value="">{t.selectOpt}</option>
            <option value="access">{locale === 'fr' ? 'Accessibilité' : 'Accessibility'}</option>
            <option value="bilingual">{locale === 'fr' ? 'Bilinguisme' : 'Bilingual'}</option>
            <option value="other">{locale === 'fr' ? 'Autre' : 'Other'}</option>
          </GcdsSelect>
          {data.current.topic === 'other' && (
            <GcdsInput type="text" inputId="otherTopic" name="otherTopic" label={t.otherTopic}
              value={data.current.otherTopic} onGcdsInput={onChange} validateOn="submit" required />
          )}
        </section>
      )}

      {step === 3 && (
        <section aria-labelledby="step3-heading">
          <GcdsHeading tag="h1" id="step3-heading">{t.step3}</GcdsHeading>
          <GcdsTextarea textareaId="message" name="message" label={t.message}
            value={data.current.message} onGcdsInput={onChange} validateOn="submit" required />
        </section>
      )}

      {step === 4 && (
        <section aria-labelledby="review-heading">
          <GcdsHeading tag="h1" id="review-heading">{t.review}</GcdsHeading>
          <dl>
            <dt>{t.name}</dt><dd>{data.current.name}</dd>
            <dt>{t.email}</dt><dd>{data.current.email}</dd>
            <dt>{t.topic}</dt><dd>{data.current.topic === 'other' ? data.current.otherTopic : data.current.topic}</dd>
            <dt>{t.message}</dt><dd>{data.current.message}</dd>
          </dl>
        </section>
      )}

      {step > 1 && (
        <GcdsButton type="button" buttonRole="secondary" onGcdsClick={() => setStep(step - 1)}>
          {t.back}
        </GcdsButton>
      )}
      <GcdsButton type="submit" buttonRole="primary">
        {step < 4 ? t.next : t.submit}
      </GcdsButton>
    </form>
  );
}
