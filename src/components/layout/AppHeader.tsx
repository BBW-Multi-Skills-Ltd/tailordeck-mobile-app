import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { HiChevronDown, HiOutlineBell } from 'react-icons/hi2'
import { AVATAR_PLACEHOLDER, loadTailorSettings } from '../../lib/settings'

export default function AppHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [settings, setSettings] = useState(() => loadTailorSettings())
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current) return
      const target = event.target
      if (target instanceof Node && !menuRef.current.contains(target)) {
        setMenuOpen(false)
      }
    }

    window.addEventListener('mousedown', handlePointerDown)
    return () => window.removeEventListener('mousedown', handlePointerDown)
  }, [])

  useEffect(() => {
    function syncSettings() {
      setSettings(loadTailorSettings())
    }

    window.addEventListener('storage', syncSettings)
    window.addEventListener('tailordeck-settings-updated', syncSettings)
    return () => {
      window.removeEventListener('storage', syncSettings)
      window.removeEventListener('tailordeck-settings-updated', syncSettings)
    }
  }, [])

  return (
    <header className="app-shell-header">
      <div className="app-shell-left">
        <img src="/branding/TailorDeck%20app%20logo%20for%20in%20app.png" alt="TailorDeck logo" className="app-shell-logo" />
        <p className="app-shell-logo-text">TailorDeck</p>
      </div>

      <div className="app-shell-right app-header-actions">
        <div className="app-profile-menu" ref={menuRef}>
          <button
            type="button"
            className="app-profile-trigger"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Open profile menu"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <img src={settings.profile.avatarUrl || AVATAR_PLACEHOLDER} alt="User avatar placeholder" className="app-profile-image" />
            <span className="app-business-name">{settings.businessInfo.shopName || 'Elon Apparel'}</span>
            <HiChevronDown size={16} className={`app-menu-chevron${menuOpen ? ' open' : ''}`} />
          </button>

          {menuOpen ? (
            <div className="app-profile-dropdown" role="menu" aria-label="Profile menu">
              <button type="button" className="app-profile-menu-item" role="menuitem" onClick={() => setMenuOpen(false)}>
                My Profile
              </button>
              <Link to="/settings" className="app-profile-menu-item" role="menuitem" onClick={() => setMenuOpen(false)}>
                Settings
              </Link>
              <button
                type="button"
                className="app-profile-menu-item danger"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
              >
                Sign out
              </button>
            </div>
          ) : null}
        </div>

        <button type="button" className="btn btn-ghost btn-icon app-bell-button has-notification-badge" aria-label="Notifications">
          <span className="notification-badge notification-badge--bell-shoulder" aria-label="Unread notifications">
            1
          </span>
          <HiOutlineBell size={20} />
        </button>
      </div>
    </header>
  )
}
