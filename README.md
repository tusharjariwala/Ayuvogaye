# Ayuvoyage — Medical Tourism & Healthcare Discovery Template

A complete, frontend-only **healthcare discovery and hospital/doctor marketplace template** for India, built with React, TypeScript, Tailwind CSS and shadcn/ui. It ships three experiences — a public discovery website, provider portals (hospital and doctor) and a platform admin dashboard — all powered by **static, fictional mock data** and **simulated, browser-local actions**.

> **This is a UI starter template, not a production healthcare system.** There is no backend, database, real authentication, payment processing, or message delivery. Every provider, person, review, credential and figure is fictional. No action creates a real booking, sends a message, or performs a real verification.

---

## Quick start

Requirements: **Node.js 20.19+** (tested on Node 24) and **npm 10+**.

```bash
npm install
npm run dev        # start the dev server at http://localhost:5173
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with hot reload |
| `npm run build` | Type-checks (`tsc -b`) and creates a production build in `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run lint` | Lints `src/` with [oxlint](https://oxc.rs) (generated shadcn primitives in `src/components/ui` are excluded) |
| `npm run typecheck` | Strict TypeScript check for the app and the Vite config |

### Exploring the demo

1. Open the site and browse hospitals, doctors, treatments and specialties.
2. Go to **Sign in** (`/account/login`) and pick a **demo account**: Patient, Doctor, Hospital Admin, Staff or Platform Admin. No password is required.
3. Switch roles at any time from the avatar menu → **Switch demo role**.
4. Use **Reset demo data** (avatar menu or any Settings page) to restore the original sample data.

| Demo role | Lands on | Linked record |
| --- | --- | --- |
| Patient — Aarav Sharma | `/account/appointments` | own requests, favourites, notifications |
| Doctor — Dr. Meera Iyer | `/provider/doctor/dashboard` | doctor `d-001` |
| Hospital Admin — Kavita Deshmukh | `/provider/hospital/dashboard` | hospital `h-001` (Greenleaf Care Hospital, Pune) |
| Hospital Staff | `/provider/hospital/dashboard` | hospital `h-001` (lead management) |
| Platform Admin — Rohan Mehta | `/admin/dashboard` | whole platform |

---

## Tech stack

React 19 · TypeScript (strict) · Vite · Tailwind CSS v4 · shadcn/ui (Radix primitives) · Plus Jakarta Sans · Lucide icons · React Router · TanStack Table v8 · React Hook Form · Zod · Recharts · date-fns · Sonner.

TanStack Table is pinned to v8 because the shadcn/ui data-table pattern targets the v8 API.

---

## Routes

**Public:** `/` · `/hospitals` · `/hospitals/:city` · `/hospital/:slug` · `/doctors` · `/doctors/:city/:specialty` (either segment may be `all`) · `/doctor/:slug` · `/treatments` · `/treatment/:slug` · `/specialties/:slug` · `/compare/hospitals` · `/search` · `/about` · `/contact` · `/privacy` · `/terms` · `/report-profile`

**Account:** `/account/login` · `/account/register` · `/account/reset-password` · `/account/favourites` · `/account/appointments` (`?tab=enquiries`) · `/account/notifications` · `/account/profile` · `/account/settings`

**Hospital portal:** `/provider/hospital/{dashboard, profile, locations, departments, doctors, treatments, facilities, accreditations, availability, enquiries, appointments, reviews, analytics, settings}`

**Doctor portal:** `/provider/doctor/{dashboard, profile, qualifications, specialties, affiliations, availability, enquiries, appointments, reviews, settings}`

**Admin:** `/admin/{dashboard, users, hospitals, doctors, departments, specialties, treatments, locations, verifications, enquiries, appointments, reviews, reported-content, content, featured-listings, audit-logs, analytics, settings}`

All pages are lazy-loaded (`src/app/router.tsx`).

---

## Project structure

```
src/
├─ app/                  App.tsx, router.tsx, providers.tsx, navigation.ts, demo-store-provider.tsx
├─ components/
│  ├─ ui/                shadcn/ui primitives (generated via the shadcn CLI)
│  ├─ layout/            PublicLayout, DashboardLayout/AppSidebar/AppHeader, Breadcrumbs,
│  │                     CommandMenu (Ctrl/⌘+K), NotificationMenu, UserMenu, RequireRole
│  ├─ shared/            StatusBadge, VerificationBadge, trust badges, EntityCard/HospitalCard/
│  │                     DoctorCard/TreatmentCard, StatCard, ActivityTimeline, EmptyState,
│  │                     LoadingSkeleton, ErrorState, ConfirmDialog, EntityFormDialog, DetailsSheet,
│  │                     SearchInput, FacetFilter, FilterBar, PageHeader, demo notices
│  ├─ data-table/        DataTable, DataTableToolbar, DataTablePagination, column helpers
│  ├─ charts/            ChartCard + RevenueChart, PatientAcquisitionChart, EnquiryConversionChart,
│  │                     AppointmentStatusChart, ProviderDistributionChart, MonthlyTrendChart
│  ├─ forms/             FormField (RHF), AppointmentForm, EnquiryForm
│  └─ theme/             ThemeProvider, ThemeToggle
├─ features/             public, search, hospitals, doctors, treatments, specialties, comparison,
│                        account, appointments, enquiries, reviews, provider-hospital,
│                        provider-doctor, admin, notifications, settings
├─ data/                 one typed dataset per file + index.ts (seed) + selectors.ts
├─ hooks/                useDemoStore, useCollection, useFavourites, useCompare, useTheme
├─ lib/                  utils, constants, formatters, mock-storage, data-access, theme, demo-store
├─ types/                domain models
└─ styles/globals.css    Calm Healing design tokens (light + dark)
```

Path aliases: `@/components`, `@/features`, `@/data`, `@/lib`, `@/types`, `@/hooks` (all via `@/*` → `src/*`).

---

## Mock data & local persistence

- Datasets live in `src/data/*.ts` (users, cities, specialties, departments, facilities, accreditations, treatments, hospitals, doctors, affiliations, appointments, enquiries, reviews, verification cases, change requests, notifications, audit logs, favourites, featured listings, reported content, content pages, analytics series). IDs are stable and relationships are valid.
- `DemoStoreProvider` clones the seed into React state and mirrors it to `localStorage` (keys prefixed `hd-demo:`), so changes survive a refresh. **Reset demo data** restores the seed.
- `src/lib/data-access.ts` provides typed `search / filter / sort / paginate / create / update / delete` helpers; `src/data/selectors.ts` holds relational queries (doctors for a hospital, rating summaries, …). Pages never embed datasets.
- Phone numbers use the `+91 00000 …` pattern, emails use `example.com` / `example.in`, doctor registrations are explicit placeholders, and all reviews are labelled as sample content.

### Integrating a backend later

Replace the store's `create / update / remove` and the selectors with API calls (for example via TanStack Query), keeping the types in `src/types`. The UI only talks to `useDemoStore()`, selectors and `data-access` helpers, so the swap stays localised.

---

## Theme: Calm Healing

- **Light / Dark / System**, default **Light** for first-time visitors.
- Explicit choices persist in `localStorage` (`hd-theme`); System follows the OS live.
- An inline script in `index.html` applies the theme class before first paint to avoid a flash.
- Class-based dark mode (`.dark` on `<html>`, Tailwind v4 `@custom-variant`).
- All colours are CSS variables in `src/styles/globals.css`, mapped to shadcn tokens. Brand saffron is exposed as `highlight` (`bg-highlight`, `<Button variant="highlight">`) so shadcn's `accent` stays a subtle hover surface.
- Semantic colours each have base, `-foreground`, `-soft` (tinted background) and `-text` (AA-contrast text) tokens.
- Charts read `--chart-1…5`; the categorical palette was validated for colour-vision deficiency and contrast against both card surfaces.
- Theme switching never resets the route or demo data (the theme provider sits above the store and router).
- Appearance settings (any Settings page → Appearance) offer immediate preview and reset to default.

---

## Authentication & authorization (demo only)

`RequireRole` is a **client-side route guard used only to demonstrate navigation** between demo roles. It provides no security. A production system must implement authentication (sessions/tokens, OTP, identity providers) and enforce authorization on a backend. No OTPs, passwords or sessions are stored or verified here.

---

## Trust & safety conventions

- **Verification** states: Unverified, Submitted, Under Review, Verified, Rejected, Needs Reverification — each explained in tooltips and a "What does verification mean?" dialog. Providers can submit for verification but can never verify themselves; only the admin flow sets *Verified*.
- **Provider-submitted vs platform-verified** information is labelled on profiles.
- **Sponsored** listings are always labelled and never affect verification.
- **Hospital comparison** shows factual fields only — no winner score or "best" label.
- **Treatment prices** are shown only as illustrative estimates.
- No diagnosis, recommendations or medical advice; forms ask users not to include health details.

---

## Accessibility

Semantic landmarks and headings, a skip link, visible focus rings, labelled form controls with linked error messages, icon-button labels, status shown with icon + text (never colour alone), chart summaries plus a "view as table" toggle, keyboard-accessible menus and dialogs (Radix), and reduced-motion support. WCAG 2.2 AA is the design target; run your own audit before production use.

---

## Out of scope

Backend/database, real auth, AI diagnosis or medical advice, EMR storage, insurance claims, payments, real-time booking integrations, email/SMS/WhatsApp/push delivery, document uploads, visa/travel services.

---

## Customising

- **Brand:** tokens in `src/styles/globals.css`, `APP_NAME` in `src/lib/constants.ts`, and the Ayuvoyage SVG mark/wordmark (`BrandMark`, `BrandLogo`) in `src/components/shared/visuals.tsx` (favicon: `public/favicon.svg`).
- **Navigation:** `src/app/navigation.ts`.
- **Data:** edit or replace files in `src/data/`.
- **More shadcn components:** `npx shadcn@latest add <component>`.

---

## Responsive behaviour

Tested at 375, 768, 1024 and 1440 px in both themes, with no horizontal overflow on any route.

- **Public site:** the full navigation appears from 1024 px; below that a slide-out menu is used. The full search field appears from 1280 px, with an icon button below.
- **Dashboards:** collapsible icon sidebar on desktop, off-canvas drawer on phones. KPI tiles are 2-up on phones and 4-up on desktop.
- **Data tables:** on phones every `DataTable` renders as stacked, labelled cards with a sort picker (`src/components/data-table/data-table-mobile.tsx`). On larger screens it renders a standard table.
- **Dashboard building blocks:** `DashboardHero` (greeting, context, highlights, actions), `TaskListCard` ("needs your attention"), and `StatCard` with trend chip, sparkline and optional link.
