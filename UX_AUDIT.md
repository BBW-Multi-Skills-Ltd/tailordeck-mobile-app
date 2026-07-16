# TailorDeck Frontend UX Audit

Date: 2026-07-16
Scope: frontend UX, information architecture, visual consistency, interaction design, and redesign readiness. Backend and Supabase wiring are intentionally out of scope unless a UI flow cannot work without a backend contract change.

## Executive Summary

TailorDeck is functional and already has a strong mobile-first foundation. The main issue is no longer missing screens; it is cognitive load. Several flows expose too many decisions too early, especially onboarding, job creation, measurements, materials, settings, and subscription. The redesign should not be a cosmetic style pass. It should simplify the user journey, reduce visible choices, and make the app feel guided.

Recommended direction: keep the current brand palette and move toward a softer claymorphism system using existing colors, not a heavy liquid-glass redesign. Claymorphism fits TailorDeck better because the app is a daily business tool for tailors: calm, warm, tactile, and trustworthy.

Do not start by changing every page visually. Start by fixing the product flow, then apply visual system consistency.

## Highest Priority UX Problems

1. The app asks users to sign up too early.
   Current flow: Welcome -> Sign up. This creates a trust wall before the user has seen enough value.
   Better flow: Welcome -> guided value preview/demo workspace -> signup when user wants to save or continue setup.

2. The New Job wizard is too decision-heavy in Step 1.
   Client identity, order category, order mode, order scope, item type, people, gender, measurements, descriptions, children, and amendment fields are all close together. This violates Hick's Law and Miller's Law.

3. Measurement entry is still too broad.
   The UI currently renders many fields directly once a person card is open. The new desired model is better: show common measurements first, then reveal optional/additional/custom measurements.

4. Material selection is too tall and category-heavy.
   Five vertical expandable category cards create scanning work. The user should search, select a common category chip, or pick from common/recent fabrics first.

5. Settings is functionally complete but too dense.
   Eight accordion sections, save buttons, destructive actions, subscription, and theme controls compete for attention. It needs a hierarchy and setup score.

6. Subscription still feels like pricing first, not value/risk first.
   The user should understand what pauses after trial if they do not upgrade: branded PDFs, WhatsApp sharing, analytics, etc. Use loss aversion ethically.

7. Empty states are backend-compatible but not yet motivational.
   Empty pages should guide the next best action, not just say there is no data.

## Design System Audit

### Current State

The project has useful global primitives in `src/index.css`: buttons, cards, inputs, pills, app shell, bottom nav, settings rows, wizard UI, sheets, and dark mode variables. This is a good base.

### Problems

- Some text sizes and weights are still page-specific instead of token-driven.
- Some controls use different pill shapes and spacing across pages.
- Some helper text is too long or repeats obvious information.
- A few controls still show old units or copy, for example measurement labels with `(cm)`.
- There is at least one encoding issue: StepCosting has `placeholder="â‚¦ Amount"`.
- Some components use inline widths or empty spacers for centering headers. This works but should become a shared page-header component.

### Recommendation

Create reusable visual primitives before broad redesign implementation:

- `PageHeader`
- `SectionTitle`
- `ClayCard`
- `ActionBar`
- `SegmentedControl`
- `ChoiceCard`
- `SettingSection`
- `BottomSheet`
- `ProgressHeader`
- `EmptyState`
- `SuccessState`
- `FieldGroup`
- `MeasurementFieldRow`

Use these primitives to make visual consistency automatic.

## Navigation Audit

### Current State

Mobile bottom nav is clear: Home, Clients, Jobs, Dashboard, Settings. App header includes logo, profile menu, and notifications. This is familiar and should remain.

### Problems

- Contextual actions are inconsistent: FAB on home/jobs, sticky buttons in wizard, drawer actions in settings.
- Header centering is implemented differently across pages.
- New Job creation is a long flow but does not use enough momentum language.

### Recommendation

Keep bottom nav for primary navigation. Add these rules:

- Home: primary CTA is `Create Job` or FAB.
- Jobs: primary CTA is `New Job`.
- Wizard: sticky bottom action with progress and autosave/draft status.
- Settings: no FAB; use section cards and setup completion score.
- Detail pages: top back button + centered title + one contextual primary action near bottom.

