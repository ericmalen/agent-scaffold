
# Landing page

A department or service landing page. Primary task front and centre, supporting content below.

## Structure

```tsx
import {
  GcdsHeader,
  GcdsFooter,
  GcdsTopNav,
  GcdsNavLink,
  GcdsContainer,
  GcdsHeading,
  GcdsText,
  GcdsButton,
  GcdsGrid,
  GcdsGridCol,
  GcdsCard,
  GcdsDateModified,
} from '@gcds-core/components-react';

export default function LandingPage({ locale }: { locale: 'en' | 'fr' }) {
  const t = locale === 'fr'
    ? { title: 'Nom du service', intro: 'Description courte et claire du service.', start: 'Commencer', featured: 'Contenu en vedette', modified: '2026-04-01' }
    : { title: 'Service name', intro: 'A short, clear description of the service.', start: 'Start', featured: 'Featured content', modified: '2026-04-01' };

  return (
    <>
      <GcdsHeader skipToHref="#main" langHref={locale === 'fr' ? '/en' : '/fr'}>
        <GcdsTopNav slot="menu" label={locale === 'fr' ? 'Navigation principale' : 'Primary navigation'}>
          <GcdsNavLink href={locale === 'fr' ? '/fr/services' : '/en/services'}>
            {locale === 'fr' ? 'Services' : 'Services'}
          </GcdsNavLink>
          <GcdsNavLink href={locale === 'fr' ? '/fr/contactez' : '/en/contact'}>
            {locale === 'fr' ? 'Nous joindre' : 'Contact'}
          </GcdsNavLink>
        </GcdsTopNav>
      </GcdsHeader>

      <GcdsContainer tag="main" id="main" layout="page">
        {/* 1. Hero with primary task */}
        <section aria-labelledby="hero-heading" className="mb-800">
          <GcdsHeading tag="h1" id="hero-heading">{t.title}</GcdsHeading>
          <GcdsText size="body">{t.intro}</GcdsText>
          <GcdsButton type="link" buttonRole="start" href="/start">{t.start}</GcdsButton>
        </section>

        {/* 2. Featured content grid */}
        <section aria-labelledby="featured-heading" className="mb-800">
          <GcdsHeading tag="h2" id="featured-heading">{t.featured}</GcdsHeading>
          <GcdsGrid columns="1fr 1fr 1fr" gap="400">
            <GcdsGridCol>
              <GcdsCard cardTitle="Title A" description="Short description." href="/a" />
            </GcdsGridCol>
            <GcdsGridCol>
              <GcdsCard cardTitle="Title B" description="Short description." href="/b" />
            </GcdsGridCol>
            <GcdsGridCol>
              <GcdsCard cardTitle="Title C" description="Short description." href="/c" />
            </GcdsGridCol>
          </GcdsGrid>
        </section>

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
| `<GcdsHeader>` with `skipToHref="#main"` | Provides the Canada.ca signature + skip link + language toggle slot. |
| `<GcdsTopNav slot="menu">` | Sitewide navigation inside the header. One `label` per `<nav>` landmark. |
| `<GcdsContainer tag="main" id="main" layout="page">` | The single `<main>` landmark and skip-link target. `id="main"` matches the header's `skipToHref="#main"`. |
| `<h1>` with `id="hero-heading"` | One h1 per page. `aria-labelledby` on the section points to it. |
| `<GcdsButton buttonRole="start">` | The "start" role is the GCDS supertask button — use it once per page for the primary task. |
| `<GcdsGrid>` with h2 | Secondary tasks grouped in a grid. h2 level follows the h1 directly. |
| `<GcdsDateModified>` | Required on Canada.ca pages — shows the last modified date. |
| `<GcdsFooter>` | Required Canada.ca footer with its own chrome links. |

## Accessibility landmarks

- `<header role="banner">` via `<gcds-header>`
- `<nav aria-label="Primary navigation">` via `<gcds-top-nav>`
- `<main id="main">` via `<gcds-container tag="main">`
- `<footer role="contentinfo">` via `<gcds-footer>`

Sections inside main use `aria-labelledby` pointing at their own heading id — gives screen reader users a section landmark.

## Bilingual notes

- `langHref` in the header points to the equivalent page in the other language. Derive from your router, not hardcoded.
- The start button label is user content — translate.
- Card titles and descriptions translate.
- Nav slugs localize (`/fr/services` might equal `/en/services` by coincidence; `/fr/nous-joindre` ≠ `/en/contact`).
- Don't pass `lang="en-CA"`; use `"en"` / `"fr"` only.

## Related

- [navigation pattern](../patterns/navigation.md)
- [layout pattern](../patterns/layout.md)
