import type { ReactNode } from 'react'

type ReviewRowProps = {
  icon: ReactNode
  label: string
  value: string
  valueClassName?: string
}

export function ReviewRow({ icon, label, value, valueClassName }: ReviewRowProps) {
  return (
    <div className="wizard-detail-row">
      <span className="wizard-detail-icon">{icon}</span>
      <p className="wizard-detail-line">
        <span className="text-muted">{label}:</span> <strong className={valueClassName}>{value || '-'}</strong>
      </p>
    </div>
  )
}

