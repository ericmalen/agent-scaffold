
# List / detail

A page that presents a filterable, paginated list (e.g. applications, invoices, case files). Selecting an item navigates to a detail page.

## List page structure

```tsx
import {
  GcdsHeader, GcdsFooter, GcdsContainer, GcdsBreadcrumbs, GcdsBreadcrumbsItem,
  GcdsHeading, GcdsText, GcdsSelect, GcdsInput, GcdsButton,
  GcdsPagination, GcdsDateModified, GcdsCard,
} from '@gcds-core/components-react';

export default function ListPage({ locale, results, currentPage, totalPages }: ListPageProps) {
  const t = locale === 'fr'
    ? { home: 'Accueil', title: 'Demandes', filter: 'Filtrer par statut', search: 'Rechercher', apply: 'Appliquer', noResults: 'Aucun résultat' }
    : { home: 'Home', title: 'Applications', filter: 'Filter by status', search: 'Search', apply: 'Apply', noResults: 'No results' };

  return (
    <>
      <GcdsHeader skipToHref="#main" langHref={locale === 'fr' ? '/en/applications' : '/fr/demandes'}>
        <GcdsBreadcrumbs slot="breadcrumb">
          <GcdsBreadcrumbsItem href={locale === 'fr' ? '/fr' : '/en'}>{t.home}</GcdsBreadcrumbsItem>
        </GcdsBreadcrumbs>
      </GcdsHeader>

      <GcdsContainer tag="main" id="main" layout="page">
        <GcdsHeading tag="h1">{t.title}</GcdsHeading>

        <form role="search" aria-label={t.search} className="mb-500">
          <GcdsSelect selectId="status" name="status" label={t.filter}>
            <option value="">—</option>
            <option value="open">{locale === 'fr' ? 'Ouverte' : 'Open'}</option>
            <option value="closed">{locale === 'fr' ? 'Fermée' : 'Closed'}</option>
          </GcdsSelect>

          <GcdsInput type="search" inputId="q" name="q" label={t.search} />

          <GcdsButton type="submit" buttonRole="primary">{t.apply}</GcdsButton>
        </form>

        <section aria-label={t.title}>
          {results.length === 0 ? (
            <GcdsText>{t.noResults}</GcdsText>
          ) : (
            results.map(r => (
              <GcdsCard
                key={r.id}
                cardTitle={r.title}
                description={`${r.status} — ${r.date}`}
                href={`/${locale}/applications/${r.id}`}
              />
            ))
          )}
        </section>

        <GcdsPagination
          display="list"
          label={locale === 'fr' ? 'Pagination' : 'Pagination'}
          totalPages={totalPages}
          currentPage={currentPage}
        />

        <GcdsDateModified>2026-04-01</GcdsDateModified>
      </GcdsContainer>

      <GcdsFooter />
    </>
  );
}
```

## Detail page structure

```tsx
export default function DetailPage({ locale, item }: DetailPageProps) {
  const t = locale === 'fr'
    ? { home: 'Accueil', applications: 'Demandes', back: 'Retour à la liste', status: 'Statut', submitted: 'Soumise le' }
    : { home: 'Home', applications: 'Applications', back: 'Back to list', status: 'Status', submitted: 'Submitted on' };

  return (
    <>
      <GcdsHeader skipToHref="#main" langHref={`/${locale === 'fr' ? 'en' : 'fr'}/applications/${item.id}`}>
        <GcdsBreadcrumbs slot="breadcrumb">
          <GcdsBreadcrumbsItem href={`/${locale}`}>{t.home}</GcdsBreadcrumbsItem>
          <GcdsBreadcrumbsItem href={`/${locale}/applications`}>{t.applications}</GcdsBreadcrumbsItem>
        </GcdsBreadcrumbs>
      </GcdsHeader>

      <GcdsContainer tag="main" id="main" layout="page">
        <GcdsHeading tag="h1">{item.title}</GcdsHeading>
        <dl>
          <dt>{t.status}</dt>
          <dd>{item.status}</dd>
          <dt>{t.submitted}</dt>
          <dd>{item.submittedAt}</dd>
        </dl>
        <GcdsButton type="link" buttonRole="secondary" href={`/${locale}/applications`}>{t.back}</GcdsButton>
      </GcdsContainer>

      <GcdsFooter />
    </>
  );
}
```

## Why each region

| Region | Reason |
| --- | --- |
| `<form role="search">` | Filter/search combo needs the search landmark so screen readers can jump to it. |
| Filter `<GcdsSelect>` before the `<GcdsInput type="search">` | Most common filter first, freeform last. |
| Card per result vs table | See [data-display](../patterns/data-display.md) for the choice. |
| `<GcdsPagination>` below results | Always after the list. `totalPages` and `pageProp` driven by the server. |
| `<dl>` on detail page | Correct semantic for label/value pairs. Don't use a two-column table. |

## Accessibility landmarks

- List page: header / search (via `role="search"`) / main / footer.
- Detail page: header / main (with h1 at the top) / footer.
- Pagination sets `aria-current="page"` on the active link.

## Bilingual notes

- Cards' `href` includes the locale in the path (`/fr/...` or `/en/...`). The locale stays in the URL across pagination.
- Sort or filter values that users don't see stay in English (`value="open"`); visible labels translate.
- Dates: render ISO for the detail page's machine-readable metadata, long-form for display.

## Related

- [data-display pattern](../patterns/data-display.md)
- [navigation pattern](../patterns/navigation.md)
- [paginated-table example](../examples/paginated-table.tsx)
