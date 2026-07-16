import { DeadlineFields } from './DeadlineFields'
import { ReviewSummary } from './ReviewSummary'
import type { StepDeadlineReviewProps } from './stepDeadlineReview.types'

export default function StepDeadlineReview(props: StepDeadlineReviewProps) {
  if (!props.reviewMode) {
    return (
      <DeadlineFields
        balance={props.balance}
        clientName={props.clientName}
        deadlineDate={props.deadlineDate}
        deadlineTime={props.deadlineTime}
        effectiveItemType={props.effectiveItemType}
        jobType={props.jobType}
        makeCategory={props.makeCategory}
        persons={props.persons}
        referencePhotoNamesByTarget={props.referencePhotoNamesByTarget}
        reminder={props.reminder}
        sameItemForAll={props.sameItemForAll}
        onDeadlineDateChange={props.onDeadlineDateChange}
        onDeadlineTimeChange={props.onDeadlineTimeChange}
        onReferencePhotoUpload={props.onReferencePhotoUpload}
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
