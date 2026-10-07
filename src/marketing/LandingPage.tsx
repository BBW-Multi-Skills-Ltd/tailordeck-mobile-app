import { useEffect, useState } from 'react'
import { ArrowRight, Bell, Camera, ChartLine, FileText, Play, ShieldCheck, Sparkles, Star, X } from 'lucide-react'
import SegmentedControl from '../components/shared/SegmentedControl'
import { SubscriptionPlanCarousel } from '../components/subscription/SubscriptionPlanCarousel'
import { billingCycles, subscriptionPlans, type BillingCycle } from '../lib/subscriptionPlans'
import type { SubscriptionPlan } from '../lib/settingsTypes'
import { AppStoreBadge, BBW_LOGO_SRC, BrandLogo, PlayButton } from './MarketingLayout'
import PhoneMockup from './PhoneMockup'
import { featureGroups, journey, productRows, type BadgeTone } from './marketingContent'
import { qrImageSrc, reviewerInitials, useSiteContent } from './siteContent'

/** The demo video in a dialog; closes on the backdrop, the close button or Escape. */
function DemoVideoDialog({ src, poster, onClose }: { src: string; poster: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="mk-video-backdrop" role="dialog" aria-modal="true" aria-label="TailorDeck demo video" onClick={onClose}>
      <div className="mk-video-frame" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="mk-video-close" onClick={onClose} aria-label="Close video">
          <X size={20} />
        </button>
        <video src={src} poster={poster || undefined} controls autoPlay playsInline />
      </div>
    </div>
  )
}

function Badge({ children, tone = 'wine' }: { children: React.ReactNode; tone?: BadgeTone }) {
  return <span className={`mk-badge mk-badge-${tone}`}>{children}</span>
}

function SectionTitle({ eyebrow, title, copy, align = 'center' }: { eyebrow: string; title: string; copy?: string; align?: 'center' | 'left' }) {
  return (
    <div className={`mk-section-title${align === 'left' ? ' mk-align-left' : ''}`}>
      <span className="mk-eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {copy ? <p>{copy}</p> : null}
    </div>
  )
}

/** Fades sections in as they scroll into view (skipped when the visitor prefers reduced motion). */
function useRevealOnScroll(revealKey: number) {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('.mk-reveal:not(.is-visible)'))
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'))
      return undefined
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
    // Re-run when reviews load, so the new cards are observed too.
  }, [revealKey])
}

/** "Get TailorDeck on your phone" band. `centered` stacks everything in the middle with a large QR code. */
function DownloadBand({ id, centered = false }: { id?: string; centered?: boolean }) {
  const { settings } = useSiteContent()
  const appStoreQr = settings.app_store_url && settings.app_store_qr_svg ? qrImageSrc(settings.app_store_qr_svg) : ''
  return (
    <section id={id} className={`mk-shell mk-download-band mk-reveal${centered ? ' mk-download-centered' : ''}`}>
      <div className="mk-download-copy">
        <BrandLogo compact />
        <div>
          <h2>Get TailorDeck on your phone</h2>
          <p>Download on Android and give your tailoring business a more organised tomorrow.</p>
        </div>
      </div>
      {centered ? (
        <>
          <div className="mk-qr-row">
            <figure className="mk-qr-card mk-qr-card-large">
              <img src={qrImageSrc(settings.play_store_qr_svg)} alt="QR code to download TailorDeck on Google Play" width={240} height={240} loading="lazy" />
              <figcaption>{appStoreQr ? 'Scan for Google Play' : 'Scan to download'}</figcaption>
            </figure>
            {appStoreQr ? (
              <figure className="mk-qr-card mk-qr-card-large">
                <img src={appStoreQr} alt="QR code to download TailorDeck on the App Store" width={240} height={240} loading="lazy" />
                <figcaption>Scan for the App Store</figcaption>
              </figure>
            ) : null}
          </div>
          <div className="mk-store-row">
            <PlayButton variant="light" />
            <AppStoreBadge variant="light" />
          </div>
        </>
      ) : (
        <>
          <div className="mk-store-row">
            <PlayButton variant="light" />
            <AppStoreBadge variant="light" />
          </div>
          <figure className="mk-qr-card">
            <img src={qrImageSrc(settings.play_store_qr_svg)} alt="QR code to download TailorDeck on Google Play" width={92} height={92} />
            <figcaption>Scan to download</figcaption>
          </figure>
        </>
      )}
    </section>
  )
}

