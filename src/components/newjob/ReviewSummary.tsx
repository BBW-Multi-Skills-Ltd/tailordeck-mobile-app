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
import { numericValue } from './newJobConfig'
import { ReviewRow } from './NewJobChrome'
import type { StepDeadlineReviewProps } from './stepDeadlineReview.types'

type ReviewSummaryProps = Pick<
  StepDeadlineReviewProps,
  | 'amendmentArea'
  | 'amendmentDescription'
  | 'amendmentIssueType'
  | 'amendmentTarget'
  | 'charge'
  | 'clientName'
  | 'clientPhone'
  | 'deadlineDate'
  | 'deadlineTime'
  | 'deposit'
  | 'detailsOpen'
  | 'effectiveItemType'
  | 'expenses'
  | 'isAmendmentMode'
  | 'makeCategory'
  | 'materialColor'
  | 'materialQuality'
  | 'materialSource'
  | 'materialYards'
  | 'nonBodyDescription'
  | 'orderMode'
  | 'persons'
  | 'projectedProfit'
  | 'referencePhotoNames'
  | 'sameItemForAll'
  | 'scopeLabel'
  | 'selectedMaterialValue'
  | 'selectedNonBodyFields'
  | 'totalExpenses'
  | 'onDetailsOpenChange'
>

export function ReviewSummary(props: ReviewSummaryProps) {
  const description =
    props.makeCategory === 'Body Wear'
      ? props.persons
          .filter((person) => person.description.trim())
          .map((person) => `${person.name || 'Person'}: ${person.description}`)
          .join(', ') || '-'
      : props.nonBodyDescription || '-'
  const itemType =
    props.makeCategory === 'Body Wear'
      ? props.sameItemForAll
        ? props.effectiveItemType || '-'
        : props.persons.map((person) => `${person.name || 'Person'}: ${person.itemType || '-'}`).join(', ')
      : props.effectiveItemType || '-'

  return (
    <div className="card stack gap-10">
      <div className="row-between">
        <h4>Job Details</h4>
      </div>

      <button type="button" className="row-between wizard-person-toggle" onClick={() => props.onDetailsOpenChange((prev) => !prev)} aria-expanded={props.detailsOpen}>
        <h5>Review Summary</h5>
        {props.detailsOpen ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
      </button>

      <motion.div
        className="stack gap-6 wizard-collapsible"
        initial={false}
        animate={{ height: props.detailsOpen ? 'auto' : 0, opacity: props.detailsOpen ? 1 : 0 }}
        transition={{ height: { duration: 0.34, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.2, ease: 'easeOut' } }}
        style={{ pointerEvents: props.detailsOpen ? 'auto' : 'none' }}
      >
        <ReviewRow icon={<UserRound size={15} className="text-primary" />} label="Client name" value={props.clientName || '-'} />
        <ReviewRow icon={<Phone size={15} className="text-success" />} label="Client phone" value={props.clientPhone || '-'} />
        <ReviewRow icon={<Wrench size={15} className="text-gold" />} label="Order mode" value={props.orderMode} />
        <ReviewRow icon={<Shirt size={15} className="text-primary" />} label="Job type" value={props.makeCategory} />
        <ReviewRow icon={<Layers size={15} className="text-success" />} label="Order scope" value={props.scopeLabel} />
        <ReviewRow icon={<Scissors size={15} className="text-primary" />} label="Item type" value={itemType} />
        <ReviewRow
          icon={<Ruler size={15} className="text-gold" />}
          label="Measurement"
          value={
            props.isAmendmentMode
              ? 'Amendment details captured'
              : props.makeCategory === 'Body Wear'
                ? `${props.persons.length} person profile(s) captured`
                : `${props.selectedNonBodyFields.length} item dimension(s) captured`
          }
        />
        <ReviewRow icon={<FileText size={15} className="text-success" />} label="Description" value={description} />
        {props.isAmendmentMode ? <AmendmentRows {...props} /> : null}
        <ReviewRow icon={<Package size={15} className="text-primary" />} label="Material type" value={props.selectedMaterialValue || '-'} />
        <ReviewRow icon={<Palette size={15} className="text-gold" />} label="Color" value={props.materialColor || '-'} />
        <ReviewRow icon={<Ruler size={15} className="text-success" />} label="Total yard" value={props.materialYards || '0'} />
        <ReviewRow icon={<ClipboardList size={15} className="text-primary" />} label="Material quality" value={props.materialQuality} />
        <ReviewRow icon={<Truck size={15} className="text-gold" />} label="Material source" value={props.materialSource === 'Client is Providing Material' ? 'Client Provided' : 'I Am Getting It'} />
        <ReviewRow icon={<Banknote size={15} className="text-primary" />} label="Charged amount" value={formatNaira(props.charge)} />
        <ReviewRow icon={<Coins size={15} className="text-gold" />} label="Deposited collected" value={formatNaira(props.deposit)} />
        <ReviewRow icon={<Images size={15} className="text-success" />} label="Reference photo" value={props.referencePhotoNames.length ? props.referencePhotoNames.join(', ') : '-'} />
        <ReviewRow icon={<ClipboardList size={15} className="text-primary" />} label="Expenses list" value={formatExpenses(props.expenses)} />
        <ReviewRow icon={<Banknote size={15} className="text-danger" />} label="Expenses cost" value={formatNaira(props.totalExpenses)} />
        <ReviewRow
          icon={<TrendingUp size={15} className={props.projectedProfit >= 0 ? 'text-success' : 'text-danger'} />}
          label="Estimated profit"
          value={formatNaira(props.projectedProfit)}
          valueClassName={props.projectedProfit >= 0 ? 'text-success' : 'text-danger'}
        />
        <ReviewRow icon={<CalendarClock size={15} className="text-primary" />} label="Delivery date and time" value={`${props.deadlineDate || '-'} ${props.deadlineTime ? `at ${props.deadlineTime}` : ''}`} />
      </motion.div>
    </div>
  )
}

function AmendmentRows(props: ReviewSummaryProps) {
  return (
    <>
      <ReviewRow icon={<Wrench size={15} className="text-danger" />} label="Amendment issue" value={props.amendmentIssueType || '-'} />
      <ReviewRow icon={<ClipboardList size={15} className="text-gold" />} label="Affected area" value={props.amendmentArea || '-'} />
      <ReviewRow icon={<Scissors size={15} className="text-primary" />} label="Target adjustment" value={props.amendmentTarget || '-'} />
      <ReviewRow icon={<FileText size={15} className="text-success" />} label="Repair notes" value={props.amendmentDescription || '-'} />
    </>
  )
}

function formatExpenses(expenses: ReviewSummaryProps['expenses']): string {
  if (!expenses.length) return '-'
  return expenses.map((expense) => `${expense.name} (${formatNaira(numericValue(expense.cost))})`).join(', ')
}
