import { Link } from 'react-router-dom'
import { HiChevronDown } from 'react-icons/hi2'
import type { RefObject } from 'react'
import { AVATAR_PLACEHOLDER, type TailorSettings } from '../../lib/settings'
import { SmartImage } from '../shared/SmartImage'

type ProfileMenuProps = {
  menuOpen: boolean
  menuRef: RefObject<HTMLDivElement | null>
  settings: TailorSettings
  onSignOut: () => void
  onToggle: () => void
  onClose: () => void
}

export default function ProfileMenu({ menuOpen, menuRef, onClose, onSignOut, onToggle, settings }: ProfileMenuProps) {
  return (
    <div className="app-profile-menu" ref={menuRef}>
      <button type="button" className="app-profile-trigger" aria-haspopup="menu" aria-expanded={menuOpen} aria-label="Open profile menu" onClick={onToggle}>
        <SmartImage
          src={settings.profile.avatarUrl || AVATAR_PLACEHOLDER}
          alt="User avatar placeholder"
          wrapperClassName="app-profile-image"
          fallback={<span className="smart-image-initial">{settings.profile.fullName?.charAt(0) || 'U'}</span>}
          loading="eager"
        />
        <span className="app-business-name">{settings.businessInfo.shopName || 'Your Shop'}</span>
        <HiChevronDown size={16} className={`app-menu-chevron${menuOpen ? ' open' : ''}`} />
      </button>

      {menuOpen ? (
        <div className="app-profile-dropdown" role="menu" aria-label="Profile menu">
          <Link to="/settings/security" className="app-profile-menu-item" role="menuitem" onClick={onClose}>
            My Profile
          </Link>
          <Link to="/settings" className="app-profile-menu-item" role="menuitem" onClick={onClose}>
            Settings
          </Link>
          <button type="button" className="app-profile-menu-item danger" role="menuitem" onClick={onSignOut}>
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  )
}
