import { ClipboardList, FileText, Scissors, Wrench } from 'lucide-react'
import { ReviewRow } from '../NewJobChrome'
import type { ReviewSummaryProps } from './reviewSummaryTypes'

export function AmendmentReviewRows(props: ReviewSummaryProps) {
  return (
    <>
      <ReviewRow icon={<Wrench size={15} className="text-danger" />} label="Amendment issue" value={props.amendmentIssueType || '-'} />
      <ReviewRow icon={<ClipboardList size={15} className="text-gold" />} label="Affected area" value={props.amendmentArea || '-'} />
      <ReviewRow icon={<Scissors size={15} className="text-primary" />} label="Target adjustment" value={props.amendmentTarget || '-'} />
      <ReviewRow icon={<FileText size={15} className="text-success" />} label="Repair notes" value={props.amendmentDescription || '-'} />
    </>
  )
}
