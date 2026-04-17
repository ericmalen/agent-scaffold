// Authenticated app shell: header + side nav + main region + footer. Drop this at the route layout
// level (e.g. Next.js app/(auth)/layout.tsx or a Vite React Router <Outlet>). Side nav collapses
// on narrow viewports via a media-query CSS override.
import { ReactNode, useEffect } from 'react';
import {
  GcdsHeader, GcdsFooter, GcdsContainer,
  GcdsSideNav, GcdsNavGroup, GcdsNavLink,
  GcdsGrid, GcdsGridCol,
} from '@gcds-core/components-react';

type Locale = 'en' | 'fr';

const NAV = {
  en: {
    label: 'Secondary navigation',
    overview: 'Overview',
    tasks: 'Tasks',
    open: 'Open',
    closed: 'Closed',
    reports: 'Reports',
    settings: 'Settings',
  },
  fr: {
    label: 'Navigation secondaire',
    overview: 'Aperçu',
    tasks: 'Tâches',
    open: 'Ouvertes',
    closed: 'Fermées',
    reports: 'Rapports',
    settings: 'Paramètres',
  },
} as const;

export default function AuthenticatedLayout({
  children,
  locale,
  currentPath,
}: {
  children: ReactNode;
  locale: Locale;
  currentPath: string;
}) {
  const t = NAV[locale];
  const otherLocale: Locale = locale === 'en' ? 'fr' : 'en';

  // Keep <html lang> in sync with the current locale so GCDS assignLanguage resolves correctly.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  // Swap the locale prefix in the URL to generate the language-toggle href.
  const langHref = currentPath.replace(/^\/(en|fr)(\/|$)/, `/${otherLocale}$2`);

  return (
    <>
      <GcdsHeader skipToHref="#main" langHref={langHref} />

      <GcdsContainer layout="page">
        <GcdsGrid columns="240px 1fr" gap="500">
          <GcdsGridCol>
            <GcdsSideNav label={t.label}>
              <GcdsNavLink href={`/${locale}/dashboard`}>{t.overview}</GcdsNavLink>
              <GcdsNavGroup menuLabel={t.tasks} openTrigger={t.tasks}>
                <GcdsNavLink href={`/${locale}/tasks/open`}>{t.open}</GcdsNavLink>
                <GcdsNavLink href={`/${locale}/tasks/closed`}>{t.closed}</GcdsNavLink>
              </GcdsNavGroup>
              <GcdsNavLink href={`/${locale}/reports`}>{t.reports}</GcdsNavLink>
              <GcdsNavLink href={`/${locale}/settings`}>{t.settings}</GcdsNavLink>
            </GcdsSideNav>
          </GcdsGridCol>

          <GcdsGridCol>
            <main id="main">{children}</main>
          </GcdsGridCol>
        </GcdsGrid>
      </GcdsContainer>

      <GcdsFooter />

      {/* Responsive: collapse side nav at narrow viewports.
          Drop this into a global stylesheet in production. */}
      <style>{`
        @media (max-width: 48em) {
          gcds-grid { grid-template-columns: 1fr !important; }
          gcds-side-nav { display: none; }
          gcds-side-nav[data-open="true"] { display: block; }
        }
      `}</style>
    </>
  );
}