const journeyBadges: Record<number, { icon: typeof Bell; label: string }> = {
  1: { icon: ShieldCheck, label: 'Verified' },
  4: { icon: Camera, label: 'Job ready' },
  7: { icon: FileText, label: 'Sent' },
  9: { icon: ChartLine, label: 'Growing' },
}

export default function LandingPage() {
  const [cycle, setCycle] = useState<BillingCycle>('monthly')
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('pro')
  const [videoOpen, setVideoOpen] = useState(false)
  const { settings, reviews } = useSiteContent()
  useRevealOnScroll(reviews.length)

  return (
    <>
      {/* Hero */}
      <section className="mk-hero mk-shell">
        <div className="mk-hero-copy mk-reveal">
          <Badge>BUILT FOR AFRICAN FASHION BUSINESSES</Badge>
          <h1>
            Your shop,
            <br />
            <em>in your pocket.</em>
          </h1>
          <p>
            TailorDeck keeps your jobs, measurements, clients, deadlines and invoices in one place, so you spend less time on
            paperwork and more time sewing.
          </p>
          <div className="mk-button-row">
            <PlayButton />
            <AppStoreBadge />
            <a className="mk-btn mk-btn-secondary" href="#how-it-works">
              See how it works <ArrowRight size={17} />
            </a>
          </div>
          <small className="mk-hero-note">
            <ShieldCheck size={14} /> Free 14-day full trial. No card needed.
          </small>
          <div className="mk-hero-proof">
            <span>
              <b>14 days</b>
              <small>Full free trial</small>
            </span>
            <span>
              <b>₦0</b>
              <small>To get started</small>
            </span>
            <span>
              <b>Android</b>
              <small>On Google Play</small>
            </span>
          </div>
        </div>
        <div className="mk-phone-stage mk-reveal">
          <div className="mk-glow" />
          <PhoneMockup />
          {settings.demo_video_url ? (
            <button type="button" className="mk-demo-play" onClick={() => setVideoOpen(true)} aria-label="Watch the app demo">
              <Play size={24} />
            </button>
          ) : null}
          <div className="mk-float-chip mk-chip-one">
            <Bell size={17} />
            <span>
              <b>Deadline reminder</b>Wedding gown fitting in 2 hours
            </span>
          </div>
          <div className="mk-float-chip mk-chip-two">
            <ChartLine size={17} />
            <span>
              <b>₦48,500 profit</b>This job is worth it
            </span>
          </div>
        </div>
      </section>

      {/* Product */}
      <section id="product" className="mk-section mk-shell">
        <SectionTitle eyebrow="THE PRODUCT" title="Built for the way tailors work" copy="From first measurement to final receipt, TailorDeck keeps every detail close at hand." />
        <div className="mk-product-rows">
          {productRows.map((row, index) => (
            <article key={row.title} className={`mk-product-row mk-reveal${index % 2 === 1 ? ' mk-reverse' : ''}`}>
              <div>
                <Badge tone={row.tone}>{row.badge}</Badge>
                <h3>{row.title}</h3>
                <p>{row.copy}</p>
                <div className="mk-stat-chips">
                  {row.chips.map((chip) => (
                    <span key={chip}>{chip}</span>
                  ))}
                </div>
              </div>
              <PhoneMockup screen={row.screen} small />
            </article>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mk-section mk-section-muted">
        <div className="mk-shell">
          <SectionTitle eyebrow="EVERYTHING INCLUDED" title="One toolkit. Your whole shop." copy="Thoughtful details for the real day-to-day of a growing tailoring business." />
          <div className="mk-feature-grid">
            {featureGroups.map((feature, index) => {
              const Icon = feature.icon
              const tone: BadgeTone = index % 3 === 0 ? 'wine' : index % 3 === 1 ? 'blue' : 'green'
              return (
                <article key={feature.title} className="mk-feature-card mk-clay mk-reveal" style={{ transitionDelay: `${(index % 3) * 70}ms` }}>
                  <div className="mk-feature-top">
                    <span className="mk-icon-tile">
                      <Icon size={20} />
                    </span>
                    <Badge tone={tone}>{feature.label}</Badge>
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.copy}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mk-section mk-shell">
        <SectionTitle eyebrow="HOW IT WORKS" title="From download to done" copy="Ten simple steps turn a busy shop into an organised business." />
        <ol className="mk-timeline">
          {journey.map((step, index) => {
            const badge = journeyBadges[index]
            const BadgeIcon = badge?.icon
            return (
              <li key={step} className="mk-step mk-clay mk-reveal">
                <span className="mk-step-number">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <small>STEP {index + 1}</small>
                  <h3>{step}</h3>
                </div>
                {badge && BadgeIcon ? (
                  <span className="mk-journey-icon">
                    <BadgeIcon size={22} />
                    <span>{badge.label}</span>
                  </span>
                ) : null}
              </li>
            )
          })}
        </ol>
      </section>

      <DownloadBand id="download" />

      {/* Mission & ownership */}
      <section id="mission" className="mk-section mk-shell mk-mission-grid">
        <SectionTitle
          align="left"
          eyebrow="OUR MISSION"
          title="A more profitable future for African fashion"
          copy="We believe brilliant craftsmanship deserves brilliant business tools. TailorDeck helps African tailors and fashion designers work professionally, protect their time and build profitable shops."
        />
        <article className="mk-ownership mk-clay mk-reveal">
          <span className="mk-logo-pair">
            <img className="mk-bbw-logo" src={BBW_LOGO_SRC} alt="BBW" width={96} height={54} loading="lazy" />
            <BrandLogo compact />
          </span>
          <h3>Built here. Built for us.</h3>
          <p>
            TailorDeck is built by <b>BBW Tech Innovations</b>, the technology division of BBW Multi-Skills Ltd.
          </p>
          <a href={settings.company_site} target="_blank" rel="noreferrer">
            Learn more about BBW Tech Innovations <ArrowRight size={16} />
          </a>
        </article>
      </section>

      {/* Reviews */}
      <section className="mk-section mk-section-muted">
        <div className="mk-shell">
          <SectionTitle eyebrow="EARLY WORDS" title="What people are saying" copy="Real reviews from tailors using TailorDeck." />
          {reviews.length ? (
            <div className="mk-testimonials">
              {reviews.map((review) => (
                <article key={review.id} className="mk-testimonial mk-clay mk-reveal">
                  <div className="mk-stars" aria-label={`${review.rating} out of 5 stars`}>
                    {Array.from({ length: review.rating }, (_, index) => (
                      <Star key={index} size={15} fill="currentColor" />
                    ))}
                  </div>
                  <blockquote>“{review.quote}”</blockquote>
                  <div className="mk-person">
                    <span>{reviewerInitials(review.name)}</span>
                    <div>
                      <b>{review.name}</b>
                      {review.shop || review.city ? <small>{[review.shop, review.city].filter(Boolean).join(' • ')}</small> : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mk-reviews-soon mk-clay mk-reveal">
              <span className="mk-icon-tile">
                <Sparkles size={20} />
              </span>
              <div>
                <h3>Reviews are on the way</h3>
                <p>TailorDeck is new. Feedback from our first tailors will appear here soon. Try it free and tell us what you think.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Pricing: the app's own plan cards, so prices and copy always match the app */}
      <section id="pricing" className="mk-section mk-shell mk-pricing">
        <SectionTitle eyebrow="SIMPLE PRICING" title="Start free. Grow when you’re ready." copy="Every plan is built to pay for itself in saved time and clearer business decisions." />
        <div className="mk-billing">
          <SegmentedControl label="Billing cycle" options={billingCycles} value={cycle} onChange={setCycle} className="subscription-billing-toggle" />
        </div>
        {/* Plans are bought in the app, so the website shows the plan cards without purchase buttons. */}
        <SubscriptionPlanCarousel
          ariaLabel="TailorDeck plans"
          className="mk-plan-carousel"
          cycle={cycle}
          getCtaLabel={(plan) => plan.cta}
          plans={subscriptionPlans}
          selectedPlan={selectedPlan}
          showCta={false}
          onChoosePlan={() => undefined}
          onSelectedPlanChange={setSelectedPlan}
        />
      </section>

      {/* Closing download section: same content, centred, with a large QR code to scan from a computer. */}
      <div className="mk-section">
        <DownloadBand centered />
      </div>

      {videoOpen && settings.demo_video_url ? (
        <DemoVideoDialog src={settings.demo_video_url} poster={settings.demo_video_poster_url} onClose={() => setVideoOpen(false)} />
      ) : null}
    </>
  )
}
