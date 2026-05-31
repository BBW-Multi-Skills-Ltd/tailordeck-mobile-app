import { motion } from 'framer-motion'
import {
  Banknote,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Coins,
  FileText,
  Images,
  Layers,
  Package,
  Palette,
  Phone,
  Ruler,
  Scissors,
  Shirt,
  TrendingUp,
  Truck,
  UserRound,
  Wrench,
} from 'lucide-react'
import { formatNaira } from '../../lib/utils'
import {
  numericValue,
  reminders,
  type ExpenseForm,
  type MakeCategory,
  type MaterialQuality,
  type MaterialSource,
  type OrderMode,
  type PersonForm,
  type Reminder,
} from './newJobConfig'
import { ReviewRow } from './NewJobChrome'

type StepDeadlineReviewProps = {
  reviewMode: boolean
  detailsOpen: boolean
  draftSaved: boolean
  balance: number
  reminder: Reminder
  deadlineDate: string
  deadlineTime: string
  clientName: string
  clientPhone: string
  orderMode: OrderMode
  makeCategory: MakeCategory
  scopeLabel: string
  sameItemForAll: boolean
  effectiveItemType: string
  persons: PersonForm[]
  selectedNonBodyFields: string[]
  isAmendmentMode: boolean
  nonBodyDescription: string
  amendmentIssueType: string
  amendmentArea: string
  amendmentTarget: string
  amendmentDescription: string
  selectedMaterialValue: string
  materialColor: string
  materialYards: string
  materialQuality: MaterialQuality
  materialSource: MaterialSource
  charge: number
  deposit: number
  referencePhotoNames: string[]
  expenses: ExpenseForm[]
  totalExpenses: number
  projectedProfit: number
  onDeadlineDateChange: (value: string) => void
  onDeadlineTimeChange: (value: string) => void
  onReminderChange: (value: Reminder) => void
  onDetailsOpenChange: (updater: (previous: boolean) => boolean) => void
}