## Onboarding and Auth Audit

### Current Flow

- `/onboarding` welcome screen.
- Get Started goes to `/auth/signup`.
- Signup creates account, then user enters `/onboarding/setup`.
- Setup asks shop name and measurement preference.
- Plan selection comes before Home.

### UX Problem

The user gives personal data before the app has delivered enough value. This weakens trust and conversion.

### Recommended Flow

Phase 1, frontend-only safe change:

1. Welcome to TailorDeck.
2. Show a sample daily workspace: jobs due, client measurements, invoice preview.
3. CTA: `Create my shop`.
4. Signup.
5. Setup shop with progress already at 25 percent: `Your TailorDeck workspace is ready`.
6. Shop name and default measurement unit, default `inches`.
7. Trial/plan screen.
8. Home.

Phase 2, better trust model:

1. Let user build a local unsaved sample job before signup.
2. When they try to save/send/export, ask them to create account so the work is not lost.

### Goal Gradient Changes

Onboarding should never start at zero. Suggested milestones:

- Workspace created: 25 percent
- Shop basics: 50 percent
- Trial selected: 75 percent
- First job created or business info completed: 100 percent

Use copy like:

- `Your workspace is ready.`
- `You are halfway to a professional shop setup.`
- `Complete invoice setup later to send branded receipts.`

## Home Audit

### Current State

Home shows greeting, KPI cards, total profit, recent jobs, and FAB. It is a good daily landing page.

### Problems

- `Your workshop is busy today` should be data-driven or neutral.
- For new users, KPI cards with zeros are less useful than a guided setup checklist.
- Recent jobs should not dominate if there are no jobs.

### Recommendation

Use two Home states:

New user state:

- Welcome card with shop name.
- Setup progress card.
- Primary action: `Create your first job`.
- Secondary actions: `Complete business info`, `Set invoice template`.

Active user state:

- Greeting.
- Today focus: due jobs, unpaid balances, pending delivery.
- KPI cards.
- Recent jobs.
- Upcoming deadlines.

## New Job Wizard Audit

### Current State

The wizard is modular and backend-wired. It has four steps:

1. Client Info and Measurements
2. Materials/Parts and Pricing
3. Costing
4. Deadline and Review

### Step 1 Problems

- Too many choices appear too quickly.
- Body/non-body, amendment/new stitch, order scope, item type, people, measurements, and descriptions are all visible in one step.
- Measurement labels still use `(cm)` in some components.
- Gender selection is not the first measurement decision.

### Step 1 Recommendation

Split Step 1 visually into guided cards, not necessarily new routes:

1. Client
   - Name
   - WhatsApp phone

2. What kind of work?
   - New Stitch
   - Amendment / Repair

3. What are you making?
   - Body Wear
   - Home / Non-body Item

4. Who is it for?
   - Single
   - Couple
   - Family

5. Measurements
   - For each person, first choose gender.
   - Load common measurement fields only.
   - Add Measurement reveals advanced fields.
   - Custom measurement option.

This can remain one wizard step internally, but the UI should progressively reveal sections.

### Step 2 Problems

- Material category list is too long.
- The user has to open categories before finding common fabric.

### Step 2 Recommendation

Use progressive material search:

- Search input: `Search fabric or part`.
- Category chips: Local, Commercial, Industrial, International, Other.
- Show common materials first: Ankara, Lace, Aso Oke, Guinea Brocade, Satin, Crepe.
- Show selected material as a compact selected card.
- For amendment mode, ask `Do you need materials or parts?` first.

### Step 3 Problems

- If the user selects `Yes, proceed`, they still need to press Next.

### Step 3 Recommendation

- Selecting `Yes, proceed` should auto-advance after short confirmation animation.
- Selecting `Not worth it` should open a bottom sheet:
  - Adjust charge amount
  - Continue anyway
  - Cancel job

### Step 4 Problems

- Review is useful but can feel long.

### Step 4 Recommendation

Use a review checklist:

