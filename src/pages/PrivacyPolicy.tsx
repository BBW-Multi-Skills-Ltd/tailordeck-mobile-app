import { Link } from 'react-router-dom'
import HistoryBackButton from '../components/shared/HistoryBackButton'
import PageHeader from '../components/shared/PageHeader'

// Source and reasoning: docs/13-Privacy-Policy-Draft.md. Keep it in line with the Google Play Data safety form
// (docs/12-Play-Declarations.md) and with what the app actually does.
const effectiveDate = 'October 8, 2026'

const sections = [
  {
    title: '1. Who We Are',
    body: [
      'TailorDeck is a product of BBW Tech Innovations, a technology division of BBW Multi-Skills Ltd (RC 8603105), a company registered in Nigeria. BBW Multi-Skills Ltd is the data controller for the personal data of TailorDeck account holders.',
      'Privacy contact: support@tailordeck.app (subject "Privacy").',
    ],
  },
  {
    title: '2. Data We Collect',
    body: [
      'Account: your name, email address, phone number, profile photo, and your password (stored only as a secure hash by our sign-in provider).',
      'Business: shop name, address, phone, email, website, social handles, logo, signature image and CAC/RC number, if you add them.',
      "Your clients' data: client names, phone numbers, sex, children's ages, body measurements, order details, prices, deposits, expenses, deadlines, reference photos, invoices and receipts that you record.",
      'Subscription: your plan, billing cycle, trial dates and Google Play order and purchase identifiers. We never receive card details; Google Play handles payment.',
      'Support: ticket subjects and messages, attachments you send (screenshots or PDFs), the app screen you were on and basic device information.',
      'Notifications: a push token for your device, so we can deliver support replies.',
      'Diagnostics: crash and error reports with your account identifier (not your name or email), the app screen, and device and app version.',
      'On your phone: a cached copy of your settings and a draft of an unfinished job, to make the app faster. They are cleared when you sign out.',
      'We do not collect your location, your contacts list or your activity in other apps.',
    ],
  },
  {
    title: '3. Why We Use It (Lawful Basis)',
    body: [
      'To create your account, run the app, store your records and produce invoices and receipts: performance of our contract with you.',
      'To verify your email, reset passwords and send account and billing messages: contract.',
      'To process subscriptions through Google Play and check purchases with Google: contract.',
      'To answer support requests and send replies to your phone: contract and our legitimate interest in helping you.',
      'Job deadline reminders and alarms: your choice in the app; you can turn them off in Settings.',
      'Security, preventing abuse, rate limits and crash reports to fix bugs: our legitimate interest in a safe, working service.',
      'Keeping records required by law, such as payment records: legal obligation.',
      "We do not use your data or your clients' data for advertising, and we do not sell it.",
    ],
  },
  {
    title: '4. Who We Share It With',
    body: [
      'We use these service providers to run TailorDeck. They process data on our instructions and only for these purposes:',
      'Supabase: database, sign-in, file storage and server functions (London, United Kingdom).',
      'Google Play: subscription payments.',
      'Google Firebase Cloud Messaging: delivers support replies to your phone.',
      'Resend: sends emails such as verification codes and account and support emails.',
      'Sentry: crash and error reports.',
      'GitHub: stores our encrypted nightly backups.',
      'Vercel: hosts the website and admin portal.',
      'Cloudinary: hosts videos and images shown on the website (no user data).',
      "When you send an invoice or receipt through WhatsApp or another app, that app's own terms and privacy policy apply.",
      'We may disclose data if required by Nigerian law or a court order, or to protect users from fraud or harm.',
    ],
  },
  {
    title: "5. Your Clients' Data",
    body: [
      "You decide what client information to record. For that data you act as the controller and TailorDeck processes it on your behalf. You are responsible for telling your clients that you keep their details and for having a lawful reason to do so, such as making and delivering their order.",
      "Record children's measurements only with the permission of a parent or guardian. Do not upload anything that is not needed for your business.",
    ],
  },
  {
    title: '6. International Transfers',
    body: [
      'Our main database is in London, United Kingdom. Some providers listed above process data in the United States or other countries. We use providers that commit to protecting data under contract, and we transfer only what each service needs.',
    ],
  },
  {
    title: '7. How Long We Keep Data',
    body: [
      'Your account, business details, clients, jobs, documents, files and support conversations: while your account is open.',
      'Clients and jobs you delete in the app are hidden immediately and permanently erased when your account is deleted.',
      'Replaced profile photos, logos and signatures are erased when you upload a new one.',
      'When you ask to delete your account, you have 14 days to restore it. After that, the account, all records and all files are permanently erased.',
      'Encrypted backups are kept for up to 30 days and then automatically erased.',
      'A record that an account was deleted (dates and counts only, no names or reasons) is kept for up to 6 years.',
      'Rate-limit counters are kept for up to 2 days.',
      'Crash reports and email delivery logs are kept by Sentry and Resend according to their retention settings. Google keeps Play order records under its own policy.',
    ],
  },
  {
    title: '8. Your Rights',
    body: [
      'Under the Nigeria Data Protection Act 2023 you can ask us to give you a copy of your data, correct it, erase it, restrict or object to some uses, give it to you in a portable format, and withdraw consent where we rely on consent.',
      'You can edit most of your data and delete your account yourself in the app (Settings, Account & Security). For anything else, contact support@tailordeck.app or use Help & Support in the app. We will reply within 30 days.',
      'You can also complain to the Nigeria Data Protection Commission (NDPC) at ndpc.gov.ng.',
    ],
  },
  {
    title: '9. Security',
    body: [
      'Your data is protected by sign-in with an emailed verification code, database rules that let each account see only its own records, private file storage opened only through short-lived links, payments verified with Google on our servers, and encrypted, access-restricted backups.',
      'No system is perfectly secure. If a breach is likely to put your rights at risk, we will notify the NDPC within 72 hours and inform affected users without undue delay.',
    ],
  },
  {
    title: '10. Children',
    body: ['TailorDeck is for business owners and is not intended for anyone under 18.'],
  },
  {
    title: '11. Changes',
    body: ['We will show changes in the app and update the effective date. For important changes we will tell you before they take effect.'],
  },
  {
    title: '12. Contact',
    body: ['BBW Multi-Skills Ltd (RC 8603105), Nigeria. Email: support@tailordeck.app, or use Help & Support in the app.'],
  },
]

