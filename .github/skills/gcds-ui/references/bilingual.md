
# Bilingual (EN/FR)

Every GC service must ship in **both official languages**. GCDS is built bilingual-first — components auto-translate their internal strings, and you are responsible for the app-authored content.

## Core invariants

1. **Set `<html lang="...">` at the document root.** Every GCDS component reads the language through `assignLanguage(el)` in `packages/web/src/utils/utils.ts`. The resolver walks up the DOM to the nearest `[lang]` ancestor — if nothing is found, it defaults to `en`.
2. **`lang` is resolved to exactly `'en'` or `'fr'`.** Anything that isn't `'en'` is treated as `'fr'`. There is no third language. Don't pass `'en-CA'` or `'fr-CA'` at the component level — the parser strips to the base.
3. **Flip `lang` to re-render components.** Changing the `lang` attribute on an ancestor triggers `MutationObserver` hooks (see `observerConfig` in `utils.ts`) — components pick up the switch without a remount.
4. **Pair every route with a language counterpart.** `/en/contact` ↔ `/fr/contactez`. Slugs are localized; do not leak English slugs into the French tree.
5. **`<gcds-lang-toggle>` only toggles language. You provide the URL mapping.** The component needs an `href` that points to the equivalent-language route. Wire this from your router; see [gcds-lang-toggle](../components/gcds-lang-toggle.md).

## How components translate

Each component ships its own `i18n/i18n.js` with a simple shape:

```js
const I18N = {
  en: { label: 'Opens in a new tab.' },
  fr: { label: "S'ouvre dans un nouvel onglet." },
};
export default I18N;
```

The component calls `assignLanguage(this.el)` on load and uses `I18N[lang].label`. No runtime translation framework is required — strings are bundled at build time.

This means:

- **You cannot override the component's internal strings.** If the built-in translation is wrong, file an upstream issue — don't monkey-patch.
- **All user-authored content (props, slots) is your responsibility.** `<gcds-button>Submit</gcds-button>` — the word `Submit` is yours to translate.

## Pattern: bilingual-aware component

```tsx
import { GcdsButton } from '@gcds-core/components-react';

function SubmitButton({ locale }: { locale: 'en' | 'fr' }) {
  const label = locale === 'fr' ? 'Soumettre' : 'Submit';
  return (
    <GcdsButton type="submit" lang={locale}>
      {label}
    </GcdsButton>
  );
}
```

- Pass `lang` explicitly when a subtree renders in one language but the document is in the other (e.g. a bilingual landing page).
- Otherwise `<html lang="...">` is enough — the component resolves upward.

## Pattern: locale switch at the route layer

```tsx
function LocaleShell({ locale, children }: { locale: 'en' | 'fr'; children: ReactNode }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return <>{children}</>;
}
```

Next.js: set `lang` in the root `layout.tsx` based on the segment. Vite + React Router: do the effect shown above.

## Content rules

| Rule | Why |
| --- | --- |
| FR text averages ~25% longer than EN. | Budget layout accordingly. Don't fix button widths. |
| Use sentence case in FR, not title case. | Matches Canada.ca style. |
| Canadian accented characters are required in FR (`é`, `à`, `ç`, `ï`, `œ`, etc.). | Never strip accents; Noto Sans renders them. |
| Dates: `YYYY-MM-DD` in both languages; long-form switches: "April 15, 2026" / "15 avril 2026". | ISO for form inputs, long-form for display. |
| Numbers: use non-breaking space as thousands separator in FR (`1 000`). In EN, a comma (`1,000`). | |
| Don't mirror layout direction. | FR is LTR like EN. |

## Language toggle

```tsx
import { GcdsLangToggle } from '@gcds-core/components-react';

<GcdsLangToggle href={`/fr${currentPath}`} lang="en" />
```

The toggle itself labels as "Français" when `lang="en"` and "English" when `lang="fr"` — the text flips to the *target* language so users see the language they'd be switching to.

## Testing

- Every route: visit EN and FR, confirm no fallbacks to English, no hardcoded strings leak.
- Screen reader in FR: voice should match. VoiceOver on macOS allows per-site language preferences.
- Spot-check automated translations with a native French speaker. Machine translation is not sufficient for public-facing content.

## Never

- Pass `lang` only on children, leaving the root English. Set it on `<html>` or the top container.
- Translate the `gcds-*` tag name or React component name — those are language-independent identifiers.
- Hardcode `'en'` in prop values — always source from the app's locale state.
