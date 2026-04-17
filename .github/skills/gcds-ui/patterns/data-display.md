
# Data display

GCDS ships components for individual records (`gcds-card`, `gcds-details`) but **no implemented table component in v1.1.0** — the `data-table` docs slug is a placeholder. Build tables with native HTML styled with GCDS tokens.

## When to use this pattern

Presenting lists, records, or structured data to read (not edit). For editing, see [forms](./forms.md).

## Card lists (recommended for 2–20 records with heterogeneous fields)

```tsx
<GcdsContainer layout="grid">
  {items.map(item => (
    <GcdsCard
      key={item.id}
      cardTitle={item.title}
      description={item.summary}
      href={`/items/${item.id}`}
    />
  ))}
</GcdsContainer>
```

Accessibility:

- Each card is a single clickable region via `href`. Screen readers announce it once.
- `cardTitle` drives the visible heading; pair with `href` for landmark-quality navigation.

## Disclosure (progressive reveal)

Use `<gcds-details>` for optional or supplementary content — FAQ answers, "learn more" blocks, technical specs.

```tsx
<GcdsDetails detailsTitle="What documents do I need?">
  <p>You'll need a government-issued ID and proof of address.</p>
</GcdsDetails>
```

Do **not** use it to hide mandatory form fields or error content — anything required must be visible.

## Tables (until `gcds-data-table` ships)

Use native `<table>` with GCDS tokens. Keep the semantics; style with custom CSS using `var(--gcds-*)` tokens.

```tsx
<table className="gcds-table" aria-label="Invoices">
  <thead>
    <tr>
      <th scope="col">Date</th>
      <th scope="col">Number</th>
      <th scope="col">Amount</th>
    </tr>
  </thead>
  <tbody>
    {rows.map(r => (
      <tr key={r.id}>
        <td>{r.date}</td>
        <td>{r.number}</td>
        <td>{r.amount}</td>
      </tr>
    ))}
  </tbody>
</table>
```

```css
.gcds-table {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--gcds-font-families-body);
}
.gcds-table th,
.gcds-table td {
  padding: var(--gcds-spacing-200);
  border-bottom: 1px solid var(--gcds-border-default);
  text-align: start;
}
.gcds-table th {
  color: var(--gcds-text-primary);
  background: var(--gcds-bg-light);
}
```

Required when building your own table:

- `<caption>` or `aria-label` to describe the table.
- `<th scope="col">` / `<th scope="row">` on every header cell.
- Sort controls implemented via `<button>` inside the `<th>`, with `aria-sort` updated on toggle.
- Pagination wired to `<gcds-pagination>` below the table.

## Paginated list

```tsx
<section aria-label="Results">
  {/* table or card list */}
  <GcdsPagination
    display="list"
    label="Results pagination"
    totalPages={totalPages}
    currentPage={currentPage}
    onGcdsClick={handlePageChange}
  />
</section>
```

See the [paginated-table example](../examples/paginated-table.tsx).

## Bilingual considerations

- Column headers, sort labels, and pagination default labels translate automatically inside `<gcds-pagination>` when `lang` is set on a parent.
- Numbers: FR uses non-breaking space as thousands separator (`1 000`), EN uses comma (`1,000`). Format on the render side.
- Dates: render ISO for sort stability; display long-form per locale.

## Common mistakes

| Mistake | Fix |
| --- | --- |
| Using `<div>` grids with `role="table"` | Use real `<table>` markup. Stop rebuilding semantics. |
| Omitting `<th scope>` | Column and row relationships break for screen readers. |
| Colouring the row border with a hex code | Use `var(--gcds-border-default)`. |
| Using `gcds-card` for dense data | Cards are for scannable records; switch to a table when rows are > 20 and fields are homogeneous. |
