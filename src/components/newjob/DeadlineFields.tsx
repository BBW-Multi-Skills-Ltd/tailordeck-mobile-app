import { ReferencePhotoUpload } from './ReferencePhotoUpload'
import { DeadlineDateTimeFields } from './deadline/DeadlineDateTimeFields'
import { DeadlineReminderSelector } from './deadline/DeadlineReminderSelector'
import { DeliveryChecklist } from './deadline/DeliveryChecklist'
import type { DeadlineFieldsProps } from './deadline/deadlineTypes'
import { getReferencePhotoTargets } from './deadline/referencePhotoTargets'

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
  const referencePhotoTargets = getReferencePhotoTargets({
    clientName,
    effectiveItemType,
    jobType,
    makeCategory,
    persons,
    sameItemForAll,
  })

  return (
    <div className="stack gap-12">
      <DeadlineDateTimeFields
        deadlineDate={deadlineDate}
        deadlineTime={deadlineTime}
        onDeadlineDateChange={onDeadlineDateChange}
        onDeadlineTimeChange={onDeadlineTimeChange}
      />
      <DeadlineReminderSelector reminder={reminder} onReminderChange={onReminderChange} />
      <DeliveryChecklist balance={balance} deadlineDate={deadlineDate} deadlineTime={deadlineTime} reminder={reminder} />
      <ReferencePhotoUpload
        namesByTarget={referencePhotoNamesByTarget}
        targets={referencePhotoTargets}
        onReferencePhotoUpload={onReferencePhotoUpload}
      />
    </div>
  )
}
