import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'

export default function AboutTailorDeckPanel() {
  return (
    <div className="settings-about-content">
      <section className="settings-about-section settings-about-hero">
        <div className="settings-about-brand">
          <span className="app-shell-logo-wrap settings-about-logo-wrap" aria-hidden>
            <img
              src="/branding/TailorDeck%20app%20logo%20for%20splac%20screen.png"
              alt=""
              className="app-shell-logo"
            />
          </span>
          <p className="app-shell-logo-text settings-about-brand-text">TailorDeck</p>
        </div>
        <h2>Your shop, in your pocket.</h2>
        <p>Version 1.0.0</p>
      </section>

      <section className="settings-about-section">
        <h3>What TailorDeck Does</h3>
        <p>
          TailorDeck helps Nigerian tailors and fashion designers manage clients, measurements, jobs,
          deadlines, invoices, receipts, and business records in one simple app.
        </p>
      </section>

      <section className="settings-about-section">
        <h3>Built For</h3>
        <ul className="settings-about-bullet-list">
          <li>Nigerian tailors</li>
          <li>Fashion designers</li>
          <li>Growing shops</li>
        </ul>
      </section>

      <section className="settings-about-section">
        <h3>Ownership</h3>
        <p>TailorDeck is a product of BBW Tech-Innovation, a technology subsidiary of BBW Multi-Skills Ltd.</p>
        <p>BBW Multi-Skills Ltd builds practical solutions across technology, construction, maintenance, lifestyle, and business innovation.</p>
      </section>

      <section className="settings-about-section">
        <h3>Our Vision</h3>
        <p>TailorDeck is built to help African fashion businesses move from paper-based management to simple, professional digital tools.</p>
      </section>

      <section className="settings-about-section">
        <h3>Coming Next</h3>
        <p>
          Future versions will help tailors connect with material vendors, equipment suppliers, updated market prices,
          delivery options, pickup options, and vendor communication.
        </p>
      </section>

      <section className="settings-about-section">
        <h3>Official Links</h3>
        <div className="settings-about-link-grid">
          <a href="https://tailordeck.com.ng" target="_blank" rel="noreferrer">tailordeck.com.ng</a>
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms-of-service">Terms of Service</Link>
        </div>
      </section>

      <p className="settings-about-footer">
        Built with <Heart size={13} fill="currentColor" strokeWidth={0} aria-label="love" /> for tailors and fashion designers.
      </p>
    </div>
  )
}

