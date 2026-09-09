import { ReferencePhotoUpload } from './ReferencePhotoUpload'
import { DeadlineDateTimeFields } from './deadline/DeadlineDateTimeFields'
import { DeadlineReminderSelector } from './deadline/DeadlineReminderSelector'
import { DeliveryChecklist } from './deadline/DeliveryChecklist'
import type { DeadlineFieldsProps } from './deadline/deadlineTypes'
import { getReferencePhotoTargets } from './deadline/referencePhotoTargets'

export function DeadlineFields({
  balance,
  clientName,
  customReminderUnit,
  customReminderValue,
  deadlineDate,
  deadlineTime,
  effectiveItemType,
  fieldErrorKey,
  fieldErrors,
  jobType,
  makeCategory,
  persons,
  referencePhotoFilesByTarget,
  referencePhotoNamesByTarget,
  reminder,
  sameItemForAll,
  onDeadlineDateChange,
  onDeadlineTimeChange,
  onCustomReminderUnitChange,
  onCustomReminderValueChange,
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
        deadlineDateError={fieldErrors.deadlineDate}
        errorKey={fieldErrorKey}
        deadlineTime={deadlineTime}
        deadlineTimeError={fieldErrors.deadlineTime}
        onDeadlineDateChange={onDeadlineDateChange}
        onDeadlineTimeChange={onDeadlineTimeChange}
      />
      <DeadlineReminderSelector
        reminder={reminder}
        customReminderValue={customReminderValue}
        error={fieldErrors.reminder}
        customError={fieldErrors.customReminder}
        errorKey={fieldErrorKey}
        customReminderUnit={customReminderUnit}
        onReminderChange={onReminderChange}
        onCustomReminderValueChange={onCustomReminderValueChange}
        onCustomReminderUnitChange={onCustomReminderUnitChange}
      />
      <DeliveryChecklist
        balance={balance}
        deadlineDate={deadlineDate}
        deadlineTime={deadlineTime}
        reminder={reminder}
        customReminderValue={customReminderValue}
        customReminderUnit={customReminderUnit}
      />
      <ReferencePhotoUpload
        filesByTarget={referencePhotoFilesByTarget}
        namesByTarget={referencePhotoNamesByTarget}
        error={fieldErrors.referencePhotos}
        errorKey={fieldErrorKey}
        targets={referencePhotoTargets}
        onReferencePhotoUpload={onReferencePhotoUpload}
      />
    </div>
  )
}
