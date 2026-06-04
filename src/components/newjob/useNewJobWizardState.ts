import { useState } from 'react'
import {
  newPerson,
  type ExpenseForm,
  type JobType,
  type MakeCategory,
  type MaterialQuality,
  type MaterialSource,
  type OrderMode,
  type PersonForm,
  type Reminder,
} from './newJobConfig'

export function useNewJobWizardState() {
  const [step, setStep] = useState(0)
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [orderMode, setOrderMode] = useState<OrderMode>('New Stitch')
  const [makeCategory, setMakeCategory] = useState<MakeCategory>('Body Wear')
  const [itemType, setItemType] = useState('')
  const [sameItemForAll, setSameItemForAll] = useState(true)
  const [jobType, setJobType] = useState<JobType>('Single')
  const [persons, setPersons] = useState<PersonForm[]>([newPerson({ sex: 'Female', role: 'adult' })])
  const [nonBodyMeasurements, setNonBodyMeasurements] = useState<Record<string, string>>({})
  const [nonBodyQuantity, setNonBodyQuantity] = useState('1')
  const [nonBodyDescription, setNonBodyDescription] = useState('')
  const [amendmentIssueType, setAmendmentIssueType] = useState('')
  const [amendmentArea, setAmendmentArea] = useState('')
  const [amendmentTarget, setAmendmentTarget] = useState('')
  const [amendmentDescription, setAmendmentDescription] = useState('')
  const [amendmentNeedsMaterials, setAmendmentNeedsMaterials] = useState(false)
  const [amendmentPartName, setAmendmentPartName] = useState('')
  const [amendmentPartQuantity, setAmendmentPartQuantity] = useState('')
  const [materialType, setMaterialType] = useState('')
  const [customMaterialType, setCustomMaterialType] = useState('')
  const [openMaterialCategory, setOpenMaterialCategory] = useState('local')
  const [materialColor, setMaterialColor] = useState('')
  const [materialYards, setMaterialYards] = useState('')
  const [materialQuality, setMaterialQuality] = useState<MaterialQuality>('Normal')
  const [materialSource, setMaterialSource] = useState<MaterialSource>('Client is Providing Material')
  const [chargeAmount, setChargeAmount] = useState('')
  const [depositPercent, setDepositPercent] = useState('')
  const [referencePhotoNames, setReferencePhotoNames] = useState<string[]>([])
  const [expenses, setExpenses] = useState<ExpenseForm[]>([])
  const [expenseDraftName, setExpenseDraftName] = useState('')
  const [expenseDraftCost, setExpenseDraftCost] = useState('')
  const [worthIt, setWorthIt] = useState<'Yes' | 'No'>('Yes')
  const [deadlineDate, setDeadlineDate] = useState('')
  const [deadlineTime, setDeadlineTime] = useState('')
  const [reminder, setReminder] = useState<Reminder>('1 day before')
  const [draftSaved, setDraftSaved] = useState(false)
  const [stepFourReviewMode, setStepFourReviewMode] = useState(false)
  const [isFinalizing, setIsFinalizing] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [singleMeasurementsOpen, setSingleMeasurementsOpen] = useState(true)
  const [stepOneMeasurementsOpen, setStepOneMeasurementsOpen] = useState<Record<string, boolean>>({})
  const [stepFourDetailsOpen, setStepFourDetailsOpen] = useState(true)

  return {
    amendmentArea,
    amendmentDescription,
    amendmentIssueType,
    amendmentNeedsMaterials,
    amendmentPartName,
    amendmentPartQuantity,
    amendmentTarget,
    chargeAmount,
    clientName,
    clientPhone,
    customMaterialType,
    deadlineDate,
    deadlineTime,
    depositPercent,
    draftSaved,
    expenseDraftCost,
    expenseDraftName,
    expenses,
    isFinalizing,
    itemType,
    jobType,
    makeCategory,
    materialColor,
    materialQuality,
    materialSource,
    materialType,
    materialYards,
    nonBodyDescription,
    nonBodyMeasurements,
    nonBodyQuantity,
    openMaterialCategory,
    orderMode,
    persons,
    referencePhotoNames,
    reminder,
    sameItemForAll,
    setAmendmentArea,
    setAmendmentDescription,
    setAmendmentIssueType,
    setAmendmentNeedsMaterials,
    setAmendmentPartName,
    setAmendmentPartQuantity,
    setAmendmentTarget,
    setChargeAmount,
    setClientName,
    setClientPhone,
    setCustomMaterialType,
    setDeadlineDate,
    setDeadlineTime,
    setDepositPercent,
    setDraftSaved,
    setExpenseDraftCost,
    setExpenseDraftName,
    setExpenses,
    setIsFinalizing,
    setItemType,
    setJobType,
    setMakeCategory,
    setMaterialColor,
    setMaterialQuality,
    setMaterialSource,
    setMaterialType,
    setMaterialYards,
    setNonBodyDescription,
    setNonBodyMeasurements,
    setNonBodyQuantity,
    setOpenMaterialCategory,
    setOrderMode,
    setPersons,
    setReferencePhotoNames,
    setReminder,
    setSameItemForAll,
    setSingleMeasurementsOpen,
    setStep,
    setStepFourDetailsOpen,
    setStepFourReviewMode,
    setStepOneMeasurementsOpen,
    setSuccessOpen,
    setWorthIt,
    singleMeasurementsOpen,
    step,
    stepFourDetailsOpen,
    stepFourReviewMode,
    stepOneMeasurementsOpen,
    successOpen,
    worthIt,
  }
}

