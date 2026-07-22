import { CheckCircle2, Mail, Phone, UserRound } from 'lucide-react'

type LoginDetailsSectionProps = {
  detailsSavedFlash: boolean
  email: string
  fullName: string
  isEditingDetails: boolean
  phoneLocalPart: string
  onDetailsAction: () => void
  onEmailChange: (value: string) => void
  onFullNameChange: (value: string) => void
  onPhoneChange: (value: string) => void
}

export function LoginDetailsSection({
  detailsSavedFlash,
  email,
  fullName,
  isEditingDetails,
  onDetailsAction,
  onEmailChange,
  onFullNameChange,
  onPhoneChange,
  phoneLocalPart,
}: LoginDetailsSectionProps) {
  return (
    <section className="stack gap-8">
      <p className="more-group-title">Login Details</p>
      <div className="clay-card more-group-card profile-settings-form-card">
        <div className="profile-settings-form-row">
          <span className="more-row-icon clay-inset">
            <UserRound size={17} />
          </span>
          <label>Full Name</label>
          <input className="input profile-settings-form-input" value={fullName} disabled={!isEditingDetails} onChange={(event) => onFullNameChange(event.target.value)} />
          <span className="more-row-divider" aria-hidden />
        </div>

        <div className="profile-settings-form-row">
          <span className="more-row-icon clay-inset">
            <Mail size={17} />
          </span>
          <label>Email</label>
          <input className="input profile-settings-form-input" type="email" value={email} disabled={!isEditingDetails} onChange={(event) => onEmailChange(event.target.value)} />
          <span className="more-row-divider" aria-hidden />
        </div>

        <div className="profile-settings-form-row">
          <span className="more-row-icon clay-inset">
            <Phone size={17} />
          </span>
          <label>Phone</label>
          <div className="settings-phone-input-wrap profile-settings-form-phone">
            <span className="settings-phone-prefix">+234</span>
            <input className="input profile-settings-form-input profile-settings-phone-input" inputMode="numeric" placeholder="8012345678" value={phoneLocalPart} disabled={!isEditingDetails} onChange={(event) => onPhoneChange(event.target.value)} />
          </div>
        </div>
      </div>

      <button type="button" className={`btn btn-primary settings-panel-save-btn profile-settings-save-btn${detailsSavedFlash ? ' profile-settings-action-saved' : ''}`} onClick={onDetailsAction}>
        {detailsSavedFlash ? (
          <>
            <CheckCircle2 size={15} />
            Saved
          </>
        ) : isEditingDetails ? (
          'Save Changes'
        ) : (
          'Edit Details'
        )}
      </button>
    </section>
  )
}
