import type { NavigateFunction } from 'react-router-dom'
import type { NewJobWizardStateModel } from './useNewJobWizardState'

export function getStepOneActionParams(state: NewJobWizardStateModel) {
  return {
    clientName: state.clientName,
    itemType: state.itemType,
    jobType: state.jobType,
    makeCategory: state.makeCategory,
    persons: state.persons,
    sameItemForAll: state.sameItemForAll,
    setAmendmentArea: state.setAmendmentArea,
    setAmendmentDescription: state.setAmendmentDescription,
    setAmendmentIssueType: state.setAmendmentIssueType,
    setAmendmentNeedsMaterials: state.setAmendmentNeedsMaterials,
    setAmendmentPartName: state.setAmendmentPartName,
    setAmendmentPartQuantity: state.setAmendmentPartQuantity,
    setAmendmentTarget: state.setAmendmentTarget,
    setClientName: state.setClientName,
    setItemType: state.setItemType,
    setJobType: state.setJobType,
    setMakeCategory: state.setMakeCategory,
    setNonBodyMeasurements: state.setNonBodyMeasurements,
    setOrderMode: state.setOrderMode,
    setPersons: state.setPersons,
    setSameItemForAll: state.setSameItemForAll,
  }
}

export function getMaterialActionParams(state: NewJobWizardStateModel) {
  return {
    depositPercent: state.depositPercent,
    setAmendmentNeedsMaterials: state.setAmendmentNeedsMaterials,
    setAmendmentPartName: state.setAmendmentPartName,
    setAmendmentPartQuantity: state.setAmendmentPartQuantity,
    setCustomMaterialType: state.setCustomMaterialType,
    setDepositPercent: state.setDepositPercent,
    setMaterialColor: state.setMaterialColor,
    setMaterialType: state.setMaterialType,
    setMaterialYards: state.setMaterialYards,
    setReferencePhotoFiles: state.setReferencePhotoFiles,
    setReferencePhotoFilesByTarget: state.setReferencePhotoFilesByTarget,
    setReferencePhotoNames: state.setReferencePhotoNames,
    setReferencePhotoNamesByTarget: state.setReferencePhotoNamesByTarget,
  }
}

export function getCostingActionParams(state: NewJobWizardStateModel) {
  return {
    expenseDraftCost: state.expenseDraftCost,
    expenseDraftName: state.expenseDraftName,
    setExpenseDraftCost: state.setExpenseDraftCost,
    setExpenseDraftName: state.setExpenseDraftName,
    setExpenses: state.setExpenses,
  }
}

export function getNavigationActionParams(confirmDiscard: () => Promise<boolean>, navigate: NavigateFunction, state: NewJobWizardStateModel) {
  return {
    confirmDiscard,
    navigate,
    setDraftSaved: state.setDraftSaved,
    setIsFinalizing: state.setIsFinalizing,
    setStep: state.setStep,
    setStepFourReviewMode: state.setStepFourReviewMode,
    setSuccessOpen: state.setSuccessOpen,
    step: state.step,
    stepFourReviewMode: state.stepFourReviewMode,
  }
}