- Balance due checked
- Deadline set checked
- Reminder set checked
- Measurements captured checked
- Costs reviewed checked

Then show collapsible full review.

## Measurements Audit

### Current Problems

- Measurement fields are hardcoded from existing arrays and shown immediately.
- Some labels still use centimeters.
- The frontend does not yet support remove/restore measurement fields as requested.
- Custom fields are not prominent enough.

### Recommended Measurement Model

Default unit: inches.

Common visible male fields:

- Chest
- Waist
- Shoulder
- Sleeve
- Neck
- Hip
- Thigh
- Inseam

Common visible female fields:

- Bust
- Waist
- Full Hip
- Shoulder
- Sleeve
- Neck
- Underbust
- Inseam

Advanced male fields:

- Head
- Knee
- Ankle
- Wrist
- Shorts
- Outseam
- Bicep
- Butt / Seat
- Top Length
- Floor Length
- Height

Advanced female fields:

- Head
- Ankle
- Overbust
- Hip
- Thigh
- Knee
- Calf
- NLTC
- STW
- WTHB
- NLTB
- STHB
- HTH
- Outseam
- Bicep
- Wrist
- Height

Interaction rules:

- Each visible field has a remove icon.
- Removed fields go into `Add Measurement` list.
- Custom field creates a new local field and stores with measurements JSON.
- Do not permanently delete fields.

## Clients and Client Profile Audit

### Current State

Clients list and profile are mostly clear. Profile shows client summary, measurements, job history, another job button, delete client.

### Problems

- Client list should emphasize last completed job, not active/pending state.
- Client profile should clearly separate saved measurements from job history.
- `Start another job for this client` should prefill client and latest measurement instead of behaving like generic new job.

### Recommended Flow for Repeat Client

When user taps `Start another job for this client`:

1. Open New Job with client name and phone locked/prefilled.
2. Show latest measurement snapshot card: `Use saved measurements`.
3. Options:
   - Use as is
   - Edit measurements for this job
   - Take new measurements
4. Then continue to order setup.

This reduces repeat work and makes TailorDeck feel smart.

## Jobs and Job Detail Audit

### Current State

Jobs list is wired and Job Detail is componentized. Job detail includes info, pricing, photos, deadline, invoice/receipt drawer.

### Problems

- Filters include Pending/In Progress/Completed. Product direction needs clarity: if Pending is retained, define meaning. If not, remove it consistently.
- Job detail may show too many rows at once.
- Invoice and receipt actions are good but should be tied to payment/status state.

### Recommendation

Jobs list:

- Default filter: Active jobs.
- Secondary filters: Completed, Drafts, All.
- Search by client or item.

Job detail:

- Top summary: client, status, delivery date, balance due.
- Tabs or collapsible groups:
  - Job Info
  - Measurements
  - Pricing
  - Photos
  - Documents

Invoice/Receipt rules:

- Invoice: before payment/completion, requests deposit or balance.
- Receipt: after payment, confirms money received.

## Dashboard Audit

### Current State

Dashboard has KPI cards, revenue chart, status breakdown, monthly performance, best month. Good structure.

### Problems

- Dashboard is useful only after enough data exists.
- New users need education rather than empty charts.

### Recommendation

New user dashboard:

- Show `Create 3 jobs to unlock meaningful analytics`.
- Explain what will appear: revenue, expenses, profit, best month.

Active dashboard:

- Keep current structure.
- Add insight summaries:
  - `Profit improved from last month`.
  - `Expenses are taking X percent of revenue`.
  - `Most work is still active`.

## Settings Audit

### Current State

Settings is feature-complete but dense.

### Problems

- Eight sections compete equally.
- Destructive actions are close to normal settings.
- Invoice setup is complex inside accordion.
- Setup progress is missing.

### Recommendation

Settings top should show:

- Profile summary card.
- Shop setup progress: Business info, Invoice setup, Notifications.
- Current plan.

Recommended order:

1. My Profile
2. Business Info
3. Invoice & Receipt
4. Shop Preferences
5. Reminders & Notifications
6. Account & Security
7. Upgrade
8. About TailorDeck

Danger zone should be visually separated at bottom:

