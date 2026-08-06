# Email and Payment Branding

TailorDeck payments are collected by BBW Tech Innovations, the company behind TailorDeck.

## App Copy

Use this copy before Paystack checkout:

```text
Secure payment handled by BBW Tech Innovations, the company behind TailorDeck.
```

Use this ownership copy in legal/about pages and app-sent emails:

```text
TailorDeck is a product of BBW Tech Innovations, a technology division under BBW Multi-Skills Ltd.
```

## Paystack

Paystack customer-facing receipts and checkout branding are controlled from the Paystack dashboard.

Recommended trading/display name:

```text
BBW Tech Innovations
```

This supports TailorDeck and future BBW software products under one payment identity.

## Supabase Auth Emails

Supabase Auth email templates are edited in the Supabase dashboard, not from this React codebase.

Add this short line to signup verification, password reset, and sensitive account emails:

```html
<p style="font-size:12px;color:#8B7A70;">
  TailorDeck is a product of BBW Tech Innovations, a technology division under BBW Multi-Skills Ltd.
</p>
```

## TailorDeck Edge Function Emails

TailorDeck-owned Edge Function emails should include the same ownership line in the footer.
