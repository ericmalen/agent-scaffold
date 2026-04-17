
# Dashboard

Authenticated landing for an internal or logged-in service. Persistent side navigation, modular widget grid.

## Structure

```tsx
import {
  GcdsHeader, GcdsFooter, GcdsContainer, GcdsSideNav, GcdsNavGroup, GcdsNavLink,
  GcdsHeading, GcdsText, GcdsGrid, GcdsGridCol, GcdsCard, GcdsAlert,
  GcdsDateModified,
} from '@gcds-core/components-react';

export default function Dashboard({ locale, user, announcements }: DashboardProps) {
  const t = locale === 'fr'
    ? { home: 'Tableau de bord', overview: 'Aperçu', tasks: 'Tâches', reports: 'Rapports', welcome: `Bonjour, ${user.firstName}`, primary: 'Tâches prioritaires', recent: 'Activité récente', modified: '2026-04-15' }
    : { home: 'Dashboard', overview: 'Overview', tasks: 'Tasks', reports: 'Reports', welcome: `Hello, ${user.firstName}`, primary: 'Priority tasks', recent: 'Recent activity', modified: '2026-04-15' };

  return (
    <>
      <GcdsHeader skipToHref="#main" langHref={locale === 'fr' ? '/en/dashboard' : '/fr/tableau-de-bord'} />

      <GcdsContainer layout="page">
        <GcdsGrid columns="240px 1fr" gap="500">
          <GcdsGridCol>
            <GcdsSideNav label={locale === 'fr' ? 'Navigation secondaire' : 'Secondary navigation'}>
              <GcdsNavLink href={`/${locale}/dashboard`}>{t.overview}</GcdsNavLink>
              <GcdsNavGroup menuLabel={t.tasks} openTrigger={t.tasks}>
                <GcdsNavLink href={`/${locale}/tasks/open`}>{locale === 'fr' ? 'Ouvertes' : 'Open'}</GcdsNavLink>
                <GcdsNavLink href={`/${locale}/tasks/closed`}>{locale === 'fr' ? 'Fermées' : 'Closed'}</GcdsNavLink>
              </GcdsNavGroup>
              <GcdsNavLink href={`/${locale}/reports`}>{t.reports}</GcdsNavLink>
            </GcdsSideNav>
          </GcdsGridCol>

          <GcdsGridCol>
            <main id="main">
              <GcdsHeading tag="h1">{t.welcome}</GcdsHeading>

              {announcements.map(a => (
                <GcdsAlert key={a.id} alertRole={a.severity} heading={a.heading}>
                  <p>{a.body}</p>
                </GcdsAlert>
              ))}

              <section aria-labelledby="primary-tasks" className="mb-600">
                <GcdsHeading tag="h2" id="primary-tasks">{t.primary}</GcdsHeading>
                <GcdsGrid columns="1fr 1fr" gap="300">
                  <GcdsGridCol><GcdsCard cardTitle={locale === 'fr' ? 'Demandes ouvertes' : 'Open applications'} description="12" href={`/${locale}/tasks/open`} /></GcdsGridCol>
                  <GcdsGridCol><GcdsCard cardTitle={locale === 'fr' ? 'En attente' : 'Pending review'} description="3" href={`/${locale}/tasks/pending`} /></GcdsGridCol>
                </GcdsGrid>
              </section>

              <section aria-labelledby="recent" className="mb-600">
                <GcdsHeading tag="h2" id="recent">{t.recent}</GcdsHeading>
                {/* activity feed */}
              </section>

              <GcdsDateModified>{t.modified}</GcdsDateModified>
            </main>
          </GcdsGridCol>
        </GcdsGrid>
      </GcdsContainer>

      <GcdsFooter />
    </>
  );
}
```

## Why each region

| Region | Reason |
| --- | --- |
| Top-level `<GcdsGrid columns="240px 1fr">` | Fixed sidebar, fluid main. 240px gives side nav breathing room without over-eating main content. |
| `<GcdsSideNav>` with explicit `label` | Named `<nav>` landmark. Side nav hosts app-level navigation; header top nav hosts sitewide. |
| Main content as native `<main id="main">` inside the grid col | Skip-link target. Don't re-wrap in `<gcds-container tag="main">` here because the outer container is already `layout="page"` and this main is inside a grid col. |
| `<GcdsAlert>` region for announcements | Mount alerts above the h1's peer content — they're contextual to the dashboard, not the service. |
| `<section aria-labelledby>` per widget | Lets assistive tech enumerate sections without relying on visual layout. |
| `<GcdsDateModified>` | Canada.ca requirement. Still applicable on internal dashboards. |

## Accessibility landmarks

- `<header role="banner">` (header)
- `<nav aria-label="Secondary navigation">` (side nav)
- `<main id="main">` (dashboard main)
- `<footer role="contentinfo">` (footer)

One `<main>` per page even when it's nested inside a grid. If the side nav is collapsible on mobile, ensure it re-lands focus correctly when toggled — and that focus is never trapped behind a closed drawer.

## Responsive behaviour

On viewports < 768px, collapse the side nav into a menu button. At that breakpoint:

- Change `columns` from `"240px 1fr"` to `"1fr"`.
- Hide the side nav by default; reveal via a toggle that manages focus.

## Bilingual notes

- `langHref` toggles dashboard language. Auth and session carry across.
- Slugs in `href` change per locale (`/en/tasks/open` ↔ `/fr/taches/ouvertes`).
- User's first name is displayed as-is — do not translate user-authored content.
- Alert headings/bodies translate per the backend's per-locale content store.

## Related

- [layout pattern](../patterns/layout.md)
- [navigation pattern](../patterns/navigation.md)
- [feedback pattern](../patterns/feedback.md)
- [authenticated-layout example](../examples/authenticated-layout.tsx)
