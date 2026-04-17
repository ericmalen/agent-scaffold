
# Foundations

GCDS style decisions live in **design tokens** — CSS custom properties prefixed `--gcds-`. Reference tokens instead of hard-coding colours, font sizes, or pixel values: `var(--gcds-text-primary)` not `#333333`.

## Token layers

| Layer | Purpose | Use when |
| --- | --- | --- |
| **Component tokens** | Per-component internals (e.g. button padding). Owned by the component. | Never reach into these from app code — they can change on any component update. |
| **Global tokens** | Semantic site-wide tokens for text, link, background, border, danger, disabled, focus. | First choice for any layout, text, or state styling. |
| **Base tokens** | Raw palette values (e.g. `--gcds-color-blue-500`). Non-semantic. | Only when no global token fits. Document the decision. |

Token name shape: `--gcds-<category>-<role>-<state>-<property>-<scale>` — not every token uses every segment.

## Colour — global tokens

All pairings below meet or exceed WCAG 2.1 AA contrast. Verify custom combinations with WebAIM Contrast Checker.

### Text

| Token | Hex | Contrast | Purpose |
| --- | --- | --- | --- |
| `--gcds-text-light` | `#ffffff` | 1 | On shade ≥ 700 (e.g. `--gcds-bg-dark`). |
| `--gcds-text-primary` | `#333333` | 12.63 | On shade ≤ 50 (e.g. `--gcds-bg-white`). |
| `--gcds-text-secondary` | `#595959` | 7 | Alternative on light backgrounds. |

### Link

| Token | Hex | Contrast | Purpose |
| --- | --- | --- | --- |
| `--gcds-link-default` | `#1f497a` | 9.16 | Default on white. |
| `--gcds-link-hover` | `#1354ec` | 5.98 | Hover on white. |
| `--gcds-link-light` | `#ffffff` | 1 | On shade ≥ 700. |
| `--gcds-link-visited` | `#4b248f` | 10.77 | Visited on white. |

### Background

| Token | Hex | Contrast | Purpose |
| --- | --- | --- | --- |
| `--gcds-bg-dark` | `#333333` | 12.63 | Pairs with `--gcds-text-light`. |
| `--gcds-bg-light` | `#f2f2f2` | 1.11 | Alt to white. Pairs with `--gcds-text-primary`. |
| `--gcds-bg-primary` | `#26374a` | 12.15 | Highlight background. Pairs with `--gcds-text-light`. |
| `--gcds-bg-white` | `#ffffff` | 1 | Default. Pairs with `--gcds-text-primary`. |

### Border

| Token | Hex | Purpose |
| --- | --- | --- |
| `--gcds-border-default` | `#8c8c8c` | Borders and icons on white. |

### State — danger / disabled / focus

| Token | Hex | Use |
| --- | --- | --- |
| `--gcds-danger-background` / `-border` / `-text` | `#b3192e` | Destructive or critical feedback. |
| `--gcds-disabled-background` | `#d9d9d9` | Disabled element background. |
| `--gcds-disabled-text` | `#808080` | Disabled element text. |
| `--gcds-focus-background` / `-border` | `#1354ec` | Exclusively for focus rings. |
| `--gcds-focus-text` | `#ffffff` | On focus background. |

## Colour — base tokens (palette)

Reach for these only when no global token fits. Palette families: `blue`, `grayscale`, `green`, `purple`, `red`, `yellow` — each with scale steps from 50 (lightest) through 900+ (darkest). Plus `--gcds-color-black` / `--gcds-color-white`. Names follow `--gcds-color-<family>-<scale>`.

## Typography

All typography tokens track a **vertical rhythm** based on `1.25rem` (20px). Line-lengths should stay ≤ 65 characters — cap paragraph width at `65ch` or use `--gcds-text-character-limit`.

### Heading tokens

| Token | Value |
| --- | --- |
| `--gcds-font-h1` | `700 2.56rem / 117% 'Lato', sans-serif` |
| `--gcds-font-h2` | `700 2.44rem / 123% 'Lato', sans-serif` |
| `--gcds-font-h3` | `700 1.81rem / 137% 'Lato', sans-serif` |
| `--gcds-font-h4`, `-h5`, `-h6` | (see upstream docs for full scale) |

Rule: start main content with `<h1>`, one per page. Never skip levels. Match heading font size with heading line-height — the token bundles both.

### Text tokens

| Token | Value |
| --- | --- |
| `--gcds-font-text` | `400 1.25rem / 160% 'Noto Sans', sans-serif` |
| `--gcds-font-text-small` | `400 1.13rem / 155% 'Noto Sans', sans-serif` |

### Font families

| Token | Value |
| --- | --- |
| `--gcds-font-families-heading` | `'Lato', sans-serif` |
| `--gcds-font-families-body` | `'Noto Sans', sans-serif` |
| `--gcds-font-families-monospace` | `'Noto Sans Mono', monospace` |
| `--gcds-font-families-icons` | `'gcds-icons'` |

Use body for everything that isn't a heading. Monospace for code citations only.

### Weights

| Token | Value |
| --- | --- |
| `--gcds-font-weights-light` | `300` |
| `--gcds-font-weights-regular` | `400` |
| `--gcds-font-weights-medium` | `500` |
| `--gcds-font-weights-semibold` | `600` |
| `--gcds-font-weights-bold` | `700` |

Headings already use bold — don't stack additional bold. Limit to two or three weights per surface.

### Italics

Use for citing Canadian law (e.g. *Accessible Canada Act*). Keep short — long italic passages are hard to read.

## Spacing

Based on the same `1.25rem` vertical rhythm as typography. Use small tokens to group related elements; larger tokens separate logical groups.

| Token | Pixel | Rem |
| --- | --- | --- |
| `--gcds-spacing-0` | 0px | 0rem |
| `--gcds-spacing-25` | 2px | 0.125rem |
| `--gcds-spacing-50` | 4px | 0.25rem |
| `--gcds-spacing-75` | 6px | 0.375rem |
| `--gcds-spacing-100` | 8px | 0.5rem |
| `--gcds-spacing-150` | 12px | 0.75rem |
| `--gcds-spacing-200` | 16px | 1rem |
| `--gcds-spacing-250` | 20px | 1.25rem |
| `--gcds-spacing-300` | 24px | 1.5rem |
| `--gcds-spacing-400` | 32px | 2rem |
| `--gcds-spacing-500` | 40px | 2.5rem |
| `--gcds-spacing-600` | 48px | 3rem |
| `--gcds-spacing-700` | 56px | 3.5rem |
| `--gcds-spacing-800` | 64px | 4rem |
| `--gcds-spacing-1000` | 80px | 5rem |
| `--gcds-spacing-1250` | 100px | 6.25rem |

Full scale runs `spacing-0` through `spacing-1250` in 25-unit increments (2px steps). Each step is a 0.125rem jump.

## Grid

`<gcds-grid>` and `<gcds-grid-col>` wrap the GCDS grid. See [gcds-grid](../components/gcds-grid.md) and [gcds-container](../components/gcds-container.md).

## Motion

The GCDS docs do not publish motion tokens at v1.1.0. Avoid custom transitions on GCDS components. If you need motion on your own markup, respect `prefers-reduced-motion`.

## Bilingual

Tokens are language-independent. Font family `'Noto Sans'` renders the full glyph set for EN and FR, including accented characters. Do not override the font stack on bilingual surfaces — the fallbacks are tested.
