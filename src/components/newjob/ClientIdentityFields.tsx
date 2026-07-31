type ClientIdentityFieldsProps = {
  clientName: string
  clientPhone: string
  clientNameError?: string
  clientPhoneError?: string
  errorKey: number
  repeatClient: boolean
  onClientNameChange: (value: string) => void
  onClientPhoneChange: (value: string) => void
}

export function ClientIdentityFields({
  clientName,
  clientPhone,
  clientNameError,
  clientPhoneError,
  errorKey,
  repeatClient,
  onClientNameChange,
  onClientPhoneChange,
}: ClientIdentityFieldsProps) {
  return (
    <>
      <label className="input-group">
        <span className="input-label">Client Full Name *</span>
        <input
          key={`client-name-${errorKey}`}
          className={`input${clientNameError ? ' input-invalid input-shake' : ''}`}
          value={clientName}
          onChange={(event) => onClientNameChange(event.target.value)}
          placeholder="Client name"
          autoFocus
          readOnly={repeatClient}
          aria-invalid={Boolean(clientNameError)}
        />
        {clientNameError ? <span className="input-error-text">{clientNameError}</span> : null}
      </label>

      <label className="input-group">
        <span className="input-label">Phone / WhatsApp *</span>
        <div className="prefix-input-wrap">
          <span className="fixed-input-prefix">+234</span>
          <input
            key={`client-phone-${errorKey}`}
            className={`input auth-input-prefixed${clientPhoneError ? ' input-invalid input-shake' : ''}`}
            value={clientPhone}
            onChange={(event) => onClientPhoneChange(event.target.value)}
            placeholder="Client WhatsApp contact"
            inputMode="tel"
            readOnly={repeatClient}
            aria-invalid={Boolean(clientPhoneError)}
          />
        </div>
        {clientPhoneError ? <span className="input-error-text">{clientPhoneError}</span> : null}
      </label>

      {repeatClient ? (
        <article className="card stack gap-6 wizard-repeat-client-note">
          <p className="text-sm font-semibold">Existing client selected</p>
          <p className="text-sm text-muted">Client details and latest measurements are prefilled. Edit measurements here only if this new job needs updated values.</p>
        </article>
      ) : null}
    </>
  )
}
