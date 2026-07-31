import {
  Banknote,
  CalendarClock,
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
import { formatNaira } from '../../../lib/utils'
import { ReviewRow } from '../NewJobChrome'
import { ReferencePhotoPreviewGrid, type ReferencePreviewPhoto } from '../ReferencePhotoPreview'
import { AmendmentReviewRows } from './AmendmentReviewRows'
import type { ReviewSummaryProps } from './reviewSummaryTypes'
import { formatExpenses, getMeasurementSummary, getReviewDescription, getReviewItemType } from './reviewSummaryUtils'

function getReviewPhotos(props: ReviewSummaryProps): ReferencePreviewPhoto[] {
  return Object.entries(props.referencePhotoFilesByTarget).flatMap(([targetId, files]) =>
    files.map((file, index) => ({
      file,
      id: `review-${targetId}-${file.name}-${file.lastModified}-${index}`,
      label: props.referencePhotoNames[index] ?? file.name,
    })),
  )
}

export function ReviewSummaryRows(props: ReviewSummaryProps) {
  const reviewPhotos = getReviewPhotos(props)

  return (
    <>
      <ReviewRow icon={<UserRound size={15} className="text-primary" />} label="Client name" value={props.clientName || '-'} />
      <ReviewRow icon={<Phone size={15} className="text-success" />} label="Client phone" value={props.clientPhone || '-'} />
      <ReviewRow icon={<Wrench size={15} className="text-gold" />} label="Order mode" value={props.orderMode} />
      <ReviewRow icon={<Shirt size={15} className="text-primary" />} label="Job type" value={props.makeCategory} />
      <ReviewRow icon={<Layers size={15} className="text-success" />} label="Order scope" value={props.scopeLabel} />
      <ReviewRow icon={<Scissors size={15} className="text-primary" />} label="Item type" value={getReviewItemType(props)} />
      <ReviewRow icon={<Ruler size={15} className="text-gold" />} label="Measurement" value={getMeasurementSummary(props)} />
      <ReviewRow icon={<FileText size={15} className="text-success" />} label="Description" value={getReviewDescription(props)} />
      {props.isAmendmentMode ? <AmendmentReviewRows {...props} /> : null}
      <ReviewRow icon={<Package size={15} className="text-primary" />} label="Material type" value={props.selectedMaterialValue || '-'} />
      <ReviewRow icon={<Palette size={15} className="text-gold" />} label="Color" value={props.materialColor || '-'} />
      <ReviewRow icon={<Ruler size={15} className="text-success" />} label="Total yard" value={props.materialYards || '0'} />
      <ReviewRow icon={<ClipboardList size={15} className="text-primary" />} label="Material quality" value={props.materialQuality} />
      <ReviewRow icon={<Truck size={15} className="text-gold" />} label="Material source" value={props.materialSource === 'Client is Providing Material' ? 'Client Provided' : 'I Am Getting It'} />
      <ReviewRow icon={<Banknote size={15} className="text-primary" />} label="Charged amount" value={formatNaira(props.charge)} />
      <ReviewRow icon={<Coins size={15} className="text-gold" />} label="Deposited collected" value={formatNaira(props.deposit)} />
      <ReviewRow icon={<Images size={15} className="text-success" />} label="Reference photo" value={reviewPhotos.length ? `${reviewPhotos.length} uploaded` : '-'} />
      {reviewPhotos.length ? <ReferencePhotoPreviewGrid photos={reviewPhotos} /> : null}
      <ReviewRow icon={<ClipboardList size={15} className="text-primary" />} label="Expenses list" value={formatExpenses(props.expenses)} />
      <ReviewRow icon={<Banknote size={15} className="text-danger" />} label="Expenses cost" value={formatNaira(props.totalExpenses)} />
      <ReviewRow
        icon={<TrendingUp size={15} className={props.projectedProfit >= 0 ? 'text-success' : 'text-danger'} />}
        label="Estimated profit"
        value={formatNaira(props.projectedProfit)}
        valueClassName={props.projectedProfit >= 0 ? 'text-success' : 'text-danger'}
      />
      <ReviewRow icon={<CalendarClock size={15} className="text-primary" />} label="Delivery date and time" value={`${props.deadlineDate || '-'} ${props.deadlineTime ? `at ${props.deadlineTime}` : ''}`} />
    </>
  )
}
