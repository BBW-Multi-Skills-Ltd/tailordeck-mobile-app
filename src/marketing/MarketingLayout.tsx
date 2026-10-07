import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Menu, Moon, Sun, X } from 'lucide-react'
import { FaApple, FaFacebookF, FaGooglePlay, FaInstagram, FaTiktok, FaWhatsapp, FaXTwitter } from 'react-icons/fa6'
import { Link, useLocation } from 'react-router-dom'
import type { AppTheme } from '../lib/theme'
import { getSiteTheme, toggleSiteTheme } from './siteTheme'
import { PLAY_STORE_URL, SUPPORT_EMAIL } from '../lib/webAccess'
import { marketingLinks } from './marketingContent'

// Website copy of the app icon: cropped to the burgundy square with transparent corners
// (the app's icon file has a light border and shadow baked in, which showed as a white frame).
export const APP_ICON_SRC = '/marketing/tailordeck-icon.png'
// Web-sized copy (320×180, transparent) of public/bbwlogo.png.
export const BBW_LOGO_SRC = '/marketing/bbw-logo.png'

const NAV_ITEMS = [
  { id: 'product', label: 'Product' },
  { id: 'features', label: 'Features' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'pricing', label: 'Pricing' },
]

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="mk-brand">
      <img src={APP_ICON_SRC} alt="" width={34} height={34} />
      {compact ? null : <span>TailorDeck</span>}
    </span>
  )
}

export function PlayButton({ children = 'Get it on Google Play', variant = 'primary' }: { children?: ReactNode; variant?: 'primary' | 'light' }) {
  return (
    <a className={`mk-btn mk-btn-${variant}`} href={PLAY_STORE_URL} target="_blank" rel="noreferrer">
      <FaGooglePlay size={16} aria-hidden />
      {children}
    </a>
  )
}

/**
 * iOS badge. Not a link until the iPhone app launches; then set marketingLinks.appStore and it becomes one.
 */
export function AppStoreBadge({ variant = 'default' }: { variant?: 'default' | 'light' }) {
  const content = (
    <>
      <FaApple size={19} aria-hidden />
      <span className="mk-store-text">
        <small>{marketingLinks.appStore ? 'Download on the' : 'Coming soon on the'}</small>
        App Store
      </span>
    </>
  )
  const className = `mk-store-badge mk-store-badge-${variant}`
  if (marketingLinks.appStore) {
    return (
      <a className={className} href={marketingLinks.appStore} target="_blank" rel="noreferrer">
        {content}
      </a>
    )
  }
  return (
    <span className={`${className} mk-store-badge-soon`} aria-label="iPhone app coming soon on the App Store">
      {content}
    </span>
  )
}

