import { useState } from 'react'
import { useNewJobCostingState } from './useNewJobCostingState'
import type { NewJobFieldErrors } from './newJobFieldValidation'
import { useNewJobMaterialState } from './useNewJobMaterialState'
import { useNewJobOrderState } from './useNewJobOrderState'
import { useNewJobWorkflowState } from './useNewJobWorkflowState'

export function useNewJobWizardState() {
  const orderState = useNewJobOrderState()
  const materialState = useNewJobMaterialState()
  const costingState = useNewJobCostingState()
  const workflowState = useNewJobWorkflowState()
  const [amendmentIssueType, setAmendmentIssueType] = useState('')
  const [amendmentArea, setAmendmentArea] = useState('')
  const [amendmentTarget, setAmendmentTarget] = useState('')
  const [amendmentDescription, setAmendmentDescription] = useState('')
  const [amendmentNeedsMaterials, setAmendmentNeedsMaterials] = useState(false)
  const [amendmentPartName, setAmendmentPartName] = useState('')
  const [amendmentPartQuantity, setAmendmentPartQuantity] = useState('')
  const [fieldErrors, setFieldErrors] = useState<NewJobFieldErrors>({})

  return {
    amendmentArea,
    amendmentDescription,
    amendmentIssueType,
    amendmentNeedsMaterials,
    amendmentPartName,
    amendmentPartQuantity,
    amendmentTarget,
    fieldErrors,
    setAmendmentArea,
    setAmendmentDescription,
    setAmendmentIssueType,
    setAmendmentNeedsMaterials,
    setAmendmentPartName,
    setAmendmentPartQuantity,
    setAmendmentTarget,
    setFieldErrors,
    ...costingState,
    ...materialState,
    ...orderState,
    ...workflowState,
  }
}

export type NewJobWizardStateModel = ReturnType<typeof useNewJobWizardState>

