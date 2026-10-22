# HEM Platform — Design System & Design Practices

This document captures the **design direction**, the **design skills/techniques**
applied, and the concrete **tokens, type, components, and motion** used across the
web app (Next.js + Tailwind) and the mobile field app (Flutter + Material 3).

Goal: one coherent brand expressed in two runtimes, production-grade and
accessible, distinctive rather than "default AI" looking.

---

## 1. Design direction — "land-&-earth trust"

HEM does **property valuation** for lenders. The brand should feel grounded,
trustworthy, and editorial — closer to a serious surveying/finance house than a
generic SaaS dashboard.

Core ideas:
- **Warm paper canvas**, not cold grey — the product feels like considered
  paperwork, not a spreadsheet.
- **Deep evergreen** as the single confident brand color (land, growth, stability).
- **Warm sand/gold** as a sparing accent (value, premium, highlight).
- **Editorial typography**: a serif display voice (Fraunces) over a clean
  grotesque body (Hanken Grotesk) — gravitas + legibility.
- **Quiet depth & restraint**: soft shadows, thin warm lines, generous space, and
  small crafted motion instead of heavy chrome.

---

## 2. Design skills & techniques applied

These are the design practices intentionally used in this project:

1. **Design tokens / single source of truth.** All color, type, radius, shadow,
   and motion values live as CSS custom properties (web `@theme`) and a `HemColors`
   palette (Flutter). Components never hardcode hex; they reference tokens. This
   guarantees web/mobile parity and easy theming.
2. **Type pairing & hierarchy.** A serif display + grotesque body pairing, with a
   deliberate type scale (display → headline → title → body → caption) and
   negative tracking on large serif for an editorial feel.
3. **Restrained color system.** One dominant brand color, one accent used
   sparingly, semantic status colors (success/warning/danger), and neutrals tuned
   warm (paper/ink) rather than pure black/white/grey.
4. **Atmosphere over flatness.** Layered radial gradients on the canvas + a
   topographic brand panel give depth without clutter; soft two-layer card shadow
   instead of hard borders.
5. **Component-driven UI.** A small primitive library (Button, Card, Input,
   Select, Badge, Field, EmptyState, Modal) styled once on tokens — consistent
   focus rings, radii, and transitions everywhere.
6. **Layout & spacing system.** Centered max-width content, a structured app
   shell (sidebar + topbar), grouped navigation by domain, and a consistent
   spacing rhythm.
7. **Purposeful motion / micro-interactions.** Staggered page-load reveals,
   hover lift on interactive cards, spinner states on async actions, and smooth
   focus/transition easing — all subtle and fast.
8. **Responsive / adaptive design.** Mobile-first breakpoints, sidebar that
   collapses to a slide-over, fluid grids, and horizontally scrollable tables.
9. **Accessibility-minded choices.** Visible focus rings, AA-minded contrast on
   ink/paper and on the brand, `prefers-reduced-motion` support, and ≥44–52px
   touch targets in the mobile app.
10. **Cross-platform brand parity.** The same tokens, type pairing, and
    component language re-expressed natively in Flutter Material 3 (not a webview),
    so the field app feels part of the same product.
11. **State & feedback design.** Explicit empty states, loading/spinner states,
    inline error surfaces, status badges, and progress indicators (e.g. the
    field-photo `done / total` checklist).
12. **Information design for workflow.** The case lifecycle is shown as a vertical
    stepper; document/photo coverage as checklists — turning process into legible
    visual status.

> Tooling note: the web UI was built following the `frontend-design` skill's
> principles (distinctive, token-driven, non-generic interfaces). The mobile UI
> mirrors the same system in Material 3.

---

## 3. Color system

Warm neutrals + one brand + one accent + semantic status.

| Role | Token (web) | Flutter | Hex | Usage |
| --- | --- | --- | --- | --- |
| Canvas | `--color-paper` | `HemColors.paper` | `#F7F4EC` | App background |
| Canvas alt | `--color-paper-2` | — | `#F1EDE2` | Subtle fills |
| Surface | `--color-surface` | `HemColors.surface` | `#FFFFFF` | Cards, inputs |
| Ink (text) | `--color-ink` | `HemColors.ink` | `#18241F` | Primary text |
| Muted text | `--color-muted` | `HemColors.muted` | `#6C7A72` | Secondary text |
| Line | `--color-line` | `HemColors.line` | `#E6E0D2` | Borders/dividers |
| Line strong | `--color-line-strong` | — | `#D8D1BF` | Scrollbars/stronger edges |
| **Brand** | `--color-brand` | `HemColors.brand` | `#1C5C44` | Primary actions, nav |
| Brand dark | `--color-brand-dark` | `HemColors.brandDark` | `#143F2F` | Hover/depth |
| Brand tint | `--color-brand-tint` | — | `#E7EFE9` | Selected/quiet brand fills |
| **Accent (sand)** | `--color-sand` | `HemColors.sand` | `#B3863A` | Sparing highlights, avatar |
| Sand tint | `--color-sand-tint` | — | `#F4ECD9` | Accent fills |
| Success | `--color-success` | `HemColors.success` | `#1F7A52` | Approved/done |
| Warning | `--color-warning` | — | `#B3863A` | Pending |
| Danger | `--color-danger` | `HemColors.danger` | `#B4412F` | Errors/rejected |

