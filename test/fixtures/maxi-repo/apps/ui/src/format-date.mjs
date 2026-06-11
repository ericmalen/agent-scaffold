// Pure date helper used by the catalogue header.
export function formatDate(iso) {
  const [year, month, day] = iso.split('T')[0].split('-');
  return `${day}/${month}/${year}`;
}
