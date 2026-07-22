import { CheckCircle2, Circle } from 'lucide-react'
import type { InvoiceSetupChecklistItem } from './invoiceReceiptTypes'

export function InvoiceSetupProgress({
  completeCount,
  items,
  progress,
}: {
  completeCount: number
  items: InvoiceSetupChecklistItem[]
  progress: number
}) {
  return (
    <section className="settings-document-progress">
      <div className="row-between">
        <div>
          <p className="settings-document-progress-kicker">Invoice setup</p>
          <h3>{progress}% complete</h3>
        </div>
        <span className="settings-document-progress-count">
          {completeCount}/{items.length}
        </span>
      </div>
      <div className="settings-document-progress-track" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>
      <div className="settings-document-checklist">
        {items.map((item) => (
          <span key={item.label} className={`settings-document-check${item.complete ? ' complete' : ''}`}>
            {item.complete ? <CheckCircle2 size={13} /> : <Circle size={13} />}
            {item.label}
          </span>
        ))}
      </div>
    </section>
  )
}

export function SectionHeader({ helper, title }: { helper: string; title: string }) {
  return (
    <div className="stack gap-4">
      <p className="settings-brand-label">{title}</p>
      <p className="settings-help-text">{helper}</p>
    </div>
  )
}