**Rules of use**
- Brand is the only "loud" color — reserved for primary actions, active nav, and
  key emphasis. Accent (sand) appears rarely (avatar, a highlight) to stay premium.
- Status colors are used only for status (badges, validation), never decoration.
- Neutrals skew warm to match the paper canvas; avoid pure `#000`/`#fff` for text.

---

## 4. Typography

Pairing: **Fraunces** (serif display) + **Hanken Grotesk** (sans body).

- **Web:** loaded via `next/font/google` (self-hosted, no layout shift); exposed as
  `--font-display` and `--font-sans`; `.font-display` adds `-0.01em` tracking.
- **Mobile:** loaded via `google_fonts` (`GoogleFonts.fraunces` for display/titles,
  `GoogleFonts.hankenGroteskTextTheme()` for body).

Scale & intent:
| Level | Font | Use |
| --- | --- | --- |
| Display | Fraunces 600, tight tracking | Page heroes, big stat numbers |
| Headline / Title | Fraunces 600 | Section + card titles |
| Body | Hanken Grotesk 400 | Paragraphs, form text |
| Label / Caption | Hanken Grotesk 500–600, smaller | Field labels, meta, badges |

Why: the serif gives the editorial "trust house" voice on headings and numbers,
while the grotesque keeps dense operational UI highly legible.

---

## 5. Shape, depth & space

- **Radius:** `--radius: 0.75rem` (12px) baseline; pills (`9999px`) for badges,
  progress bars, and avatars.
- **Shadow:** one soft, two-layer card shadow
  `0 1px 2px rgba(24,36,31,.04), 0 8px 24px -12px rgba(24,36,31,.12)` — depth
  without heaviness. Borders use warm `line` tokens rather than grey.
- **Atmosphere:** fixed dual radial gradients (evergreen top-right, sand
  bottom-left at ~6% opacity) layered on paper for subtle dimension.
- **Spacing:** consistent rhythm (cards `p-4`–`p-6`, sections `space-y-6`),
  centered max-width content column, and breathing room over density.
- **Details:** thin warm custom scrollbars; brand-colored text selection.

---

## 6. Motion & micro-interactions

- **Page-load reveal:** `animate-rise` keyframe (opacity + 8px translateY) on a
  fast `cubic-bezier(0.22, 1, 0.36, 1)`; staggered across dashboard cards.
- **Hover/active:** interactive cards lift subtly; buttons/links transition color
  and shadow smoothly.
- **Async feedback:** inline spinners (`Loader2` / `CircularProgressIndicator`) on
  buttons during submit, upload, generate.
- **Focus:** clear brand focus rings (`--color-brand-ring`) on inputs/controls.
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` disables reveals.

---

## 7. Components (web primitive library)

Styled once on tokens in `web/src/components/ui.tsx`:
- **Button** — variants (solid brand / outline), sizes, spinner + disabled states.
- **Card / CardHeader / CardTitle / CardBody** — the core surface, soft shadow.
- **Input / Select / Field / Label** — consistent height, radius, focus ring.
- **Badge** — status pills (success/warning/danger/brand tints).
- **EmptyState** — icon + message for zero-data views.
- **Modal** — focus-managed dialog.

Composition examples: case **workflow stepper** (CheckCircle/Circle list),
**document** and **field-photo** checklists, **dashboard stat cards**.

---

## 8. App shell & navigation

- **Sidebar** (evergreen) with grouped nav by domain — Work / People / Admin —
  an active indicator, and a sand avatar for the signed-in user.
- **Topbar** — translucent, light, with page context.
- **Auth** — split-screen login/reset: editorial `BrandPanel` (topographic
  texture, trust stats) beside a focused form.
- **Responsive** — sidebar collapses to a slide-over on small screens; content
  column stays centered and max-width on large screens.

---

## 9. Mobile (Flutter) parity

`mobile/lib/theme.dart` re-expresses the system natively:
- `ColorScheme.fromSeed` on the evergreen brand + sand secondary; paper scaffold.
- Fraunces + Hanken via `google_fonts`.
- Themed `Card`, `InputDecoration`, `FilledButton`, `OutlinedButton`, `Chip`,
  `AppBar` — matching radii, lines, and brand colors.
- Screens: brand login, status-colored case cards, and the **per-slot field-photo
  checklist** (progress bar, camera/gallery actions, captured/replace states).
- Touch targets ≥48–52px; bottom-sheet source picker; floating snackbars colored
  by success/danger.

---

## 10. Accessibility & quality

- Contrast tuned for AA on ink/paper and white-on-brand.
- Visible focus states; semantic status colors paired with text/icons (not color
  alone).
- `prefers-reduced-motion` respected; fonts self-hosted to avoid layout shift.
- Consistent empty / loading / error states so the UI never "dead-ends".

---

## 11. Files that define the design

| Concern | File |
| --- | --- |
| Web tokens, atmosphere, motion | `web/src/app/globals.css` |
| Web fonts wiring | `web/src/app/layout.tsx` |
| Web primitives | `web/src/components/ui.tsx` |
| Web app shell / nav | `web/src/components/AppShell.tsx` |
| Mobile theme & tokens | `mobile/lib/theme.dart` |
| Mobile screens | `mobile/lib/screens/*.dart` |
