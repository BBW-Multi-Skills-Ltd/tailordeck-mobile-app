import type { Dispatch, SetStateAction } from 'react'
import type { NavigateFunction } from 'react-router-dom'
import { stepLabels } from './newJobConfig'

type NavigationActionParams = {
  navigate: NavigateFunction
  setDraftSaved: (value: boolean) => void
  setIsFinalizing: (value: boolean) => void
  setStep: Dispatch<SetStateAction<number>>
  setStepFourReviewMode: (value: boolean) => void
  setSuccessOpen: (value: boolean) => void
  step: number
  stepFourReviewMode: boolean
}

export function createNavigationActions({
  navigate,
  setDraftSaved,
  setIsFinalizing,
  setStep,
  setStepFourReviewMode,
  setSuccessOpen,
  step,
  stepFourReviewMode,
}: NavigationActionParams) {
  function goBack(): void {
    if (step === 3 && stepFourReviewMode) {
      setStepFourReviewMode(false)
      return
    }

    if (step > 0) {
      setStep((prev) => prev - 1)
      return
    }

    if (window.confirm('Discard this new job and return to Jobs?')) navigate('/jobs')
  }

  function goNext(): void {
    if (step === 2) {
      setStepFourReviewMode(false)
      setDraftSaved(false)
    }

    setStep((prev) => Math.min(prev + 1, stepLabels.length - 1))
  }

  function handleFinalizeJob(): void {
    setIsFinalizing(true)
    setDraftSaved(false)
    window.setTimeout(() => {
      setIsFinalizing(false)
      setSuccessOpen(true)
    }, 1100)
  }

  return {
    goBack,
    goNext,
    handleFinalizeJob,
    viewJobs: () => navigate('/jobs'),
  }
}
