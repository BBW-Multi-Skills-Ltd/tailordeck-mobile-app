import { HiOutlineBell } from 'react-icons/hi2'

export default function AppHeader() {
  return (
    <>
      <header className="app-shell-header">
        <div className="row gap-8">
          <div className="center app-shell-avatar">TD</div>
          <p className="app-shell-brand">TailorDeck</p>
        </div>

        <button type="button" className="btn btn-ghost btn-icon" aria-label="Notifications">
          <HiOutlineBell size={20} />
        </button>
      </header>

      <div className="notification-placeholder">
        <p>Notification center placeholder</p>
      </div>
    </>
  )
}
