import { AlertCircle, CheckCircle2, ChevronDown, Clock, WalletCards } from 'lucide-react'
import { formatNaira } from '../../lib/utils'
import { reminders, type JobType, type MakeCategory, type PersonForm, type Reminder } from './newJobConfig'
import { ReferencePhotoUpload, type ReferencePhotoTarget } from './ReferencePhotoUpload'

type DeadlineFieldsProps = {
  balance: number
  clientName: string
  deadlineDate: string
  deadlineTime: string
  effectiveItemType: string
  jobType: JobType
  makeCategory: MakeCategory
  persons: PersonForm[]
  referencePhotoNamesByTarget: Record<string, string[]>
  reminder: Reminder
  sameItemForAll: boolean
  onDeadlineDateChange: (value: string) => void
  onDeadlineTimeChange: (value: string) => void
  onReferencePhotoUpload: (targetId: string, files: FileList | null, maxFiles: number) => void
  onReminderChange: (value: Reminder) => void
}

export function DeadlineFields({
  balance,
  clientName,
  deadlineDate,
  deadlineTime,
  effectiveItemType,
  jobType,
  makeCategory,
  persons,
  referencePhotoNamesByTarget,
  reminder,
  sameItemForAll,
  onDeadlineDateChange,
  onDeadlineTimeChange,
  onReferencePhotoUpload,
  onReminderChange,
}: DeadlineFieldsProps) {
  const reminderLabel = reminder === 'none' ? 'No reminder' : reminder
  const referencePhotoTargets = getReferencePhotoTargets({
    clientName,
    effectiveItemType,
    jobType,
    makeCategory,
    persons,
    sameItemForAll,
  })
  const checklistItems = [
    {
      icon: <WalletCards size={15} />,
      label: 'Balance due',
      value: formatNaira(balance),
      complete: true,
    },
    {
      icon: <CheckCircle2 size={15} />,
      label: 'Delivery date',
      value: deadlineDate || 'Select date',
      complete: Boolean(deadlineDate),
    },
    {
      icon: <Clock size={15} />,
      label: 'Delivery time',
      value: deadlineTime || 'Optional',
      complete: Boolean(deadlineTime),
    },
    {
      icon: <AlertCircle size={15} />,
      label: 'Reminder',
      value: reminderLabel,
      complete: true,
    },
  ]

  return (
    <div className="stack gap-12">
      <div className="card wizard-deadline-entry-card">
        <div className="wizard-deadline-input-grid">
          <label className="input-group">
            <span className="wizard-section-label">Delivery Date *</span>
            <div className="wizard-select-input-wrap">
              <input className="input wizard-select-input" type="date" value={deadlineDate} onChange={(event) => onDeadlineDateChange(event.target.value)} />
              <ChevronDown size={18} className="wizard-select-chevron" />
            </div>
          </label>

          <label className="input-group">
            <span className="wizard-section-label">Delivery Time</span>
            <div className="wizard-select-input-wrap">
              <input className="input wizard-select-input" type="time" value={deadlineTime} onChange={(event) => onDeadlineTimeChange(event.target.value)} />
              <ChevronDown size={18} className="wizard-select-chevron" />
            </div>
          </label>
        </div>
      </div>

      <div className="input-group">
        <span className="wizard-section-label">Remind me before deadline</span>
        <div className="wizard-reminder-scroll">
          {reminders.map((value) => (
            <button key={value} type="button" className={`pill${reminder === value ? ' active' : ''}`} onClick={() => onReminderChange(value)}>
              {value === 'none' ? 'No reminder' : value}
            </button>
          ))}
        </div>
      </div>

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

      <ReferencePhotoUpload
        namesByTarget={referencePhotoNamesByTarget}
        targets={referencePhotoTargets}
        onReferencePhotoUpload={onReferencePhotoUpload}
      />
    </div>
  )
}

function getReferencePhotoTargets(params: {
  clientName: string
  effectiveItemType: string
  jobType: JobType
  makeCategory: MakeCategory
  persons: PersonForm[]
  sameItemForAll: boolean
}): ReferencePhotoTarget[] {
  const { clientName, effectiveItemType, jobType, makeCategory, persons, sameItemForAll } = params
  const itemLabel = effectiveItemType || 'Style guide'

  if (makeCategory !== 'Body Wear' || jobType === 'Single') {
    const primaryPerson = persons[0]
    return [
      {
        id: primaryPerson?.id ?? 'primary',
        label: `Upload for ${primaryPerson?.name || clientName || 'client'}`,
        meta: itemLabel,
        maxFiles: 2,
      },
    ]
  }

  if (sameItemForAll) {
    return [
      {
        id: 'shared',
        label: 'Upload shared inspiration',
        meta: `${jobType} - ${itemLabel}`,
        maxFiles: 3,
      },
    ]
  }

  return persons.map((person, index) => ({
    id: person.id,
    label: `Upload for ${person.name || (index === 0 ? clientName || 'client' : `Person ${index + 1}`)}`,
    meta: person.itemType || itemLabel,
    maxFiles: 2,
  }))
}
