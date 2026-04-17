
# Error page

Pages users hit when something goes wrong — not found, server error, forbidden. Must be bilingual, include a way forward, and retain the header and footer.

## Structure

```tsx
import {
  GcdsHeader, GcdsFooter, GcdsContainer, GcdsHeading, GcdsText,
  GcdsButton, GcdsLink, GcdsDateModified,
} from '@gcds-core/components-react';

type ErrorKind = '404' | '500' | '403';

export default function ErrorPage({ kind, locale }: { kind: ErrorKind; locale: 'en' | 'fr' }) {
  const copy = {
    en: {
      '404': { heading: 'Page not found', body: "We couldn't find the page you asked for. It may have been moved, or the link may be wrong.", action: 'Go to home' },
      '500': { heading: 'Something went wrong', body: 'An unexpected error occurred. We are working on it — please try again in a few minutes.', action: 'Try again' },
      '403': { heading: 'You do not have access', body: "You're signed in, but your account doesn't have permission to view this page.", action: 'Go to home' },
    },
    fr: {
      '404': { heading: 'Page introuvable', body: "Nous n'avons pas pu trouver la page demandée. Elle a peut-être été déplacée ou le lien est incorrect.", action: "Aller à l'accueil" },
      '500': { heading: "Une erreur s'est produite", body: "Une erreur inattendue s'est produite. Nous y travaillons — veuillez réessayer dans quelques minutes.", action: 'Réessayer' },
      '403': { heading: "Vous n'avez pas accès", body: "Vous êtes connecté, mais votre compte n'a pas la permission de voir cette page.", action: "Aller à l'accueil" },
    },
  }[locale][kind];

  const homeHref = `/${locale}`;
  const t = locale === 'fr' ? { support: 'Si le problème persiste, nous joindre.', modified: '2026-04-01' } : { support: 'If the problem persists, contact us.', modified: '2026-04-01' };

  return (
    <>
      <GcdsHeader skipToHref="#main" langHref={locale === 'fr' ? '/en' : '/fr'} />

      <GcdsContainer tag="main" id="main" layout="page">
        <GcdsHeading tag="h1">{copy.heading}</GcdsHeading>
        <GcdsText>{copy.body}</GcdsText>

        <GcdsButton type="link" buttonRole="primary" href={homeHref}>{copy.action}</GcdsButton>

        <GcdsText>
          {t.support.replace(/ $/, '')} <GcdsLink href={locale === 'fr' ? '/fr/contactez' : '/en/contact'}>{locale === 'fr' ? 'Nous joindre' : 'Contact us'}</GcdsLink>.
        </GcdsText>

        <GcdsDateModified>{t.modified}</GcdsDateModified>
      </GcdsContainer>

      <GcdsFooter />
    </>
  );
}
```

## HTTP status coverage

| Kind | Trigger | Primary action |
| --- | --- | --- |
| `404` | Route not matched | Go home |
| `403` | Authenticated but not authorised | Go home (don't link back to the restricted page) |
| `500` | Server-side failure | Try again (same URL via link) |

For `500`, the "try again" action should re-request the same URL. For `404` and `403`, do **not** link back to where the user came from — loop them to the home page instead.

## Why each region

| Region | Reason |
| --- | --- |
| Full header + footer | Users are still inside the service — keep the chrome so they can navigate away and switch languages. |
| `<h1>` with the error headline | Announces the error immediately to screen readers. |
| Short body sentence | One line, no jargon. Tells them what happened without blaming them. |
| Primary button to recover | One clear action. Never two primaries. |
| Contact link as fallback | If the primary action doesn't help, give them an escape hatch. |
| `<GcdsDateModified>` | Still required even on error pages. |

## Accessibility

- Page title (`<title>` in head): include the error — "Page not found | Service name" — so browser tabs and screen readers identify the page before content loads.
- Set HTTP status to match the page (404, 403, 500). Search engines and assistive tech care.
- Don't flash colour or animate — these pages are already a stress event.

## Bilingual notes

- Every error kind must have both EN and FR copy. The message is the whole page — it cannot fall back.
- Language toggle in the header must still work — point `langHref` at the equivalent error page in the other language.
- FR phrasing for `500` avoids blame on the user: "Une erreur s'est produite" ("An error occurred"), not a translation of "Something you did went wrong".

## Related

- [navigation pattern](../patterns/navigation.md)
- [feedback pattern](../patterns/feedback.md)
