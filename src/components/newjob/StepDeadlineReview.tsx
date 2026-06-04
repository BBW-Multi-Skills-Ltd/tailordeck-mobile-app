import { DeadlineFields } from './DeadlineFields'
import { ReviewSummary } from './ReviewSummary'
import type { StepDeadlineReviewProps } from './stepDeadlineReview.types'

export default function StepDeadlineReview(props: StepDeadlineReviewProps) {
  if (!props.reviewMode) {
    return (
      <DeadlineFields
        balance={props.balance}
        deadlineDate={props.deadlineDate}
        deadlineTime={props.deadlineTime}
        reminder={props.reminder}
        onDeadlineDateChange={props.onDeadlineDateChange}
        onDeadlineTimeChange={props.onDeadlineTimeChange}
        onReminderChange={props.onReminderChange}
      />
    )
  }

  return (
    <div className="stack gap-12">
      <ReviewSummary {...props} />
      {props.draftSaved ? <p className="text-sm text-success">Draft saved successfully.</p> : null}
    </div>
  )
}
