import { HiOutlineBell } from 'react-icons/hi2'
import NotificationDrawer from './NotificationDrawer'
import ProfileMenu from './ProfileMenu'
import SignOutConfirmDialog from './SignOutConfirmDialog'
import { useAppHeader } from './useAppHeader'

export default function AppHeader() {
  const { actions, menuRef, state } = useAppHeader()

  return (
    <>
      <header className="app-shell-header">
        <div className="app-shell-left">
          <span className="app-shell-logo-wrap">
            <img
              src="/branding/TailorDeck%20app%20logo%20for%20splac%20screen.png"
              alt="TailorDeck logo"
              className="app-shell-logo"
              decoding="async"
              loading="eager"
            />
          </span>
          <p className="app-shell-logo-text">TailorDeck</p>
        </div>

        <div className="app-shell-right app-header-actions">
          <ProfileMenu
            menuOpen={state.menuOpen}
            menuRef={menuRef}
            settings={state.settings}
            onClose={() => actions.setMenuOpen(false)}
            onSignOut={actions.handleSignOut}
            onToggle={() => actions.setMenuOpen((prev) => !prev)}
          />

          <button type="button" className="btn btn-ghost btn-icon app-bell-button has-notification-badge" aria-label="Notifications" onClick={actions.handleBellClick}>
            {state.unreadCount > 0 ? (
              <span className="notification-badge notification-badge--bell-shoulder" aria-label="Unread notifications">
                {state.unreadCount > 99 ? '99+' : state.unreadCount}
              </span>
            ) : null}
            <HiOutlineBell size={20} />
          </button>
        </div>
      </header>

      {state.drawerOpen ? (
        <NotificationDrawer
          errorMessage={state.notificationError}
          filter={state.filter}
          notifications={state.notifications}
          onClearAll={actions.handleClearAll}
          onClose={actions.closeNotificationDrawer}
          onDelete={actions.deleteItem}
          onFilterChange={actions.setFilter}
          onItemOpen={actions.handleItemOpen}
          onMarkAllRead={actions.markAllRead}
          onMarkRead={actions.markRead}
        />
      ) : null}

      {state.signOutConfirmOpen ? (
        <SignOutConfirmDialog
          onCancel={() => actions.setSignOutConfirmOpen(false)}
          onConfirm={() => {
            void actions.confirmSignOut()
          }}
        />
      ) : null}
    </>
  )
}
