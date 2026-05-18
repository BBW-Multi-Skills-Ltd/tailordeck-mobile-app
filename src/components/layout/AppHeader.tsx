import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { HiChevronDown, HiOutlineBell } from 'react-icons/hi2'

const AVATAR_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' rx='60' fill='%23F2EEE9'/%3E%3Ccircle cx='60' cy='44' r='20' fill='%23C9A84C'/%3E%3Cpath d='M24 104C24 82.9 41.2 66 62.3 66h-4.6C36.6 66 19.4 82.9 19.4 104V120H100.6V104C100.6 82.9 83.4 66 62.3 66z' fill='%237B1E37'/%3E%3Ccircle cx='60' cy='60' r='58' fill='none' stroke='%23E8E0D8' stroke-width='4'/%3E%3C/svg%3E"

export default function AppHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
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
            <img src={AVATAR_PLACEHOLDER} alt="User avatar placeholder" className="app-profile-image" />
            <span className="app-business-name">Elon Apparel</span>
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
