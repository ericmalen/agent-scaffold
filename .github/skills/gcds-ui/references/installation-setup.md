
# Installation & Setup

As of v1.1.0 (`@gcds-core/components-v1.1.0` tag), package names are `@gcds-core/*`. The pre-v1 `@cdssnc/gcds-components*` packages are retired — do not install them.

## Packages

| Package | What it is |
| --- | --- |
| `@gcds-core/components` | The Stencil-built web components. Required by all framework wrappers. |
| `@gcds-core/components-react` | React wrapper. PascalCase exports (e.g. `GcdsButton`). |
| `@gcds-core/components-angular` | Angular wrapper. |
| `@gcds-core/components-vue` | Vue wrapper. |
| `@gcds-core/css-shortcuts` | Optional utility-class layer (flex, grid, spacing, colour). |

## React (Vite)

```bash
npm install @gcds-core/components @gcds-core/components-react
```

Optional utility layer:

```bash
npm install @gcds-core/css-shortcuts
```

In your entrypoint (e.g. `src/main.tsx`):

```tsx
import '@gcds-core/css-shortcuts/dist/gcds-css-shortcuts.min.css'; // optional
import '@gcds-core/components-react/gcds.css';
```

Import components where needed:

```tsx
import { GcdsHeader, GcdsFooter, GcdsContainer, GcdsButton } from '@gcds-core/components-react';

export default function App() {
  return (
    <>
      <GcdsHeader />
      <GcdsContainer tag="main" layout="page">
        <GcdsButton>Submit</GcdsButton>
      </GcdsContainer>
      <GcdsFooter />
    </>
  );
}
```

### `lang` on the document root

```html
<!-- index.html -->
<html lang="en">
```

Flip this dynamically per route in a locale shell — see [bilingual](./bilingual.md).

## Next.js (app router)

Stencil web components need the browser to upgrade custom elements. Use dynamic import or mark your tree as a client boundary.

```tsx
// app/layout.tsx
import '@gcds-core/components-react/gcds.css';

export default function RootLayout({ children, params }: { children: React.ReactNode; params: { locale: 'en' | 'fr' } }) {
  return (
    <html lang={params.locale}>
      <body>{children}</body>
    </html>
  );
}
```

```tsx
// app/[locale]/page.tsx  (client component for GCDS components)
'use client';
import { GcdsButton } from '@gcds-core/components-react';
```

For server components that must render a shell including GCDS, use the React wrapper's SSR hydrate build if/when available — at v1.1.0 the reactOutputTarget ships the client wrapper only (see the TODO in `packages/web/stencil.config.ts` for SSR status). Default to client components for any GCDS subtree.

## Angular

```bash
npm install @gcds-core/components @gcds-core/components-angular
```

Import `gcds.css` in `angular.json` `styles`. Add the module from `@gcds-core/components-angular`.

## Vue

```bash
npm install @gcds-core/components @gcds-core/components-vue
```

Install the plugin from `@gcds-core/components-vue` in `main.ts` and import `gcds.css` in your entry.

## Plain HTML

See `https://design-system.canada.ca/en/start-to-use/develop/html/` for the CDN-based setup. Not recommended for production apps.

## Verify the install

Two quick checks:

```tsx
import { GcdsButton } from '@gcds-core/components-react';
<GcdsButton>Test</GcdsButton>
```

If styling looks correct and the button has GCDS focus styles on `Tab`, the CSS import worked. If you see an unstyled element, the `gcds.css` import is missing or unreached.

## TypeScript

Types ship with the wrapper packages. No `@types/*` install required. If imports resolve but props aren't typed, check that `"moduleResolution": "Bundler"` or `"Node16"` is set in `tsconfig.json`.

## Version pinning

Pin the three `@gcds-core/*` packages to the **same minor**. Mixing `@gcds-core/components@1.1.0` with `@gcds-core/components-react@1.0.0` may work but is unsupported.

```json
{
  "dependencies": {
    "@gcds-core/components": "1.1.0",
    "@gcds-core/components-react": "1.1.0"
  }
}
```

## Upgrading from pre-v1

If migrating from `@cdssnc/gcds-components*`:

1. Replace package names: `@cdssnc/gcds-components-react` → `@gcds-core/components-react`.
2. Replace CSS import path.
3. Some components were renamed or deprecated — check the release notes at `https://github.com/cds-snc/gcds-components/releases` for the v0.x→v1.0 delta. Known deprecations include `gcds-checkbox` (singular, → `gcds-checkboxes`) and the old `radio-group` docs slug (use `gcds-radios`).
