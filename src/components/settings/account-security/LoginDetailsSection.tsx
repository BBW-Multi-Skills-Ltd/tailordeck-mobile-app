import { CheckCircle2, Mail, Phone, UserRound } from 'lucide-react'

type LoginDetailsSectionProps = {
  detailsSavedFlash: boolean
  detailsCodeFeedback: string
  detailsSaving: boolean
  emailConfirmCode: string
  emailConfirming: boolean
  emailChangePendingEmail: string
  email: string
  emailChanged: boolean
  fullName: string
  isEditingDetails: boolean
  phoneLocalPart: string
  onDetailsAction: () => void | Promise<void>
  onEmailConfirmAction: () => void | Promise<void>
  onEmailConfirmCodeChange: (value: string) => void
  onEmailChange: (value: string) => void
  onFullNameChange: (value: string) => void
  onPhoneChange: (value: string) => void
}

export function LoginDetailsSection({
  detailsSavedFlash,
  detailsCodeFeedback,
  detailsSaving,
  emailConfirmCode,
  emailConfirming,
  emailChangePendingEmail,
  email,
  emailChanged,
  fullName,
  isEditingDetails,
  onDetailsAction,
  onEmailConfirmAction,
  onEmailConfirmCodeChange,
  onEmailChange,
  onFullNameChange,
  onPhoneChange,
  phoneLocalPart,
}: LoginDetailsSectionProps) {
  const needsEmailCode = isEditingDetails && emailChanged
  const hasPendingEmailConfirmation = Boolean(emailChangePendingEmail)
  const emailConfirmationFailed = /unable|invalid|expired|failed|error/i.test(detailsCodeFeedback)
  const actionLabel = getActionLabel({ detailsSavedFlash, detailsSaving, isEditingDetails, needsEmailCode })

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

      {hasPendingEmailConfirmation ? (
        <div className="clay-card more-group-card profile-settings-form-card profile-settings-code-card">
          <div className="profile-settings-code-heading">
            <p>Confirm New Email</p>
            <span>Code sent to {emailChangePendingEmail}.</span>
          </div>
          <div className="input-group settings-profile-field">
            <input
              className="input settings-profile-input"
              inputMode="numeric"
              placeholder="Enter email code"
              value={emailConfirmCode}
              onChange={(event) => onEmailConfirmCodeChange(event.target.value.replace(/\D/g, '').slice(0, 8))}
            />
          </div>
          {detailsCodeFeedback ? <span className={emailConfirmationFailed ? 'input-error-text' : 'password-match-hint match'}>{detailsCodeFeedback}</span> : null}
          <button type="button" className="btn btn-primary settings-panel-save-btn profile-settings-save-btn" disabled={emailConfirming || emailConfirmCode.trim().length < 6} onClick={() => void onEmailConfirmAction()}>
            {emailConfirming ? 'Confirming...' : 'Confirm Email'}
          </button>
        </div>
      ) : null}

      {!hasPendingEmailConfirmation ? (
        <button type="button" className={`btn btn-primary settings-panel-save-btn profile-settings-save-btn${detailsSavedFlash ? ' profile-settings-action-saved' : ''}`} disabled={detailsSaving || detailsSavedFlash} onClick={() => void onDetailsAction()}>
          {detailsSavedFlash ? (
            <>
              <CheckCircle2 size={15} />
              Saved
            </>
          ) : (
            actionLabel
          )}
        </button>
      ) : null}
    </section>
  )
}

function getActionLabel({
  detailsSavedFlash,
  detailsSaving,
  isEditingDetails,
  needsEmailCode,
}: {
  detailsSavedFlash: boolean
  detailsSaving: boolean
  isEditingDetails: boolean
  needsEmailCode: boolean
}) {
  if (detailsSavedFlash) return 'Saved'
  if (detailsSaving) return 'Saving...'
  if (!isEditingDetails) return 'Edit Details'
  if (needsEmailCode) return detailsSaving ? 'Sending...' : 'Send Confirmation Code'
  return 'Save Changes'
}
