import { useState } from 'react'
import type { ReminderSelection } from './newJobConfig'

export function useNewJobWorkflowState() {
  const [step, setStep] = useState(0)
  const [referencePhotoFiles, setReferencePhotoFiles] = useState<File[]>([])
  const [referencePhotoNames, setReferencePhotoNames] = useState<string[]>([])
  const [referencePhotoFilesByTarget, setReferencePhotoFilesByTarget] = useState<Record<string, File[]>>({})
  const [referencePhotoNamesByTarget, setReferencePhotoNamesByTarget] = useState<Record<string, string[]>>({})
  const [deadlineDate, setDeadlineDate] = useState('')
  const [deadlineTime, setDeadlineTime] = useState('')
  const [reminder, setReminder] = useState<ReminderSelection>('')
  const [draftSaved, setDraftSaved] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [stepFourReviewMode, setStepFourReviewMode] = useState(false)
  const [isFinalizing, setIsFinalizing] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [createdJobId, setCreatedJobId] = useState('')
  const [singleMeasurementsOpen, setSingleMeasurementsOpen] = useState(true)
  const [stepOneMeasurementsOpen, setStepOneMeasurementsOpen] = useState<Record<string, boolean>>({})
  const [stepFourDetailsOpen, setStepFourDetailsOpen] = useState(true)

  return {
    createdJobId,
    deadlineDate,
    deadlineTime,
    draftSaved,
    isFinalizing,
    isSavingDraft,
    referencePhotoFiles,
    referencePhotoFilesByTarget,
    referencePhotoNames,
    referencePhotoNamesByTarget,
    reminder,
    setCreatedJobId,
    setDeadlineDate,
    setDeadlineTime,
    setDraftSaved,
    setIsFinalizing,
    setIsSavingDraft,
    setReferencePhotoFiles,
    setReferencePhotoFilesByTarget,
    setReferencePhotoNames,
    setReferencePhotoNamesByTarget,
    setReminder,
    setSingleMeasurementsOpen,
    setStep,
    setStepFourDetailsOpen,
    setStepFourReviewMode,
    setStepOneMeasurementsOpen,
    setSuccessOpen,
    singleMeasurementsOpen,
    step,
    stepFourDetailsOpen,
    stepFourReviewMode,
    stepOneMeasurementsOpen,
    successOpen,
  }
}
