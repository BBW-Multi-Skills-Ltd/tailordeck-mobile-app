import { AlertCircle, CheckCircle2, Clock, WalletCards } from 'lucide-react'
import { formatNaira } from '../../../lib/utils'
import type { Reminder } from '../newJobConfig'

export function DeliveryChecklist({ balance, deadlineDate, deadlineTime, reminder }: { balance: number; deadlineDate: string; deadlineTime: string; reminder: Reminder }) {
  const reminderLabel = reminder === 'none' ? 'No reminder' : reminder
  const checklistItems = [
    { icon: <WalletCards size={15} />, label: 'Balance due', value: formatNaira(balance), complete: true },
    { icon: <CheckCircle2 size={15} />, label: 'Delivery date', value: deadlineDate || 'Select date', complete: Boolean(deadlineDate) },
    { icon: <Clock size={15} />, label: 'Delivery time', value: deadlineTime || 'Optional', complete: Boolean(deadlineTime) },
    { icon: <AlertCircle size={15} />, label: 'Reminder', value: reminderLabel, complete: true },
  ]

  return (
    <article className="card stack gap-8 wizard-deadline-checklist">
      <div className="row-between">
        <div>
          <h4>Delivery Checklist</h4>
          <p className="text-sm text-muted">Confirm the details needed before final review.</p>
        </div>
        <span className={deadlineDate ? 'wizard-checklist-score is-ready' : 'wizard-checklist-score'}>
          {deadlineDate ? 'Ready' : '1 left'}
        </span>
      </div>
      <div className="wizard-checklist-grid">
        {checklistItems.map((item) => (
          <div key={item.label} className={`wizard-checklist-row${item.complete ? ' is-complete' : ''}`}>
            <span className="wizard-checklist-icon">{item.icon}</span>
            <span className="wizard-checklist-copy">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </span>
            <CheckCircle2 size={15} className="wizard-checklist-status" />
          </div>
        ))}
      </div>
    </article>
  )
}
