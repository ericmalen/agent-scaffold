// Paginated table (native <table> styled with GCDS tokens; gcds-data-table isn't shipped in v1.1.0).
// Sorts client-side; paginates via <gcds-pagination>. Drop into any page that needs a list of records.
import { useMemo, useState } from 'react';
import { GcdsPagination, GcdsHeading, GcdsText } from '@gcds-core/components-react';

type Row = { id: string; date: string; number: string; amount: number; status: 'open' | 'closed' };

type SortKey = 'date' | 'number' | 'amount';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 10;

const COPY = {
  en: { heading: 'Invoices', caption: 'Invoice list', date: 'Date', number: 'Number', amount: 'Amount', status: 'Status', noResults: 'No invoices found.' },
  fr: { heading: 'Factures', caption: 'Liste des factures', date: 'Date', number: 'Numéro', amount: 'Montant', status: 'Statut', noResults: 'Aucune facture trouvée.' },
} as const;

function formatAmount(amount: number, locale: 'en' | 'fr') {
  return new Intl.NumberFormat(locale === 'fr' ? 'fr-CA' : 'en-CA', { style: 'currency', currency: 'CAD' }).format(amount);
}

export default function PaginatedTable({ rows, locale }: { rows: Row[]; locale: 'en' | 'fr' }) {
  const t = COPY[locale];
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = a[sortKey] as any;
      const bv = b[sortKey] as any;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageSlice = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const ariaSort = (key: SortKey): 'ascending' | 'descending' | 'none' =>
    sortKey !== key ? 'none' : sortDir === 'asc' ? 'ascending' : 'descending';

  return (
    <section aria-labelledby="list-heading">
      <GcdsHeading tag="h2" id="list-heading">{t.heading}</GcdsHeading>

      {rows.length === 0 ? (
        <GcdsText>{t.noResults}</GcdsText>
      ) : (
        <>
          <table className="gcds-table">
            <caption>{t.caption}</caption>
            <thead>
              <tr>
                <th scope="col" aria-sort={ariaSort('date')}>
                  <button type="button" onClick={() => toggleSort('date')}>{t.date}</button>
                </th>
                <th scope="col" aria-sort={ariaSort('number')}>
                  <button type="button" onClick={() => toggleSort('number')}>{t.number}</button>
                </th>
                <th scope="col" aria-sort={ariaSort('amount')}>
                  <button type="button" onClick={() => toggleSort('amount')}>{t.amount}</button>
                </th>
                <th scope="col">{t.status}</th>
              </tr>
            </thead>
            <tbody>
              {pageSlice.map(r => (
                <tr key={r.id}>
                  <td>{r.date}</td>
                  <td>{r.number}</td>
                  <td>{formatAmount(r.amount, locale)}</td>
                  <td>{r.status === 'open' ? (locale === 'fr' ? 'Ouverte' : 'Open') : (locale === 'fr' ? 'Fermée' : 'Closed')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <GcdsPagination
            display="list"
            label={locale === 'fr' ? 'Pagination des factures' : 'Invoice pagination'}
            totalPages={totalPages}
            currentPage={page}
          />
        </>
      )}

      <style>{`
        .gcds-table { width: 100%; border-collapse: collapse; font-family: var(--gcds-font-families-body); }
        .gcds-table caption { text-align: start; padding-block-end: var(--gcds-spacing-200); color: var(--gcds-text-secondary); }
        .gcds-table th, .gcds-table td { padding: var(--gcds-spacing-200); border-block-end: 1px solid var(--gcds-border-default); text-align: start; }
        .gcds-table th { background: var(--gcds-bg-light); color: var(--gcds-text-primary); font-weight: var(--gcds-font-weights-bold); }
        .gcds-table th button { all: unset; cursor: pointer; color: inherit; font: inherit; }
        .gcds-table th button:focus-visible { outline: 2px solid var(--gcds-focus-border); outline-offset: 2px; }
      `}</style>
    </section>
  );
}
