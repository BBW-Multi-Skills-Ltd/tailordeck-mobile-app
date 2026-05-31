import { AnimatePresence, motion } from 'framer-motion'
import { useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useClients } from '../hooks/useClients'
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
} from '../components/newjob/newJobConfig'
import { ensurePersonsForJobType } from '../components/newjob/newJobFlow'
import { calculateJobPricing } from '../components/newjob/newJobCalculations'
import { usePageNoScroll, useSharedItemTypeSync } from '../components/newjob/useNewJobEffects'
import { useRepeatClientPrefill } from '../components/newjob/useRepeatClientPrefill'
import {
  JobSuccessView,
  NewJobHeader,
  StepProgress,
  WizardFooter,
  WizardLoadingOverlay,
} from '../components/newjob/NewJobChrome'
import StepCosting from '../components/newjob/StepCosting'
import StepDeadlineReview from '../components/newjob/StepDeadlineReview'
import StepMaterialPricing from '../components/newjob/StepMaterialPricing'
import StepClientMeasurements from '../components/newjob/StepClientMeasurements'

export default function NewJob() {
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
  const [itemType, setItemType] = useState<string>('')
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
  const [openMaterialCategory, setOpenMaterialCategory] = useState<string>('local')
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

  const { charge, depositPercentValue, deposit, balance, totalExpenses, projectedProfit } = calculateJobPricing(chargeAmount, depositPercent, expenses)
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
    if (nextCategory === 'Body Wear') {
      setItemType('')
      setSameItemForAll(true)
      setJobType('Single')
      setPersons((prev) => ensurePersonsForJobType('Single', prev, clientName))
      return
    }

    setItemType('')
    setJobType('Single')
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
    if (!files) {
      setReferencePhotoNames([])
      return
    }

    setReferencePhotoNames(Array.from(files).map((file) => file.name))
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

  function updatePersonDescription(personId: string, value: string): void {
    updatePerson(personId, (person) => ({ ...person, description: value }))
  }

  function updateSharedItemType(value: string): void {
    setItemType(value)
    if (!sameItemForAll || makeCategory !== 'Body Wear') return
    setPersons((prev) => prev.map((person) => ({ ...person, itemType: value })))
  }

  function handleSameItemToggle(enabled: boolean): void {
    setSameItemForAll(enabled)
    if (!enabled || makeCategory !== 'Body Wear') return
    setPersons((prev) => {
      const primaryItem = prev[0]?.itemType?.trim() || itemType.trim()
      return prev.map((person, index) => ({ ...person, itemType: index === 0 ? primaryItem : primaryItem }))
    })
    if (!itemType.trim()) {
      const firstPersonItem = persons[0]?.itemType?.trim()
      if (firstPersonItem) setItemType(firstPersonItem)
    }
  }

  function addChild(): void {
    setPersons((prev) => [
      ...prev,
      newPerson({
        name: `Child ${prev.filter((p) => p.role === 'child').length + 1}`,
        sex: 'Boy',
        role: 'child',
        itemType: sameItemForAll ? itemType : '',
      }),
    ])
  }

  function addAdult(): void {
    const nextAdultNumber = persons.filter((person) => person.role === 'adult').length + 1
    const nextSex: PersonSex = nextAdultNumber % 2 === 0 ? 'Female' : 'Male'
    setPersons((prev) => [
      ...prev,
      newPerson({
        name: `Adult ${nextAdultNumber}`,
        sex: nextSex,
        role: 'adult',
        itemType: sameItemForAll ? itemType : '',
      }),
    ])
  }

  function removePerson(personId: string): void {
    setPersons((prev) => prev.filter((person) => person.id !== personId))
  }

  function addExpense(): void {
    const cleanName = expenseDraftName.trim()
    const cleanCost = digitsOnly(expenseDraftCost)
    if (!cleanName && !cleanCost) return

    setExpenses((prev) => [
      ...prev,
      {
        id: `ex-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: cleanName || 'Expense',
        cost: cleanCost || '0',
      },
    ])
    setExpenseDraftName('')
    setExpenseDraftCost('')
  }

  function removeExpense(expenseId: string): void {
    setExpenses((prev) => prev.filter((expense) => expense.id !== expenseId))
  }

  function toggleStepOneMeasurements(personId: string): void {
    setStepOneMeasurementsOpen((prev) => ({
      ...prev,
      [personId]: !(prev[personId] ?? true),
    }))
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

    const confirmed = window.confirm('Discard this new job and return to Jobs?')
    if (confirmed) navigate('/jobs')
  }

  function goNext(): void {
    if (step === 2) {
      setStepFourReviewMode(false)
      setDraftSaved(false)
    }

    setStep((prev) => Math.min(prev + 1, stepLabels.length - 1))
  }

  function handleSaveDraft(): void {
    setDraftSaved(true)
  }

  function handleFinalizeJob(): void {
    setIsFinalizing(true)
    setDraftSaved(false)
    window.setTimeout(() => {
      setIsFinalizing(false)
      setSuccessOpen(true)
    }, 1100)
  }

  if (successOpen) {
    return (
      <JobSuccessView
        clientName={clientName}
        jobType={jobType}
        charge={charge}
        deadlineDate={deadlineDate}
        onViewJobs={() => navigate('/jobs')}
      />
    )
  }

  return (
    <section ref={sectionRef} className="section stack gap-16 wizard-page">
      <NewJobHeader onBack={goBack} />

      <StepProgress step={step} labels={stepLabels} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.2 }}
          className="stack gap-12"
        >
          {step === 0 ? (
            <StepClientMeasurements
              repeatClient={Boolean(repeatClient)}
              clientName={clientName}
              clientPhone={clientPhone}
              makeCategory={makeCategory}
              orderMode={orderMode}
              itemType={itemType}
              jobType={jobType}
              sameItemForAll={sameItemForAll}
              showBodyMeasurementFlow={showBodyMeasurementFlow}
              showNonBodyMeasurementFlow={showNonBodyMeasurementFlow}
              isAmendmentMode={isAmendmentMode}
              persons={persons}
              singleMeasurementsOpen={singleMeasurementsOpen}
              stepOneMeasurementsOpen={stepOneMeasurementsOpen}
              selectedNonBodyFields={selectedNonBodyFields}
              nonBodyMeasurements={nonBodyMeasurements}
              nonBodyQuantity={nonBodyQuantity}
              nonBodyDescription={nonBodyDescription}
              amendmentIssueType={amendmentIssueType}
              amendmentArea={amendmentArea}
              amendmentTarget={amendmentTarget}
              amendmentDescription={amendmentDescription}
              onClientNameChange={handleClientNameChange}
              onClientPhoneChange={setClientPhone}
              onMakeCategoryChange={handleMakeCategoryChange}
              onOrderModeChange={handleOrderModeChange}
              onSharedItemTypeChange={updateSharedItemType}
              onJobTypeChange={handleJobTypeChange}
              onSameItemToggle={handleSameItemToggle}
              onSingleMeasurementsOpenChange={setSingleMeasurementsOpen}
              onTogglePersonMeasurements={toggleStepOneMeasurements}
              onUpdatePerson={updatePerson}
              onUpdatePersonMeasurement={updatePersonMeasurement}
              onUpdatePersonDescription={updatePersonDescription}
              onRemovePerson={removePerson}
              onAddAdult={addAdult}
              onAddChild={addChild}
              onNonBodyQuantityChange={setNonBodyQuantity}
              onNonBodyMeasurementChange={updateNonBodyMeasurement}
              onNonBodyDescriptionChange={setNonBodyDescription}
              onAmendmentIssueTypeChange={setAmendmentIssueType}
              onAmendmentAreaChange={setAmendmentArea}
              onAmendmentTargetChange={setAmendmentTarget}
              onAmendmentDescriptionChange={setAmendmentDescription}
            />
          ) : null}
          {step === 1 ? (
            <StepMaterialPricing
              isAmendmentMode={isAmendmentMode}
              amendmentNeedsMaterials={amendmentNeedsMaterials}
              showFullMaterialFlow={showFullMaterialFlow}
              showAmendmentMaterialFlow={showAmendmentMaterialFlow}
              openMaterialCategory={openMaterialCategory}
              materialType={materialType}
              customMaterialType={customMaterialType}
              materialColor={materialColor}
              materialYards={materialYards}
              materialQuality={materialQuality}
              materialSource={materialSource}
              amendmentPartName={amendmentPartName}
              amendmentPartQuantity={amendmentPartQuantity}
              chargeAmount={chargeAmount}
              depositPercent={depositPercent}
              depositPercentValue={depositPercentValue}
              deposit={deposit}
              balance={balance}
              referencePhotoNames={referencePhotoNames}
              onAmendmentMaterialsToggle={handleAmendmentMaterialsToggle}
              onOpenMaterialCategoryChange={setOpenMaterialCategory}
              onMaterialTypeChange={setMaterialType}
              onCustomMaterialTypeChange={setCustomMaterialType}
              onMaterialColorChange={setMaterialColor}
              onMaterialYardsChange={setMaterialYards}
              onMaterialQualityChange={setMaterialQuality}
              onMaterialSourceChange={setMaterialSource}
              onAmendmentPartNameChange={setAmendmentPartName}
              onAmendmentPartQuantityChange={setAmendmentPartQuantity}
              onChargeAmountChange={setChargeAmount}
              onDepositPercentChange={setDepositPercent}
              onDepositPercentKeyDown={handleDepositPercentKeyDown}
              onReferencePhotoUpload={handleReferencePhotoUpload}
            />
          ) : null}

          {step === 2 ? (
            <StepCosting
              expenseDraftName={expenseDraftName}
              expenseDraftCost={expenseDraftCost}
              expenses={expenses}
              charge={charge}
              totalExpenses={totalExpenses}
              projectedProfit={projectedProfit}
              worthIt={worthIt}
              onExpenseDraftNameChange={setExpenseDraftName}
              onExpenseDraftCostChange={setExpenseDraftCost}
              onAddExpense={addExpense}
              onRemoveExpense={removeExpense}
              onWorthItChange={setWorthIt}
            />
          ) : null}

          {step === 3 ? (
            <StepDeadlineReview
              reviewMode={stepFourReviewMode}
              detailsOpen={stepFourDetailsOpen}
              draftSaved={draftSaved}
              balance={balance}
              reminder={reminder}
              deadlineDate={deadlineDate}
              deadlineTime={deadlineTime}
              clientName={clientName}
              clientPhone={clientPhone}
              orderMode={orderMode}
              makeCategory={makeCategory}
              scopeLabel={scopeLabel}
              sameItemForAll={sameItemForAll}
              effectiveItemType={effectiveItemType}
              persons={persons}
              selectedNonBodyFields={selectedNonBodyFields}
              isAmendmentMode={isAmendmentMode}
              nonBodyDescription={nonBodyDescription}
              amendmentIssueType={amendmentIssueType}
              amendmentArea={amendmentArea}
              amendmentTarget={amendmentTarget}
              amendmentDescription={amendmentDescription}
              selectedMaterialValue={selectedMaterialValue}
              materialColor={materialColor}
              materialYards={materialYards}
              materialQuality={materialQuality}
              materialSource={materialSource}
              charge={charge}
              deposit={deposit}
              referencePhotoNames={referencePhotoNames}
              expenses={expenses}
              totalExpenses={totalExpenses}
              projectedProfit={projectedProfit}
              onDeadlineDateChange={setDeadlineDate}
              onDeadlineTimeChange={setDeadlineTime}
              onReminderChange={setReminder}
              onDetailsOpenChange={setStepFourDetailsOpen}
            />
          ) : null}
        </motion.div>
      </AnimatePresence>

      <WizardFooter
        step={step}
        isReviewMode={stepFourReviewMode}
        isFinalizing={isFinalizing}
        onBack={goBack}
        onNext={goNext}
        onProceedToReview={() => setStepFourReviewMode(true)}
        onSaveDraft={handleSaveDraft}
        onFinalize={handleFinalizeJob}
      />

      {isFinalizing ? <WizardLoadingOverlay /> : null}
    </section>
  )
}





