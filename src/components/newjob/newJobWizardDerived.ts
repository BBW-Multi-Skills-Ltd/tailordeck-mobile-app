import { nonBodyMeasurementTemplate } from './newJobConfig'
import { calculateJobPricing } from './newJobCalculations'
import type { NewJobWizardStateModel } from './useNewJobWizardState'

export function getNewJobWizardDerived(state: NewJobWizardStateModel) {
  const pricing = calculateJobPricing(state.chargeAmount, state.depositPercent, state.expenses)
  const effectiveItemType = state.itemType.trim()
  const isAmendmentMode = state.orderMode === 'Amendment / Repair'

  return {
    effectiveItemType,
    isAmendmentMode,
    scopeLabel: state.makeCategory === 'Body Wear' ? state.jobType : 'Single',
    selectedMaterialValue: state.materialType === 'Other Material' ? state.customMaterialType : state.materialType,
    selectedNonBodyFields: nonBodyMeasurementTemplate[effectiveItemType] ?? nonBodyMeasurementTemplate.Other,
    showAmendmentMaterialFlow: isAmendmentMode && state.amendmentNeedsMaterials,
    showBodyMeasurementFlow: state.makeCategory === 'Body Wear' && !isAmendmentMode,
    showFullMaterialFlow: !isAmendmentMode,
    showNonBodyMeasurementFlow: state.makeCategory === 'Non-Body Item' && !isAmendmentMode,
    ...pricing,
  }
}

export type NewJobWizardDerivedModel = ReturnType<typeof getNewJobWizardDerived>