export default function StepDeadlineReview({
  reviewMode,
  detailsOpen,
  draftSaved,
  balance,
  reminder,
  deadlineDate,
  deadlineTime,
  clientName,
  clientPhone,
  orderMode,
  makeCategory,
  scopeLabel,
  sameItemForAll,
  effectiveItemType,
  persons,
  selectedNonBodyFields,
  isAmendmentMode,
  nonBodyDescription,
  amendmentIssueType,
  amendmentArea,
  amendmentTarget,
  amendmentDescription,
  selectedMaterialValue,
  materialColor,
  materialYards,
  materialQuality,
  materialSource,
  charge,
  deposit,
  referencePhotoNames,
  expenses,
  totalExpenses,
  projectedProfit,
  onDeadlineDateChange,
  onDeadlineTimeChange,
  onReminderChange,
  onDetailsOpenChange,
}: StepDeadlineReviewProps) {
  if (!reviewMode) {
    return (
      <div className="stack gap-12">
        <article className="card stack gap-8 wizard-deadline-checklist">
          <h4>Delivery Checklist</h4>
          <p className="text-sm text-muted">Balance due on delivery: <strong>{formatNaira(balance)}</strong></p>
          <p className="text-sm text-muted">Reminder set: <strong>{reminder === 'none' ? 'No reminder' : reminder}</strong></p>
          <p className="text-sm text-muted">
            Deadline readiness:{' '}
            <strong className={deadlineDate ? 'text-success' : 'text-danger'}>
              {deadlineDate ? 'Ready to proceed' : 'Select delivery date'}
            </strong>
          </p>
        </article>

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
      </div>
    )
  }

  return (
    <div className="stack gap-12">
      <div className="card stack gap-10">
        <div className="row-between">
          <h4>Job Details</h4>
        </div>

        <button type="button" className="row-between wizard-person-toggle" onClick={() => onDetailsOpenChange((prev) => !prev)} aria-expanded={detailsOpen}>
          <h5>Review Summary</h5>
          {detailsOpen ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
        </button>

        <motion.div
          className="stack gap-6 wizard-collapsible"
          initial={false}
          animate={{ height: detailsOpen ? 'auto' : 0, opacity: detailsOpen ? 1 : 0 }}
          transition={{
            height: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
            opacity: { duration: 0.2, ease: 'easeOut' },
          }}
          style={{ pointerEvents: detailsOpen ? 'auto' : 'none' }}
        >
          <ReviewRow icon={<UserRound size={15} className="text-primary" />} label="Client name" value={clientName || '-'} />
          <ReviewRow icon={<Phone size={15} className="text-success" />} label="Client phone" value={clientPhone || '-'} />
          <ReviewRow icon={<Wrench size={15} className="text-gold" />} label="Order mode" value={orderMode} />
          <ReviewRow icon={<Shirt size={15} className="text-primary" />} label="Job type" value={makeCategory} />
          <ReviewRow icon={<Layers size={15} className="text-success" />} label="Order scope" value={scopeLabel} />
          <ReviewRow
            icon={<Scissors size={15} className="text-primary" />}
            label="Item type"
            value={
              makeCategory === 'Body Wear'
                ? sameItemForAll
                  ? effectiveItemType || '-'
                  : persons.map((person) => `${person.name || 'Person'}: ${person.itemType || '-'}`).join(', ')
                : effectiveItemType || '-'
            }
          />
          <ReviewRow
            icon={<Ruler size={15} className="text-gold" />}
            label="Measurement"
            value={
              isAmendmentMode
                ? 'Amendment details captured'
                : makeCategory === 'Body Wear'
                  ? `${persons.length} person profile(s) captured`
                  : `${selectedNonBodyFields.length} item dimension(s) captured`
            }
          />
          <ReviewRow
            icon={<FileText size={15} className="text-success" />}
            label="Description"
            value={
              makeCategory === 'Body Wear'
                ? persons.filter((person) => person.description.trim()).map((person) => `${person.name || 'Person'}: ${person.description}`).join(', ') || '-'
                : nonBodyDescription || '-'
            }
          />
          {isAmendmentMode ? (
            <>
              <ReviewRow icon={<Wrench size={15} className="text-danger" />} label="Amendment issue" value={amendmentIssueType || '-'} />
              <ReviewRow icon={<ClipboardList size={15} className="text-gold" />} label="Affected area" value={amendmentArea || '-'} />
              <ReviewRow icon={<Scissors size={15} className="text-primary" />} label="Target adjustment" value={amendmentTarget || '-'} />
              <ReviewRow icon={<FileText size={15} className="text-success" />} label="Repair notes" value={amendmentDescription || '-'} />
            </>
          ) : null}
          <ReviewRow icon={<Package size={15} className="text-primary" />} label="Material type" value={selectedMaterialValue || '-'} />
          <ReviewRow icon={<Palette size={15} className="text-gold" />} label="Color" value={materialColor || '-'} />
          <ReviewRow icon={<Ruler size={15} className="text-success" />} label="Total yard" value={materialYards || '0'} />
          <ReviewRow icon={<ClipboardList size={15} className="text-primary" />} label="Material quality" value={materialQuality} />
          <ReviewRow icon={<Truck size={15} className="text-gold" />} label="Material source" value={materialSource === 'Client is Providing Material' ? 'Client Provided' : 'I Am Getting It'} />
          <ReviewRow icon={<Banknote size={15} className="text-primary" />} label="Charged amount" value={formatNaira(charge)} />
          <ReviewRow icon={<Coins size={15} className="text-gold" />} label="Deposited collected" value={formatNaira(deposit)} />
          <ReviewRow icon={<Images size={15} className="text-success" />} label="Reference photo" value={referencePhotoNames.length ? referencePhotoNames.join(', ') : '-'} />
          <ReviewRow
            icon={<ClipboardList size={15} className="text-primary" />}
            label="Expenses list"
            value={expenses.length ? expenses.map((expense) => `${expense.name} (${formatNaira(numericValue(expense.cost))})`).join(', ') : '-'}
          />
          <ReviewRow icon={<Banknote size={15} className="text-danger" />} label="Expenses cost" value={formatNaira(totalExpenses)} />
          <ReviewRow
            icon={<TrendingUp size={15} className={projectedProfit >= 0 ? 'text-success' : 'text-danger'} />}
            label="Estimated profit"
            value={formatNaira(projectedProfit)}
            valueClassName={projectedProfit >= 0 ? 'text-success' : 'text-danger'}
          />
          <ReviewRow icon={<CalendarClock size={15} className="text-primary" />} label="Delivery date and time" value={`${deadlineDate || '-'} ${deadlineTime ? `at ${deadlineTime}` : ''}`} />
        </motion.div>
      </div>

      {draftSaved ? <p className="text-sm text-success">Draft saved successfully.</p> : null}
    </div>
  )
}
