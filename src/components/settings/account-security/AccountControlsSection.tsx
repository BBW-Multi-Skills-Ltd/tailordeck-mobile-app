import { ShieldAlert, Trash2 } from 'lucide-react'
import type { AccountDangerAction } from './accountSecurityTypes'

type AccountControlsSectionProps = {
  onDanger: (kind: AccountDangerAction) => void
}

export function AccountControlsSection({ onDanger }: AccountControlsSectionProps) {
  return (
    <section className="stack gap-8">
      <p className="more-group-title">Account Controls</p>
      <div className="clay-card more-group-card">
        <button type="button" className="profile-settings-control-row danger" onClick={() => onDanger('deactivate')}>
          <span className="more-row-icon clay-inset">
            <ShieldAlert size={17} />
          </span>
          <span className="more-row-label">Deactivate Account</span>
          <span className="more-row-divider" aria-hidden />
        </button>
        <button type="button" className="profile-settings-control-row danger permanent" onClick={() => onDanger('delete')}>
          <span className="more-row-icon clay-inset">
            <Trash2 size={17} />
          </span>
          <span className="more-row-label">Delete Account Permanently</span>
        </button>
      </div>
    </section>
  )
}
