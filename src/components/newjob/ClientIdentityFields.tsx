type ClientIdentityFieldsProps = {
  clientName: string
  clientPhone: string
  repeatClient: boolean
  onClientNameChange: (value: string) => void
  onClientPhoneChange: (value: string) => void
}

export function ClientIdentityFields({
  clientName,
  clientPhone,
  repeatClient,
  onClientNameChange,
  onClientPhoneChange,
}: ClientIdentityFieldsProps) {
  return (
    <>
      <label className="input-group">
        <span className="input-label">Client Full Name *</span>
        <input className="input" value={clientName} onChange={(event) => onClientNameChange(event.target.value)} placeholder="e.g. Amina Bello" autoFocus readOnly={repeatClient} />
      </label>

      <label className="input-group">
        <span className="input-label">Phone / WhatsApp *</span>
        <input className="input" value={clientPhone} onChange={(event) => onClientPhoneChange(event.target.value)} placeholder="e.g. 08012345678" inputMode="tel" readOnly={repeatClient} />
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