export type NewJobWizardStateModel = ReturnType<typeof useNewJobWizardState>

export function getNewJobWizardStateSnapshot(state: NewJobWizardStateModel) {
  return {
    amendmentArea: state.amendmentArea,
    amendmentDescription: state.amendmentDescription,
    amendmentIssueType: state.amendmentIssueType,
    amendmentNeedsMaterials: state.amendmentNeedsMaterials,
    amendmentPartName: state.amendmentPartName,
    amendmentPartQuantity: state.amendmentPartQuantity,
    amendmentTarget: state.amendmentTarget,
    chargeAmount: state.chargeAmount,
    clientName: state.clientName,
    clientPhone: state.clientPhone,
    customMaterialType: state.customMaterialType,
    deadlineDate: state.deadlineDate,
    deadlineTime: state.deadlineTime,
    depositPercent: state.depositPercent,
    draftSaved: state.draftSaved,
    expenseDraftCost: state.expenseDraftCost,
    expenseDraftName: state.expenseDraftName,
    expenses: state.expenses,
    isFinalizing: state.isFinalizing,
    itemType: state.itemType,
    jobType: state.jobType,
    makeCategory: state.makeCategory,
    materialColor: state.materialColor,
    materialQuality: state.materialQuality,
    materialSource: state.materialSource,
    materialType: state.materialType,
    materialYards: state.materialYards,
    nonBodyDescription: state.nonBodyDescription,
    nonBodyMeasurements: state.nonBodyMeasurements,
    nonBodyQuantity: state.nonBodyQuantity,
    openMaterialCategory: state.openMaterialCategory,
    orderMode: state.orderMode,
    persons: state.persons,
    referencePhotoNames: state.referencePhotoNames,
    reminder: state.reminder,
    sameItemForAll: state.sameItemForAll,
    singleMeasurementsOpen: state.singleMeasurementsOpen,
    step: state.step,
    stepFourDetailsOpen: state.stepFourDetailsOpen,
    stepFourReviewMode: state.stepFourReviewMode,
    stepOneMeasurementsOpen: state.stepOneMeasurementsOpen,
    successOpen: state.successOpen,
    worthIt: state.worthIt,
  }
}
