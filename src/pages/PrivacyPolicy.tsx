import { Link } from 'react-router-dom'
import HistoryBackButton from '../components/shared/HistoryBackButton'
import PageHeader from '../components/shared/PageHeader'

const effectiveDate = 'August 4, 2026'

const sections = [
  {
    title: 'Information We Collect',
    body: [
      'Account details such as your name, email address, phone number, password authentication data, and profile photo.',
      'Business details such as business name, shop address, business phone, business email, website, social handles, logo, signature, and CAC/RC number if provided.',
      'Client and job records such as client names, phone numbers, measurements, order details, pricing, deposits, expenses, deadlines, notes, photos, invoices, receipts, and job status.',
      'Subscription and payment records connected to your TailorDeck plan. Card, bank, USSD, or transfer payment details are processed by Paystack, not stored directly by TailorDeck.',
      'Technical data such as device type, browser, app version, session state, and basic diagnostic information needed to keep the app secure and reliable.',
    ],
  },
  {
    title: 'How We Use Information',
    body: [
      'To create and secure your TailorDeck account.',
      'To help you manage clients, measurements, jobs, expenses, deadlines, invoices, receipts, and shop records.',
      'To show your business details on documents when you choose to include them.',
      'To send authentication emails, verification codes, password reset messages, billing messages, reminders, and important service notices.',
      'To improve app reliability, prevent abuse, troubleshoot issues, and protect users from unauthorized access.',
    ],
  },
  {
    title: 'Client Data Responsibility',
    body: [
      'TailorDeck is built for tailors and fashion designers. You are responsible for getting permission from your clients before storing their names, phone numbers, measurements, photos, or job details in the app.',
      'Do not upload private, sensitive, illegal, or unrelated files. Only upload information needed to manage your tailoring business.',
    ],
  },
  {
    title: 'Third-Party Services',
    body: [
      'Supabase provides authentication, database, storage, and backend infrastructure.',
      'Paystack processes subscription payments and billing verification.',
      'Vercel hosts the TailorDeck web application.',
      'Resend may be used to deliver email verification and account messages.',
      'Google may be used if you choose Google sign-in.',
      'WhatsApp sharing opens your device sharing flow or WhatsApp link so you can send invoices, receipts, or job messages to clients.',
    ],
  },
  {
    title: 'Storage and Security',
    body: [
      'Uploaded files are stored in private Supabase Storage buckets where possible. The app generates temporary signed links so authorized users can view their own files.',
      'Row Level Security is used so users should only access records belonging to their own account.',
      'No frontend code should contain Supabase service-role secrets, Paystack secret keys, or other private backend credentials.',
      'No internet-based system is completely risk-free, but we design TailorDeck to reduce unauthorized access and protect user data.',
    ],
  },
  {
    title: 'Data Sharing',
    body: [
      'We do not sell your personal, business, or client data.',
      'We share data only with service providers needed to run TailorDeck, comply with law, prevent fraud, process payments, deliver emails, or support features you request.',
      'When you share an invoice, receipt, or client message through WhatsApp or another app, that sharing is controlled by the receiving platform’s own terms and privacy practices.',
    ],
  },
  {
    title: 'Data Retention and Deletion',
    body: [
      'We keep account, business, client, job, document, billing, and support records while your account is active or as needed for legal, security, backup, billing, or operational reasons.',
      'You may request account deletion or use in-app deletion features where available. Some records may be retained temporarily in backups, logs, or payment records where required.',
      'Deleted jobs and clients may use soft deletion first so mistakes can be investigated and business records remain consistent.',
    ],
  },
  {
    title: 'Your Choices',
    body: [
      'You can update your profile, business details, branding, reminders, and subscription information in the app.',
      'You can choose which business details appear on invoices and receipts.',
      'You can request support for access, correction, export, or deletion of your account data.',
    ],
  },
  {
    title: 'Children',
    body: [
      'TailorDeck is intended for business users and is not directed to children. Tailors may store child measurement records only where they have appropriate permission from the parent, guardian, or responsible client.',
    ],
  },
  {
    title: 'Contact',
    body: [
      'For privacy requests, support, or data deletion, contact TailorDeck support at support@tailordeck.com.ng. If this address is not yet active during beta, use the support channel provided inside the app.',
    ],
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
            This Privacy Policy explains how TailorDeck collects, uses, stores, shares, and protects information when you use the app, website, and related services.
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