/** Highlights the nav item of the section currently on screen (home page only). */
function useActiveSection(enabled: boolean): string {
  const [active, setActive] = useState('')
  useEffect(() => {
    if (!enabled) return undefined
    function update() {
      const marker = window.scrollY + 180
      let current = ''
      for (const { id } of NAV_ITEMS) {
        const section = document.getElementById(id)
        if (section && section.offsetTop <= marker) current = id
      }
      setActive(current)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [enabled])
  return enabled ? active : ''
}

function Header() {
  const { pathname } = useLocation()
  const onHome = pathname === '/'
  const activeSection = useActiveSection(onHome)
  const [theme, setTheme] = useState<AppTheme>(() => getSiteTheme())
  const [menuOpen, setMenuOpen] = useState(false)
  const navRef = useRef<HTMLElement | null>(null)
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null)

  useEffect(() => {
    function place() {
      const link = activeSection ? navRef.current?.querySelector<HTMLAnchorElement>(`a[data-section="${activeSection}"]`) : null
      setIndicator(link ? { left: link.offsetLeft, width: link.offsetWidth } : null)
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [activeSection])

  const sectionHref = (id: string) => (onHome ? `#${id}` : `/#${id}`)

  return (
    <>
      <div className="mk-header-veil" aria-hidden />
      <header className="mk-header mk-clay">
        <Link to="/" className="mk-logo-link" aria-label="TailorDeck home" onClick={() => setMenuOpen(false)}>
          <BrandLogo />
        </Link>

        <nav ref={navRef} className="mk-nav" aria-label="Main">
          {indicator ? <span className="mk-nav-indicator" style={{ left: indicator.left, width: indicator.width }} /> : null}
          {NAV_ITEMS.map((item) => (
            <a key={item.id} href={sectionHref(item.id)} data-section={item.id} className={activeSection === item.id ? 'active' : ''}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="mk-header-actions">
          <button
            type="button"
            className="mk-icon-btn"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={() => setTheme(toggleSiteTheme())}
          >
            {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <span className="mk-header-play">
            <PlayButton />
          </span>
          <button
            type="button"
            className="mk-icon-btn mk-menu-btn"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen ? (
          <div className="mk-mobile-sheet mk-clay">
            {NAV_ITEMS.map((item) => (
              <a key={item.id} href={sectionHref(item.id)} className={activeSection === item.id ? 'active' : ''} onClick={() => setMenuOpen(false)}>
                {item.label}
              </a>
            ))}
            <PlayButton />
          </div>
        ) : null}
      </header>
    </>
  )
}

function Socials() {
  const socials = [
    { href: marketingLinks.instagram, label: 'Instagram', icon: FaInstagram },
    { href: marketingLinks.facebook, label: 'Facebook', icon: FaFacebookF },
    { href: marketingLinks.x, label: 'X (formerly Twitter)', icon: FaXTwitter },
    { href: marketingLinks.tiktok, label: 'TikTok', icon: FaTiktok },
  ].filter((social) => social.href)
  if (!socials.length) return null
  return (
    <div className="mk-socials" aria-label="Social media">
      {socials.map(({ href, label, icon: Icon }) => (
        <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}>
          <Icon size={15} />
        </a>
      ))}
    </div>
  )
}

function Footer() {
  const whatsappHref = marketingLinks.whatsappNumber ? `https://wa.me/${marketingLinks.whatsappNumber}` : ''
  return (
    <footer className="mk-footer mk-clay">
      <div className="mk-shell mk-footer-grid">
        <div className="mk-footer-brand">
          <BrandLogo />
          <p>The pocket-sized business manager made for tailors and fashion designers.</p>
          <Socials />
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
          {whatsappHref ? (
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="mk-footer-whatsapp">
              <FaWhatsapp size={15} aria-hidden /> WhatsApp us
            </a>
          ) : null}
        </div>
        <div>
          <b>Product</b>
          <a href="/#features">Features</a>
          <a href="/#how-it-works">How it works</a>
          <a href="/#pricing">Pricing</a>
          <a href="/#download">Download</a>
        </div>
        <div>
          <b>Company</b>
          {marketingLinks.founderPage ? <a href={marketingLinks.founderPage}>Meet the founder</a> : null}
          <a href={marketingLinks.companySite} target="_blank" rel="noreferrer">
            BBW Tech Innovations
          </a>
          <a href="/#mission">Our mission</a>
          <a href={`mailto:${SUPPORT_EMAIL}`}>Contact</a>
        </div>
        <div>
          <b>Legal</b>
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms-of-service">Terms of Use</Link>
          <Link to="/delete-account">Delete your account</Link>
        </div>
      </div>
      <div className="mk-shell mk-partners">
        <b>Partners</b>
        {/* The logo already reads "BBW", so the name continues after it (as in the BBW Tech wordmark). */}
        <span className="mk-partner">
          <img src={BBW_LOGO_SRC} alt="BBW" width={50} height={28} loading="lazy" />
          <span>
            <b>Multi-Skills</b> Ltd
          </span>
        </span>
        <span className="mk-partner">
          <img src={BBW_LOGO_SRC} alt="BBW" width={50} height={28} loading="lazy" />
          <span>
            <b>Tech</b> Innovations
          </span>
        </span>
        <BrandLogo />
      </div>
      <div className="mk-shell mk-footer-bottom">
        <span>© {new Date().getFullYear()} BBW Tech Innovations. All rights reserved.</span>
        <Link to="/admin" className="mk-admin-link">
          Admin
        </Link>
      </div>
    </footer>
  )
}

export default function MarketingLayout({ children }: { children: ReactNode }) {
  const { pathname, hash } = useLocation()

  // Section links from other pages (e.g. "/#pricing") land on the home page; scroll once it has rendered.
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0)
      return
    }
    const timer = window.setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 60)
    return () => window.clearTimeout(timer)
  }, [pathname, hash])

  return (
    <div className="mk-site">
      <Header />
      <main className="mk-main">{children}</main>
      <Footer />
    </div>
  )
}
