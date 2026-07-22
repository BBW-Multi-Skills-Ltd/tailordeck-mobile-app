# TailorDeck Backend Handoff

Date: 2026-07-22

Backend development is paused while frontend UX is finalized. This document captures the current frontend architecture and what backend work must support when Supabase resumes.

## Current Frontend Flow

1. Splash screen
2. Onboarding welcome
3. Setup flow
   - Step 1: business name, address, CAC/RC number
   - Step 2: business logo and signature upload
   - Step 3: contact details and social handles
   - User may skip setup after confirmation
4. Auth
   - Sign up
   - Sign in
   - Forgot password
   - Google auth UI is present
5. Subscription onboarding
   - Free trial, Starter, Pro
   - Monthly/yearly toggle
   - Plan choice should be persisted server-side
6. App shell
   - Home
   - Jobs
   - Center create-job FAB
   - Clients
   - More hub

## Main Pages Now Expected By Backend

- Home: KPI summary, total profit card, recent jobs.
- Jobs: searchable job list, status filters, job detail route.
- New Job: guided wizard with client, measurements, material/parts, pricing/costing, deadline, reference photos, review, success.
- Client Profile: client info, measurements, completed job history, repeat job flow.
- Dashboard: monthly stats, revenue/expenses chart, job status breakdown, best month.
- More: account/security entry, dashboard, documents, business/shop, settings, subscription, help.
- Business: business identity, contact details, social handles, address.
- Documents: invoice/receipt details checklist and live landscape previews.
- Settings: reminders, account/security, subscription, about, clear history, sign out.
- Notifications: right-side full-width panel, not bottom drawer.

## Backend Must Support

### Auth

- Email/password signup and login.
- Google OAuth.
- Email verification or a deliberate dev/test bypass policy.
- Forgot password/reset password flow.
- Profile row auto-created on signup.
- Route guard data: `profiles.onboarding_complete`, subscription status.

### Business Setup

Store per user:

- Business name
- Business address
- CAC/RC number
- Business phone
- Business email
- Website
- Instagram handle
- Facebook handle
- TikTok handle
- Logo storage path/url
- Signature storage path/url

### Documents

Invoice/receipt MVP uses one landscape document template. Backend should support:

- Business details selected for display:
  - business phone
  - business email
  - website
  - social handles
  - shop address
  - CAC/RC number
- Document type: invoice or receipt
- Generated document metadata
- PDF storage in private `documents` bucket
- WhatsApp sharing link generation client-side or via edge function later

### Jobs

New job payload must support:

- Client name and phone
- Repeat-client flow by `clientId`
- Order category: body wear or non-body item
- Order mode: fresh job or amendment/repair
- Order scope: single, couple, family
- Persons linked to job with measurements
- Gender-aware measurements, including boy/girl mapping to male/female field sets
- Same item for all vs different item per person
- Material type, custom material type, color, yards, quality, source
- Pricing: charge, deposit percent, deposit amount, balance amount
- Expenses list
- Estimated profit
- Worth-it answer
- Deadline date/time and reminder option
- Reference photos linked by person/target, max 2 per person target in UI
- Draft/finalize status

### Clients

Clients are created through jobs, not as a standalone primary flow in the current UX. Backend should still support client updates and soft deletes.

### Subscription

Current frontend expectations:

- Free trial
- Starter
- Pro
- Monthly/yearly cycle
- Manage plan page
- Cancel at period end
- Trial remains active until expiry even if user chooses not to upgrade
- Paystack is likely the preferred Nigeria-first payment provider

Backend should own plan status. Frontend must not be trusted for subscription access.

### Notifications/Reminders

Current UX keeps notifications simple:

- All
- Unread
- Deadlines
- Mark all as read
- Delete notification
- Clear all notifications
- Reminder sound is simplified to default app behavior for MVP

Backend should eventually create deadline reminders from job delivery date/time.

## Security Rules

- Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend.
- All user-owned tables need RLS by `auth.uid()`.
- Clients/jobs/documents/storage paths must be scoped by `user_id`.
- Use soft delete for clients/jobs/notifications.
- Store money as kobo.
- Normalize Nigerian phone numbers before storing.
- Store files in private buckets:
  - avatars
  - brand-assets
  - job-photos
  - documents

## Current Blocker Before Backend Resumes

The committed migration file is empty:

```text
supabase/migrations/20260604141720_remote_schema.sql
```

Before backend implementation continues, the real Supabase schema must be captured into migrations so another developer can recreate the database from git.

Recommended options:

1. Install/start Docker Desktop, then run `npx supabase db pull` again and commit the generated schema migration.
2. If Docker is not available, manually create migration SQL files from the SQL already run in the Supabase dashboard.

## Frontend Quality Status

Current verified commands:

```bash
npm run lint
npm run build
```

Both pass.