- Clear Job History
- Deactivate Account
- Delete Account Permanently

## Subscription Audit

### Current State

Subscription has free trial current plan and plan carousel.

### Problems

- It still reads like a price table.
- It should explain trial expiration and what pauses.

### Recommendation

Subscription screen hierarchy:

1. Current trial/plan card.
   - Days left.
   - What remains active.

2. Loss-framed but ethical message:
   - `When trial ends, branded PDFs, WhatsApp sharing, and analytics pause until you choose a plan.`

3. Monthly/yearly toggle.

4. Plan cards carousel.

5. Feature comparison hidden behind `Compare plans`.

Onboarding plan screen should have three cards:

- 14 Days Free Trial
- Starter
- Pro

But default action should encourage trial unless payment is already ready.

## Notifications Audit

### Current State

Notification drawer has All, Unread, Deadlines, actions, delete, mark read, drag handle.

### Problems

- It should stay stable height when filters change.
- System/payment filters were already removed or should remain removed unless there is real notification content.
- Empty filtered states need useful copy.

### Recommendation

Notification types for now:

- Deadlines
- Payments / balances if payment tracking is active
- Setup reminders

If payment notifications are not active, hide payment filter.

## Empty, Loading, Error State Audit

### Required Empty States

Home:

- `Create your first job`.
- `Complete business info`.
- `Set invoice template`.

Clients:

- `Clients appear automatically after you create jobs.`
- CTA: Create Job.

Jobs:

- `No jobs yet. Start with your first customer order.`
- CTA: New Job.

Dashboard:

- `Create jobs to unlock analytics.`

Settings:

- Show setup progress instead of empty inputs only.

Notifications:

- `No notifications yet. Deadline reminders will appear here.`

## Accessibility Audit

Required rules:

- Minimum 44px tap targets.
- Labels must not rely on placeholders only.
- All icon-only buttons need aria-labels.
- Focus states must be visible in light and dark mode.
- Reduced motion support should be respected for heavy animations.
- Color alone should not communicate selected/error states.

## Visual Redesign Direction

Use claymorphism, not heavy glassmorphism.

Claymorphism tokens:

- Warm app background.
- White/off-white raised cards.
- Soft inner highlight.
- Subtle shadow.
- Rounded 18-24px cards.
- Pill controls with modest radius, not fully balloon-like unless intentional.
- Primary maroon for core actions.
- Gold for secondary emphasis and progress.

Do not overuse shadows. TailorDeck should feel calm and professional, not toy-like.

## Implementation Roadmap

### Phase 1: Design System Foundation

- Create shared primitives: PageHeader, ClayCard, SegmentedControl, ChoiceCard, ProgressHeader, BottomSheet, EmptyState variants.
- Normalize typography tokens.
- Normalize button heights and pill shapes.
- Fix corrupted text and unit labels.

### Phase 2: Onboarding and Auth Trust Flow

- Add value preview before signup.
- Add goal-gradient setup progress.
- Keep signup simple.
- Move richer business setup into guided checklist after first login.

### Phase 3: New Job Wizard UX Redesign

- Progressive Step 1.
- Measurement add/remove/restore/custom system.
- Materials search and simplified category chips.
- Costing auto-advance on `Yes, proceed`.
- Better review checklist.

### Phase 4: Home, Empty States, and Daily Focus

- New user home checklist.
- Active user daily focus.
- Better empty states across pages.

### Phase 5: Settings and Subscription

- Settings setup score.
- Safer danger zone.
- Subscription trial countdown and loss-framed plan choice.

### Phase 6: Polish

- Micro-interactions.
- Success states.
- Accessibility pass.
- Dark mode consistency pass.
- Mobile keyboard and safe-area pass.

## Do Not Change During This Phase

- Supabase schema.
- RLS policies.
- Service-layer contracts unless a UI flow cannot work without them.
- Auth/session logic.
- Existing successful job creation backend flow.

## Immediate Next Step

Start with Phase 1. Build shared UI primitives and update only one flow first: Onboarding/Auth. This is the safest redesign entry point because it improves trust and first impression without risking job creation data integrity.
