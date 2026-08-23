# TailorDeck Frontend

TailorDeck is a mobile-first SaaS workspace for Nigerian tailors and fashion designers. The frontend covers onboarding, authentication screens, job creation, clients, job details, dashboard analytics, invoice/receipt previews, subscription screens, settings, notifications, and Supabase service wiring.

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- React Router
- TanStack Query
- Supabase JS client
- Framer Motion
- Recharts
- jsPDF + html2canvas for document export

## Local Setup

Create `.env` in the project root:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_EMAIL_OTP_EXPIRY_SECONDS=180
```

Never commit `.env` or a Supabase service-role key. `.env` is ignored by git.

`VITE_EMAIL_OTP_EXPIRY_SECONDS` must match the Supabase Auth email OTP expiry setting.

Install and run:

```bash
npm install
npm run dev
```

## Quality Commands

```bash
npm run lint\r\nnpm run test\r\nnpm run typecheck\r\nnpm run build\r\nnpm run quality
```

`npm run quality` runs lint, unit tests, and the production build.

## Frontend Architecture

- `src/pages`: route-level screens, lazy-loaded in `App.tsx`.
- `src/components`: feature and shared UI components.
- `src/hooks`: React Query and domain hooks.
- `src/services`: Supabase service layer.
- `src/services/mappers`: database row to frontend model mappers.
- `src/lib`: shared utilities for settings, money, phone, auth, theme, and subscription plans.
- `src/templates`: invoice and receipt document templates.
- `src/data`: temporary mock/static data used where backend replacement is still pending.

## Backend Status

Supabase frontend wiring exists, but backend work is paused while frontend UX is finalized. Client and job data flows are partially connected through service files and React Query hooks. Some local settings flows still use local storage and will be replaced with Supabase-backed persistence later.

Supabase schema has been pulled into `supabase/migrations/20260722221024_remote_schema.sql`. Keep future database changes in committed migration files so the project remains reproducible.

## Production Notes

- Routes are lazy-loaded to keep initial navigation lighter.
- Heavy document export libraries are dynamically imported only when exporting PDFs.
- Clients and jobs use soft-delete patterns in the frontend service layer.
- Money values should be stored as kobo in Supabase and formatted as Naira in the UI.
- Nigerian phone numbers should be normalized before persistence.


