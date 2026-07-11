# Nasara Agro — website

Marketing site for **Nasara Agro Trading Ltd** (Tamale): bulk maize, soya
beans and groundnuts, bought at the farm gate across Ghana's Northern Region
and trucked south by the load.

Built with **Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 ·
shadcn/ui (radix) · RTK Query · react-hook-form + Zod · Vitest**, following
the conventions shared with `dms-frontend` and `khadys-kitchen-frontend`.

## Design

The UI implements the **"Pale Husk v2.1"** design system from the Claude
Design project (Home v2, About, Contact, Components): a trading-house
paperwork aesthetic — husk surfaces, viridian bands, ochre-gold nailed tags,
ledger rules, document cards with hard offset shadows, rubber stamps, and the
signature warehouse **availability board**.

- Tokens live in `src/app/globals.css` (`@theme` brand colors mapped onto the
  shadcn variables) — use `bg-forest`, `text-soil`, `shadow-doc`, `.stencil`,
  `.texture-grain`, etc.
- Fonts: Bricolage Grotesque (display) · Public Sans (body) · Stardos Stencil
  (stencil utility), loaded via `next/font`.
- `/style-guide` (noindexed) renders the full live component sheet.

## Getting started

```bash
npm install
cp .env.example .env.local   # SERVER_URI empty = use the built-in API stubs
npm run dev
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` / `start` | Production build / serve |
| `npm test` / `test:watch` | Vitest (unit + component, jsdom) |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

## Architecture notes

- **Server Components by default**; `"use client"` only on interactive leaves
  (header menus, enquiry form, style-guide demos).
- **Data layer**: one `createApi` in `src/redux/api-slice.ts`; features attach
  via `injectEndpoints` (see `src/redux/enquiries/`). The store is a
  per-request `makeStore()` factory mounted by `store-provider.tsx`.
- **Backend seam**: with `NEXT_PUBLIC_SERVER_URI` empty, requests hit this
  app's own `app/api/v1/*` route handlers — a stand-in that speaks the exact
  envelope the real API will (`{ message, data }` / `{ status, message,
  details.errors[] }`). Point the env var at the real origin and nothing else
  changes.
- **Forms**: react-hook-form + Zod (`src/validations/`), submit via
  `mutation(...).unwrap()`, errors through `extractApiError` → inline field
  errors + a `notify` toast for transport failures.
- **SEO**: `pageMetadata()` (`src/lib/seo.ts`) clamps titles/descriptions and
  sets canonicals; `opengraph-image.tsx` + `icon.tsx` generate brand images at
  runtime; `manifest.ts`, `sitemap.ts`, `robots.ts` complete the set.
- **System states**: `LoadingScreen` (the plank-board loader),
  `DataTableSkeleton`, `FormSkeleton`, `EmptyState` ("nothing on file"),
  `ErrorMessage` ("NOT PROCESSED" stamp), `ConfirmationDialog` +
  `useConfirm()` — all on `/style-guide`.

## Pages

`/` (Home v2) · `/commodities` (the board + lot files) · `/land` (plot
register, papers first) · `/farming-investment` (farmers/partners + season
timeline) · `/about` · `/contact` (live enquiry form, deep-linkable with
`?subject=` and `?about=`) · `/pay` (sale lookup + Hubtel payment states,
minimal chrome, noindex; demo refs `NA-1042` outstanding / `NA-1017`
settled) · `/style-guide` (internal).

Photography: Wikimedia Commons contributors (CC BY-SA), credited in the
footer.
