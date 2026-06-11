import { formatDate } from './format-date.mjs';

export function App({ updatedAt }: { updatedAt: string }) {
  return <main>Catalogue — updated {formatDate(updatedAt)}</main>;
}
