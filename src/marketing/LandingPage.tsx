import { BellRing, Calculator, FileText, LineChart, Ruler, Users } from 'lucide-react'
import { subscriptionPlans } from '../lib/subscriptionPlans'
import { APP_ICON_SRC, GooglePlayButton } from './MarketingLayout'

const features = [
  {
    icon: Ruler,
    title: 'Jobs & measurements',
    text: 'Record every job with body measurements for one person, a couple or a whole family, plus reference photos.',
  },
  {
    icon: Calculator,
    title: 'Pricing & profit check',
    text: 'Add materials and expenses, set your charge and deposit, and see your profit before you start cutting.',
  },
  {
    icon: BellRing,
    title: 'Never miss a deadline',
    text: 'Delivery dates with reminders from 10 minutes to a week before, including alarms that ring on your phone.',
  },
  {
    icon: FileText,
    title: 'Invoices & receipts',
    text: 'Create branded invoices and receipts with your logo and signature, and send them to clients as PDF.',
  },
  {
    icon: Users,
    title: 'Client records',
    text: 'Clients are saved automatically from your jobs, with their latest measurements ready for the next order.',
  },
  {
    icon: LineChart,
    title: 'Business dashboard',
    text: 'Track jobs, revenue, expenses and profit month by month, so you always know how your shop is doing.',
  },
]

export default function LandingPage() {
  return (
    <>
      <section className="mk-hero">
        <div className="mk-hero-copy">
          <p className="mk-eyebrow">For tailors and fashion designers</p>
          <h1>Your shop, in your pocket.</h1>
          <p className="mk-lead">
            TailorDeck keeps your jobs, measurements, clients, deadlines and invoices in one place, so you spend less
            time on paperwork and more time sewing.
          </p>
          <div className="mk-hero-actions">
            <GooglePlayButton />
            <p className="mk-hero-note">Free 14-day full trial. No card needed.</p>
          </div>
        </div>
        <div className="mk-hero-visual" aria-hidden>
          <img src="/images/onboarding-tailor-shop-3d.svg" alt="" />
        </div>
      </section>

      <section className="mk-section" aria-labelledby="mk-features-title">
        <h2 id="mk-features-title">Everything your shop needs</h2>
        <div className="mk-feature-grid">
          {features.map(({ icon: Icon, title, text }) => (
            <article key={title} className="mk-card mk-feature">
              <span className="mk-feature-icon">
                <Icon size={20} />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mk-section" aria-labelledby="mk-pricing-title">
        <h2 id="mk-pricing-title">Simple pricing</h2>
        <p className="mk-section-lead">Start free. Upgrade inside the app through Google Play whenever you are ready.</p>
        <div className="mk-pricing-grid">
          {subscriptionPlans.map((plan) => (
            <article key={plan.id} className={`mk-card mk-plan${plan.recommended ? ' mk-plan-featured' : ''}`}>
              {plan.recommended ? <span className="mk-plan-badge">Most popular</span> : null}
              <h3>{plan.label}</h3>
              <p className="mk-plan-price">
                {plan.price.monthly}
                <span>{plan.id === 'free' ? '' : ' / month'}</span>
              </p>
              <p className="mk-plan-sub">
                {plan.id === 'free' ? plan.helper : `or ${plan.price.yearly} / year (${plan.yearlyDiscountNote?.toLowerCase()})`}
              </p>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="mk-section mk-download" aria-labelledby="mk-download-title">
        <div className="mk-download-copy">
          <img src={APP_ICON_SRC} alt="" width={56} height={56} />
          <h2 id="mk-download-title">Get TailorDeck on your phone</h2>
          <p>TailorDeck is an Android app. Download it from Google Play, or scan the code with your phone camera.</p>
          <GooglePlayButton />
        </div>
        <figure className="mk-qr">
          <img src="/marketing/google-play-qr.svg" alt="QR code to download TailorDeck on Google Play" width={168} height={168} />
          <figcaption>Scan to download</figcaption>
        </figure>
      </section>
    </>
  )
}
