import type { NavigateFunction } from 'react-router-dom'
import { createCostingActions } from './newJobCostingActions'
import { createMaterialActions } from './newJobMaterialActions'
import { createNavigationActions } from './newJobNavigationActions'
import { createStepOneActions } from './newJobStepOneActions'
import type { NewJobWizardStateModel } from './useNewJobWizardState'

type NewJobWizardActionParams = {
  navigate: NavigateFunction
  state: NewJobWizardStateModel
}

export function createNewJobWizardActions({ navigate, state }: NewJobWizardActionParams) {
  const stepOneActions = createStepOneActions({
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
  })
  const materialActions = createMaterialActions({
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
  })
  const costingActions = createCostingActions({
    expenseDraftCost: state.expenseDraftCost,
    expenseDraftName: state.expenseDraftName,
    setExpenseDraftCost: state.setExpenseDraftCost,
    setExpenseDraftName: state.setExpenseDraftName,
    setExpenses: state.setExpenses,
  })
  const navigationActions = createNavigationActions({
    navigate,
    setDraftSaved: state.setDraftSaved,
    setIsFinalizing: state.setIsFinalizing,
    setStep: state.setStep,
    setStepFourReviewMode: state.setStepFourReviewMode,
    setSuccessOpen: state.setSuccessOpen,
    step: state.step,
    stepFourReviewMode: state.stepFourReviewMode,
  })

  return {
    addAdult: stepOneActions.addAdult,
    addChild: stepOneActions.addChild,
    addExpense: costingActions.addExpense,
    goBack: navigationActions.goBack,
    goNext: navigationActions.goNext,
    handleAmendmentMaterialsToggle: materialActions.handleAmendmentMaterialsToggle,
    handleClientNameChange: stepOneActions.handleClientNameChange,
    handleDepositPercentKeyDown: materialActions.handleDepositPercentKeyDown,
    handleFinalizeJob: navigationActions.handleFinalizeJob,
    handleJobTypeChange: stepOneActions.handleJobTypeChange,
    handleMakeCategoryChange: stepOneActions.handleMakeCategoryChange,
    handleOrderModeChange: stepOneActions.handleOrderModeChange,
    handleReferencePhotoUpload: materialActions.handleReferencePhotoUpload,
    handleSameItemToggle: stepOneActions.handleSameItemToggle,
    removeExpense: costingActions.removeExpense,
    removePerson: (personId: string) => state.setPersons((prev) => prev.filter((person) => person.id !== personId)),
    saveDraft: () => state.setDraftSaved(true),
    setAmendmentArea: state.setAmendmentArea,
    setAmendmentDescription: state.setAmendmentDescription,
    setAmendmentIssueType: state.setAmendmentIssueType,
    setAmendmentPartName: state.setAmendmentPartName,
    setAmendmentPartQuantity: state.setAmendmentPartQuantity,
    setAmendmentTarget: state.setAmendmentTarget,
    setChargeAmount: state.setChargeAmount,
    setClientPhone: state.setClientPhone,
    setCustomMaterialType: state.setCustomMaterialType,
    setDeadlineDate: state.setDeadlineDate,
    setDeadlineTime: state.setDeadlineTime,
    setDepositPercent: state.setDepositPercent,
    setExpenseDraftCost: state.setExpenseDraftCost,
    setExpenseDraftName: state.setExpenseDraftName,
    setMaterialColor: state.setMaterialColor,
    setMaterialQuality: state.setMaterialQuality,
    setMaterialSource: state.setMaterialSource,
    setMaterialType: state.setMaterialType,
    setMaterialYards: state.setMaterialYards,
    setNonBodyDescription: state.setNonBodyDescription,
    setNonBodyQuantity: state.setNonBodyQuantity,
    setOpenMaterialCategory: state.setOpenMaterialCategory,
    setReminder: state.setReminder,
    setSingleMeasurementsOpen: state.setSingleMeasurementsOpen,
    setStepFourDetailsOpen: state.setStepFourDetailsOpen,
    setStepFourReviewMode: state.setStepFourReviewMode,
    setWorthIt: state.setWorthIt,
    toggleStepOneMeasurements: (personId: string) =>
      state.setStepOneMeasurementsOpen((prev) => ({ ...prev, [personId]: !(prev[personId] ?? true) })),
    updateNonBodyMeasurement: stepOneActions.updateNonBodyMeasurement,
    updatePerson: stepOneActions.updatePerson,
    updatePersonDescription: (personId: string, value: string) =>
      stepOneActions.updatePerson(personId, (person) => ({ ...person, description: value })),
    updatePersonMeasurement: stepOneActions.updatePersonMeasurement,
    updateSharedItemType: stepOneActions.updateSharedItemType,
    viewJobs: navigationActions.viewJobs,
  }
}