export default function PrivacyPolicy() {
  return (
    <main className="legal-page">
      <section className="legal-shell">
        <PageHeader title="Privacy Policy" centered leading={<HistoryBackButton fallbackTo="/onboarding" />} />

        <section className="legal-hero">
          <div className="legal-brand">
            <span className="app-shell-logo-wrap" aria-hidden>
              <img src="/branding/TailorDeck%20app%20logo%20for%20splac%20screen.png" alt="" className="app-shell-logo" />
            </span>
            <span>TailorDeck</span>
          </div>
          <p>Effective date: {effectiveDate}</p>
          <p>
            This policy explains how TailorDeck collects, uses, stores, shares and protects personal data when you use the TailorDeck Android app, the website tailordeck.app and our support services.
          </p>
        </section>

        <div className="legal-section-list">
          {sections.map((section) => (
            <section key={section.title} className="legal-section">
              <h2>{section.title}</h2>
              {section.body.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </section>
          ))}
        </div>

        <section className="legal-note">
          <p>
            This policy may be updated as TailorDeck grows. Material changes will be communicated in the app or through another appropriate channel.
          </p>
        </section>

        <div className="legal-actions">
          <Link to="/terms-of-service" className="btn btn-secondary btn-full">Read Terms of Service</Link>
          <Link to="/onboarding" className="btn btn-primary btn-full">Back to TailorDeck</Link>
        </div>
      </section>
    </main>
  )
}

