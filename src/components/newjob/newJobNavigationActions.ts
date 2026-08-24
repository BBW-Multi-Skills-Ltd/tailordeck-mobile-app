import type { Dispatch, SetStateAction } from 'react'
import type { NavigateFunction } from 'react-router-dom'
import { stepLabels } from './newJobConfig'

type NavigationActionParams = {
  confirmDiscard: () => Promise<boolean>
  navigate: NavigateFunction
  setDraftSaved: (value: boolean) => void
  setStep: Dispatch<SetStateAction<number>>
  setStepFourReviewMode: (value: boolean) => void
  step: number
  stepFourReviewMode: boolean
  validateCurrentStep: () => boolean
}

export function createNavigationActions({
  confirmDiscard,
  navigate,
  setDraftSaved,
  setStep,
  setStepFourReviewMode,
  step,
  stepFourReviewMode,
  validateCurrentStep,
}: NavigationActionParams) {
  async function goBack(): Promise<void> {
    if (step === 3 && stepFourReviewMode) {
      setStepFourReviewMode(false)
      return
    }

    if (step > 0) {
      setStep((prev) => prev - 1)
      return
    }

    const confirmed = await confirmDiscard()
    if (confirmed) navigate('/jobs')
  }

  function goNext(): void {
    if (!validateCurrentStep()) return

    if (step === 2) {
      setStepFourReviewMode(false)
      setDraftSaved(false)
    }

    setStep((prev) => Math.min(prev + 1, stepLabels.length - 1))
  }

  return {
    goBack,
    goNext,
    viewJobs: () => navigate('/jobs'),
  }
}
