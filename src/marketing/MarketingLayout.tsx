import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PLAY_STORE_URL, SUPPORT_EMAIL } from '../lib/webAccess'

export const APP_ICON_SRC = '/Tailor%20deck%20app%20icon%20for%20phone%20screen.png'

export function GooglePlayButton({ className = '' }: { className?: string }) {
  return (
    <a className={`mk-play-btn${className ? ` ${className}` : ''}`} href={PLAY_STORE_URL} target="_blank" rel="noreferrer">
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
        <path fill="currentColor" d="M4.2 2.6 13.9 12l-9.7 9.4a1.5 1.5 0 0 1-.7-1.3V3.9c0-.5.3-1 .7-1.3Zm11.1 10.8 2.6 2.5-11.5 6.6 8.9-9.1Zm4.2-3.6c.9.5.9 1.9 0 2.4l-2.3 1.3-2.8-2.7 2.8-2.7 2.3 1.7Zm-13-7.2 11.5 6.6-2.6 2.5-8.9-9.1Z" />
      </svg>
      <span>
        <small>Get it on</small>
        Google Play
      </span>
    </a>
  )
}

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mk-site">
      <header className="mk-header">
        <Link to="/" className="mk-brand" aria-label="TailorDeck home">
          <img src={APP_ICON_SRC} alt="" width={36} height={36} />
          <span>TailorDeck</span>
        </Link>
        <a className="mk-header-cta" href={PLAY_STORE_URL} target="_blank" rel="noreferrer">
          Get the app
        </a>
      </header>

      <main className="mk-main">{children}</main>

      <footer className="mk-footer">
        <div className="mk-footer-brand">
          <img src={APP_ICON_SRC} alt="" width={28} height={28} />
          <p>
            <strong>TailorDeck</strong> is a product of BBW Tech Innovations, a technology division under BBW Multi-Skills Ltd.
          </p>
        </div>
        <nav className="mk-footer-links" aria-label="Legal and support">
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms-of-service">Terms of Service</Link>
          <Link to="/delete-account">Delete your account</Link>
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        </nav>
        <p className="mk-footer-copy">© {new Date().getFullYear()} BBW Tech Innovations. All rights reserved.</p>
      </footer>
    </div>
  )
}
