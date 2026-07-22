import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { ReviewSummaryRows } from './review/ReviewSummaryRows'
import type { ReviewSummaryProps } from './review/reviewSummaryTypes'

export function ReviewSummary(props: ReviewSummaryProps) {
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
        <ReviewSummaryRows {...props} />
      </motion.div>
    </div>
  )
}
