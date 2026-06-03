import { useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useClients } from '../../hooks/useClients'
import {
  digitsOnly,
  newPerson,
  nonBodyMeasurementTemplate,
  stepLabels,
  type ExpenseForm,
  type JobType,
  type MakeCategory,
  type MaterialQuality,
  type MaterialSource,
  type OrderMode,
  type PersonForm,
  type PersonSex,
  type Reminder,
} from './newJobConfig'
import { ensurePersonsForJobType } from './newJobFlow'
import { calculateJobPricing } from './newJobCalculations'
import { usePageNoScroll, useSharedItemTypeSync } from './useNewJobEffects'
import { useRepeatClientPrefill } from './useRepeatClientPrefill'

export function useNewJobWizard() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { getClientById } = useClients()
  const sectionRef = useRef<HTMLElement | null>(null)
  const repeatClientId = searchParams.get('clientId')
  const repeatClient = repeatClientId ? getClientById(repeatClientId) : undefined

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

  useRepeatClientPrefill(repeatClient, {
    setClientName,
    setClientPhone,
    setOrderMode,
    setMakeCategory,
    setJobType,
    setItemType,
    setSameItemForAll,
    setPersons,
    setNonBodyMeasurements,
    setNonBodyQuantity,
    setNonBodyDescription,
    setSingleMeasurementsOpen,
    setStepOneMeasurementsOpen,
  })
  usePageNoScroll(successOpen)
  useSharedItemTypeSync({ makeCategory, sameItemForAll, itemType, setPersons })

  const pricing = calculateJobPricing(chargeAmount, depositPercent, expenses)
  const effectiveItemType = itemType.trim()
  const selectedNonBodyFields = nonBodyMeasurementTemplate[effectiveItemType] ?? nonBodyMeasurementTemplate.Other
  const selectedMaterialValue = materialType === 'Other Material' ? customMaterialType : materialType
  const scopeLabel = makeCategory === 'Body Wear' ? jobType : 'Single'
  const isAmendmentMode = orderMode === 'Amendment / Repair'
  const showBodyMeasurementFlow = makeCategory === 'Body Wear' && !isAmendmentMode
  const showNonBodyMeasurementFlow = makeCategory === 'Non-Body Item' && !isAmendmentMode
  const showFullMaterialFlow = !isAmendmentMode
  const showAmendmentMaterialFlow = isAmendmentMode && amendmentNeedsMaterials

  function handleClientNameChange(value: string): void {
    setClientName(value)
    setPersons((prev) => ensurePersonsForJobType(jobType, prev, value))
  }

  function handleJobTypeChange(nextType: JobType): void {
    setJobType(nextType)
    setPersons((prev) => ensurePersonsForJobType(nextType, prev, clientName))
  }

  function handleMakeCategoryChange(nextCategory: MakeCategory): void {
    setMakeCategory(nextCategory)
    setItemType('')

    if (nextCategory !== 'Body Wear') {
      setJobType('Single')
      return
    }

    setSameItemForAll(true)
    setJobType('Single')
    setPersons((prev) => ensurePersonsForJobType('Single', prev, clientName))
  }

  function handleOrderModeChange(nextMode: OrderMode): void {
    setOrderMode(nextMode)

    if (nextMode === 'Amendment / Repair') {
      setJobType('Single')
      setSameItemForAll(true)
      setPersons((prev) => ensurePersonsForJobType('Single', prev, clientName))
      return
    }

    setAmendmentIssueType('')
    setAmendmentArea('')
    setAmendmentTarget('')
    setAmendmentDescription('')
    setAmendmentNeedsMaterials(false)
    setAmendmentPartName('')
    setAmendmentPartQuantity('')
  }

  function handleAmendmentMaterialsToggle(needsMaterials: boolean): void {
    setAmendmentNeedsMaterials(needsMaterials)
    if (needsMaterials) return

    setMaterialType('')
    setCustomMaterialType('')
    setMaterialColor('')
    setMaterialYards('')
    setAmendmentPartName('')
    setAmendmentPartQuantity('')
  }

  function updateNonBodyMeasurement(field: string, value: string): void {
    setNonBodyMeasurements((prev) => ({ ...prev, [field]: value }))
  }

  function handleReferencePhotoUpload(files: FileList | null): void {
    setReferencePhotoNames(files ? Array.from(files).map((file) => file.name) : [])
  }

  function handleDepositPercentKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key !== 'Backspace' || !depositPercent) return

    const input = event.currentTarget
    const selectionStart = input.selectionStart ?? 0
    const selectionEnd = input.selectionEnd ?? 0
    const hasSelection = selectionStart !== selectionEnd
    const atEnd = selectionStart === input.value.length

    if (!hasSelection && atEnd) {
      event.preventDefault()
      setDepositPercent((prev) => prev.slice(0, -1))
    }
  }

  function updatePerson(personId: string, updater: (person: PersonForm) => PersonForm): void {
    setPersons((prev) => prev.map((person) => (person.id === personId ? updater(person) : person)))
  }

  function updatePersonMeasurement(personId: string, field: string, value: string): void {
    updatePerson(personId, (person) => ({
      ...person,
      measurements: { ...person.measurements, [field]: value },
    }))
  }

  function updateSharedItemType(value: string): void {
    setItemType(value)
    if (!sameItemForAll || makeCategory !== 'Body Wear') return
    setPersons((prev) => prev.map((person) => ({ ...person, itemType: value })))
  }

  function handleSameItemToggle(enabled: boolean): void {
    setSameItemForAll(enabled)
    if (!enabled || makeCategory !== 'Body Wear') return

    const primaryItem = persons[0]?.itemType?.trim() || itemType.trim()
    if (!itemType.trim() && primaryItem) setItemType(primaryItem)
    setPersons((prev) => prev.map((person) => ({ ...person, itemType: primaryItem })))
  }

  function addChild(): void {
    const childCount = persons.filter((person) => person.role === 'child').length
    setPersons((prev) => [
      ...prev,
      newPerson({ name: `Child ${childCount + 1}`, sex: 'Boy', role: 'child', itemType: sameItemForAll ? itemType : '' }),
    ])
  }

  function addAdult(): void {
    const nextAdultNumber = persons.filter((person) => person.role === 'adult').length + 1
    const nextSex: PersonSex = nextAdultNumber % 2 === 0 ? 'Female' : 'Male'
    setPersons((prev) => [
      ...prev,
      newPerson({ name: `Adult ${nextAdultNumber}`, sex: nextSex, role: 'adult', itemType: sameItemForAll ? itemType : '' }),
    ])
  }

  function addExpense(): void {
    const cleanName = expenseDraftName.trim()
    const cleanCost = digitsOnly(expenseDraftCost)
    if (!cleanName && !cleanCost) return

    setExpenses((prev) => [...prev, { id: `ex-${Date.now()}-${Math.floor(Math.random() * 1000)}`, name: cleanName || 'Expense', cost: cleanCost || '0' }])
    setExpenseDraftName('')
    setExpenseDraftCost('')
  }

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
    actions: {
      addAdult,
      addChild,
      addExpense,
      goBack,
      goNext,
      handleAmendmentMaterialsToggle,
      handleClientNameChange,
      handleDepositPercentKeyDown,
      handleFinalizeJob,
      handleJobTypeChange,
      handleMakeCategoryChange,
      handleOrderModeChange,
      handleReferencePhotoUpload,
      handleSameItemToggle,
      removeExpense: (expenseId: string) => setExpenses((prev) => prev.filter((expense) => expense.id !== expenseId)),
      removePerson: (personId: string) => setPersons((prev) => prev.filter((person) => person.id !== personId)),
      saveDraft: () => setDraftSaved(true),
      setAmendmentArea,
      setAmendmentDescription,
      setAmendmentIssueType,
      setAmendmentPartName,
      setAmendmentPartQuantity,
      setAmendmentTarget,
      setChargeAmount,
      setClientPhone,
      setCustomMaterialType,
      setDeadlineDate,
      setDeadlineTime,
      setDepositPercent,
      setExpenseDraftCost,
      setExpenseDraftName,
      setMaterialColor,
      setMaterialQuality,
      setMaterialSource,
      setMaterialType,
      setMaterialYards,
      setNonBodyDescription,
      setNonBodyQuantity,
      setOpenMaterialCategory,
      setReminder,
      setSingleMeasurementsOpen,
      setStepFourDetailsOpen,
      setStepFourReviewMode,
      setWorthIt,
      updateNonBodyMeasurement,
      updatePerson,
      updatePersonDescription: (personId: string, value: string) => updatePerson(personId, (person) => ({ ...person, description: value })),
      updatePersonMeasurement,
      updateSharedItemType,
      toggleStepOneMeasurements: (personId: string) => setStepOneMeasurementsOpen((prev) => ({ ...prev, [personId]: !(prev[personId] ?? true) })),
      viewJobs: () => navigate('/jobs'),
    },
    derived: {
      effectiveItemType,
      isAmendmentMode,
      scopeLabel,
      selectedMaterialValue,
      selectedNonBodyFields,
      showAmendmentMaterialFlow,
      showBodyMeasurementFlow,
      showFullMaterialFlow,
      showNonBodyMeasurementFlow,
      ...pricing,
    },
    repeatClient: Boolean(repeatClient),
    sectionRef,
    state: {
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
      singleMeasurementsOpen,
      step,
      stepFourDetailsOpen,
      stepFourReviewMode,
      stepOneMeasurementsOpen,
      successOpen,
      worthIt,
    },
  }
}

export type NewJobWizardModel = ReturnType<typeof useNewJobWizard>
