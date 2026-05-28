import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Coins,
  FileText,
  Images,
  Layers,
  Package,
  Palette,
  Phone,
  Plus,
  Ruler,
  Scissors,
  Shirt,
  Trash2,
  TrendingUp,
  Truck,
  Upload,
  UserRound,
  Wrench,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { jobMeasurementById, type JobMeasurementSnapshot } from '../data/mockJobMeasurements'
import { mockJobs } from '../data/mockJobs'
import { useClients } from '../hooks/useClients'
import { formatNaira } from '../lib/utils'
import type { Client } from '../types/client'

type JobType = 'Single' | 'Couple' | 'Family'
type PersonSex = 'Male' | 'Female' | 'Boy' | 'Girl'
type MakeCategory = 'Body Wear' | 'Non-Body Item'
type OrderMode = 'New Stitch' | 'Amendment / Repair'
type Reminder = '1 day before' | '3 days before' | '1 week before' | 'none'
type MaterialQuality = 'Normal' | 'Original' | 'Fake' | 'High Standard'
type MaterialSource = 'Client is Providing Material' | 'I Am Getting It'

type MaterialOption = {
  name: string
  description: string
}

type MaterialCategory = {
  id: string
  title: string
  options: MaterialOption[]
}

type PersonForm = {
  id: string
  name: string
  sex: PersonSex
  role: 'adult' | 'child'
  age: string
  itemType: string
  description: string
  measurements: Record<string, string>
}

type ExpenseForm = {
  id: string
  name: string
  cost: string
}

const stepLabels = [
  'Client Info & Measurements',
  'Materials / Parts & Pricing',
  'Costing / Expenses',
  'Deadline',
] as const

const reminders: Reminder[] = ['1 day before', '3 days before', '1 week before', 'none']
const qualities: MaterialQuality[] = ['Normal', 'Original', 'Fake', 'High Standard']
const materialSources: MaterialSource[] = ['Client is Providing Material', 'I Am Getting It']
const makeCategories: MakeCategory[] = ['Body Wear', 'Non-Body Item']
const orderModes: OrderMode[] = ['New Stitch', 'Amendment / Repair']
const scopeForBodyWear: JobType[] = ['Single', 'Couple', 'Family']
const scopeForNonBody: JobType[] = ['Single']
const amendmentIssueOptions = [
  'Resize / Tighten',
  'Loose / Expand',
  'Zip Replacement',
  'Patch / Repair Tear',
  'Shorten Length',
  'Adjust Sleeve',
  'Button Replacement',
  'Other',
] as const
const amendmentPartOptions = ['Zip', 'Button', 'Lining', 'Thread', 'Fabric Patch', 'Hook', 'Elastic', 'Other'] as const
const bodyWearItems = [
  'T-shirt',
  '2-Piece (Up & Down)',
  'Suit Jacket',
  'Full Suit Set',
  'Trouser',
  'Shorts',
  'Jacket',
  'Hoodie',
  'Gown',
  'Wedding Gown',
  'Agbada',
  'Kaftan',
] as const
const nonBodyItems = [
  'Bedcover',
  'Blanket',
  'Duvet',
  'Pillow Case',
  'Face Cap',
] as const
const nonBodyMeasurementTemplate: Record<string, string[]> = {
  Bedcover: ['length', 'width', 'drop'],
  Blanket: ['length', 'width'],
  Duvet: ['length', 'width'],
  'Pillow Case': ['length', 'width'],
  'Face Cap': ['head_circumference', 'crown_height', 'brim_length'],
  Other: ['length', 'width', 'height'],
}
const materialCategories: MaterialCategory[] = [
  {
    id: 'local',
    title: 'Local Materials',
    options: [
      { name: 'Ankara', description: 'Vibrant cotton fabric with rich, colourful patterns used for daily wear.' },
      { name: 'Lace', description: 'Embroidered mesh fabric used for premium traditional party wear.' },
      { name: 'Aso Oke', description: 'Thick, handwoven traditional fabric used for special family celebrations.' },
      { name: 'Adire', description: 'Beautifully patterned cotton cloth made using local indigo tie-dye methods.' },
      { name: 'Kampala', description: 'Colourful, locally hand-dyed cotton fabric for casual clothing.' },
      { name: 'Guinea Brocade', description: 'Crisp, polished cotton with subtle patterns woven into the fabric.' },
    ],
  },
  {
    id: 'commercial',
    title: 'Commercial Materials',
    options: [
      { name: 'Crepe', description: 'Smooth fabric with a textured, pebbled feel used for office gowns.' },
      { name: 'Scuba', description: 'Thick, stretchy fabric that gives clothes a structured and fitted shape.' },
      { name: 'Chiffon', description: 'Lightweight, see-through fabric used for flowing dresses and soft tops.' },
      { name: 'Cotton Jersey', description: 'Soft, highly stretchy material used for casual t-shirts and loungewear.' },
      { name: 'Linen', description: 'High-quality, breathable fabric perfect for hot weather and resort wear.' },
      { name: 'Polyester Blends', description: 'Long-lasting, wrinkle-free fabric ideal for everyday mass production.' },
    ],
  },
  {
    id: 'industrial',
    title: 'Industrial Materials',
    options: [
      { name: 'Khaki', description: 'Sturdy, heavyweight cotton fabric used for workwear and uniform trousers.' },
      { name: 'Denim', description: 'Strong, rugged cotton twill used to make durable jeans and jackets.' },
      { name: 'Gabardine', description: 'Tightly woven, durable fabric used for tailored corporate suits.' },
      { name: 'Reflective Polyester', description: 'High-visibility neon fabric used to make safety vests.' },
      { name: 'Canvas', description: 'Extreme heavy-duty cloth used for aprons, industrial bags, and shoes.' },
      { name: 'Drill', description: 'Tough cotton material used for heavy utility uniforms and overalls.' },
    ],
  },
  {
    id: 'international',
    title: 'International Materials',
    options: [
      { name: 'Satin', description: 'Glossy, smooth fabric with a shiny surface used for evening dresses.' },
      { name: 'Organza', description: 'Thin, stiff, see-through fabric used to create dramatic volume and ruffles.' },
      { name: 'Velvet', description: 'Soft, plush fabric with a thick pile used for luxury wear.' },
      { name: 'Tulle', description: 'Fine, delicate netting fabric used for bridal veils and dress layers.' },
      { name: 'Silk', description: 'Premium natural fabric loved for its high shine and soft drape.' },
      { name: 'Taffeta', description: 'Crisp, smooth fabric that holds its shape well for ballgowns.' },
      { name: 'Sequinned Netting', description: 'Mesh fabric covered in sparkling beads for glamorous party outfits.' },
    ],
  },
  {
    id: 'others',
    title: 'Others',
    options: [
      { name: 'Other Material', description: 'Click here to type your material if it is not listed above.' },
    ],
  },
]
const STEP1_MALE_FIELDS = ['chest', 'waist', 'shoulder', 'hip', 'inseam', 'sleeve', 'neck', 'thigh']
const STEP1_FEMALE_FIELDS = ['chest', 'bust', 'waist', 'shoulder', 'hip', 'sleeve', 'neck', 'thigh']

const CHILD_FIELDS = ['chest', 'shoulder', 'sleeve', 'waist', 'hip', 'inseam', 'ankle']

function labelFromField(field: string): string {
  return field
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function step1FieldsBySex(sex: PersonSex): string[] {
  if (sex === 'Female') return STEP1_FEMALE_FIELDS
  return STEP1_MALE_FIELDS
}

function numericValue(value: string): number {
  const parsed = Number(value)
  if (Number.isNaN(parsed)) return 0
  return parsed
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

function formatNairaInput(value: string): string {
  const digits = digitsOnly(value)
  if (!digits) return ''
  return `\u20A6${Number(digits).toLocaleString('en-NG')}`
}

function formatPercentInput(value: string): string {
  const digits = digitsOnly(value)
  if (!digits) return ''
  const safe = Math.min(Number(digits), 100)
  return `${safe}%`
}

function newPerson(overrides?: Partial<PersonForm>): PersonForm {
  return {
    id: `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: '',
    sex: 'Female',
    role: 'adult',
    age: '',
    itemType: '',
    description: '',
    measurements: {},
    ...overrides,
  }
}

function measurementNumbersToStrings(measurements: Record<string, number>): Record<string, string> {
  return Object.fromEntries(Object.entries(measurements).map(([field, value]) => [field, String(value)]))
}

function latestMeasurementForClient(clientId: string): JobMeasurementSnapshot | undefined {
  const clientJobs = mockJobs
    .filter((job) => job.clientId === clientId && jobMeasurementById[job.id])
    .sort((a, b) => {
      if (a.status === 'Completed' && b.status !== 'Completed') return -1
      if (a.status !== 'Completed' && b.status === 'Completed') return 1
      return a.createdDate < b.createdDate ? 1 : -1
    })

  return clientJobs[0] ? jobMeasurementById[clientJobs[0].id] : undefined
}

function snapshotPersonsToForm(snapshot: Extract<JobMeasurementSnapshot, { kind: 'body' }>, client: Client): PersonForm[] {
  return snapshot.persons.map((person, index) =>
    newPerson({
      id: person.id,
      name: index === 0 ? client.name : person.name,
      sex: person.sex,
      role: person.role,
      itemType: person.itemType || snapshot.itemType,
      description: person.description || '',
      measurements: measurementNumbersToStrings(person.measurements),
    }),
  )
}

type ReviewRowProps = {
  icon: ReactNode
  label: string
  value: string
  valueClassName?: string
}

function ReviewRow({ icon, label, value, valueClassName }: ReviewRowProps) {
  return (
    <div className="wizard-detail-row">
      <span className="wizard-detail-icon">{icon}</span>
      <p className="wizard-detail-line">
        <span className="text-muted">{label}:</span> <strong className={valueClassName}>{value || '-'}</strong>
      </p>
    </div>
  )
}

function ensurePersonsForJobType(jobType: JobType, prevPersons: PersonForm[], clientName: string): PersonForm[] {
  const primaryName = clientName.trim()

  if (jobType === 'Single') {
    const existing = prevPersons[0]
    return [
      existing
        ? { ...existing, name: primaryName || existing.name || 'Client', role: 'adult', sex: existing.sex === 'Boy' || existing.sex === 'Girl' ? 'Female' : existing.sex }
        : newPerson({ name: primaryName || 'Client', sex: 'Female', role: 'adult' }),
    ]
  }

  if (jobType === 'Couple') {
    const first = prevPersons[0] ?? newPerson({ name: primaryName || 'Client', sex: 'Male', role: 'adult' })
    const second = prevPersons[1] ?? newPerson({ name: 'Person 2', sex: 'Female', role: 'adult' })
    return [
      { ...first, name: primaryName || first.name || 'Client', role: 'adult', sex: first.sex === 'Boy' || first.sex === 'Girl' ? 'Male' : first.sex },
      { ...second, role: 'adult', sex: second.sex === 'Boy' || second.sex === 'Girl' ? 'Female' : second.sex },
    ]
  }

  const adults = prevPersons.filter((person) => person.role === 'adult')
  const children = prevPersons.filter((person) => person.role === 'child')
  const firstAdult = adults[0] ?? newPerson({ name: primaryName || 'Client', sex: 'Male', role: 'adult' })
  const secondAdult = adults[1] ?? newPerson({ name: 'Adult 2', sex: 'Female', role: 'adult' })
  const extraAdults = adults.slice(2).map((adult, index) => ({
    ...adult,
    role: 'adult' as const,
    sex: adult.sex === 'Boy' || adult.sex === 'Girl' ? (index % 2 === 0 ? 'Male' : 'Female') : adult.sex,
  }))

  return [
    { ...firstAdult, name: primaryName || firstAdult.name || 'Client', role: 'adult', sex: firstAdult.sex === 'Boy' || firstAdult.sex === 'Girl' ? 'Male' : firstAdult.sex },
    { ...secondAdult, role: 'adult', sex: secondAdult.sex === 'Boy' || secondAdult.sex === 'Girl' ? 'Female' : secondAdult.sex },
    ...extraAdults,
    ...children,
  ]
}

export default function NewJob() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { getClientById } = useClients()
  const sectionRef = useRef<HTMLElement | null>(null)
  const prefilledClientRef = useRef(false)
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

  useEffect(() => {
    if (!repeatClient || prefilledClientRef.current) return

    const latestSnapshot = latestMeasurementForClient(repeatClient.id)

    setClientName(repeatClient.name)
    setClientPhone(repeatClient.phone)
    setOrderMode('New Stitch')

    if (latestSnapshot?.kind === 'body') {
      const nextPersons = snapshotPersonsToForm(latestSnapshot, repeatClient)
      const nextScope = latestSnapshot.orderScope
      const firstItem = nextPersons[0]?.itemType || latestSnapshot.itemType
      const everyPersonSameItem = nextPersons.every((person) => person.itemType === firstItem)

      setMakeCategory('Body Wear')
      setJobType(nextScope)
      setItemType(everyPersonSameItem ? firstItem : latestSnapshot.itemType)
      setSameItemForAll(everyPersonSameItem)
      setPersons(nextPersons.length ? nextPersons : [newPerson({ name: repeatClient.name, sex: repeatClient.sex, role: 'adult' })])
      setStepOneMeasurementsOpen(Object.fromEntries(nextPersons.map((person) => [person.id, true])))
      setSingleMeasurementsOpen(true)
    } else if (latestSnapshot?.kind === 'non-body') {
      setMakeCategory('Non-Body Item')
      setJobType('Single')
      setItemType(latestSnapshot.itemType)
      setNonBodyQuantity(String(latestSnapshot.quantity))
      setNonBodyDescription(latestSnapshot.description || '')
      setNonBodyMeasurements(measurementNumbersToStrings(latestSnapshot.measurements))
      setPersons([newPerson({ name: repeatClient.name, sex: repeatClient.sex, role: 'adult' })])
    } else {
      setMakeCategory('Body Wear')
      setJobType('Single')
      setPersons([newPerson({ name: repeatClient.name, sex: repeatClient.sex, role: 'adult', measurements: measurementNumbersToStrings({ ...repeatClient.measurements }) })])
      setSingleMeasurementsOpen(true)
    }

    prefilledClientRef.current = true
  }, [repeatClient])

  useEffect(() => {
    const pageElement = document.querySelector('main.page')
    if (!pageElement) return

    if (successOpen) {
      pageElement.classList.add('page-no-scroll')
    } else {
      pageElement.classList.remove('page-no-scroll')
    }

    return () => {
      pageElement.classList.remove('page-no-scroll')
    }
  }, [successOpen])

  useEffect(() => {
    if (makeCategory !== 'Body Wear' || !sameItemForAll) return
    setPersons((prev) => prev.map((person) => ({ ...person, itemType })))
  }, [itemType, sameItemForAll, makeCategory])

  const charge = numericValue(digitsOnly(chargeAmount))
  const depositPercentValue = Math.max(Math.min(numericValue(depositPercent), 100), 0)
  const deposit = Math.round((charge * depositPercentValue) / 100)
  const balance = Math.max(charge - deposit, 0)
  const totalExpenses = expenses.reduce((sum, item) => sum + numericValue(digitsOnly(item.cost)), 0)
  const projectedProfit = charge - totalExpenses
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
      <section className="section stack gap-16 wizard-page wizard-success-page">
        <div className="stack gap-16 wizard-success-screen">
          <div className="wizard-success-icon-wrap">
            <CheckCircle2 size={58} className="wizard-success-icon" />
          </div>
          <p className="wizard-success-kicker">JOB CONFIRMED</p>
          <h2 className="wizard-success-title">Contract Created!</h2>
          <p className="text-sm text-muted wizard-success-sub">You now have a contract with</p>
          <p className="wizard-success-client">{clientName || 'Client'}</p>

          <div className="card stack gap-8 wizard-success-summary-card">
            <div className="row-between"><p className="text-sm text-muted">Type</p><p className="font-semibold">{jobType}</p></div>
            <div className="row-between"><p className="text-sm text-muted">Charge</p><p className="font-semibold">{formatNaira(charge)}</p></div>
            <div className="row-between"><p className="text-sm text-muted">Delivery</p><p className="font-semibold">{deadlineDate || '-'}</p></div>
            <div className="row-between"><p className="text-sm text-muted">Status</p><p className="wizard-pending-text">Pending ⏳</p></div>
          </div>

          <button type="button" className="btn btn-primary btn-full" onClick={() => navigate('/jobs')}>
            View in Jobs <ArrowRight size={18} />
          </button>
        </div>
      </section>
    )
  }

  return (
    <section ref={sectionRef} className="section stack gap-16 wizard-page">
      <div className="row-between">
        <button type="button" className="btn btn-ghost btn-icon" onClick={goBack} aria-label="Back">
          <ArrowLeft size={18} />
        </button>
        <h2 className="app-page-heading">New Job</h2>
        <span style={{ width: '44px' }} />
      </div>

      <div className="stack gap-8">
        <p className="text-sm text-muted">
          Step {step + 1} of {stepLabels.length} - {stepLabels[step]}
        </p>
        <div className="step-progress">
          {stepLabels.map((label, index) => (
            <div
              key={label}
              className={`step-bar${index < step ? ' done' : ''}${index === step ? ' active' : ''}`}
            />
          ))}
        </div>
      </div>

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
            <div className="stack gap-12">
              <label className="input-group">
                <span className="input-label">Client Full Name *</span>
                <input
                  className="input"
                  value={clientName}
                  onChange={(event) => handleClientNameChange(event.target.value)}
                  placeholder="e.g. Amina Bello"
                  autoFocus
                  readOnly={Boolean(repeatClient)}
                />
              </label>

              <label className="input-group">
                <span className="input-label">Phone / WhatsApp *</span>
                <input
                  className="input"
                  value={clientPhone}
                  onChange={(event) => setClientPhone(event.target.value)}
                  placeholder="e.g. 08012345678"
                  inputMode="tel"
                  readOnly={Boolean(repeatClient)}
                />
              </label>

              {repeatClient ? (
                <article className="card stack gap-6 wizard-repeat-client-note">
                  <p className="text-sm font-semibold">Existing client selected</p>
                  <p className="text-sm text-muted">
                    Client details and latest measurements are prefilled. Edit measurements here only if this new job needs updated values.
                  </p>
                </article>
              ) : null}

              <div className="input-group">
                <span className="input-label">What type of order is this?</span>
                <div className="wizard-sex-group">
                  {makeCategories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      className={`pill wizard-jobtype-pill${makeCategory === category ? ' active' : ''}`}
                      onClick={() => handleMakeCategoryChange(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div className="input-group">
                <span className="input-label">Order Mode</span>
                <div className="wizard-sex-group">
                  {orderModes.map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      className={`pill wizard-jobtype-pill${orderMode === mode ? ' active' : ''}`}
                      onClick={() => handleOrderModeChange(mode)}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {!(showBodyMeasurementFlow && jobType === 'Single') ? (
                <label className="input-group">
                  <span className="input-label">What are you making?</span>
                  <input
                    className="input"
                    value={itemType}
                    onChange={(event) => updateSharedItemType(event.target.value)}
                    placeholder={makeCategory === 'Body Wear' ? 'e.g. Wedding gown, Shirt, Agbada' : 'e.g. Bedcover, Pillow case, Face cap'}
                    list={makeCategory === 'Body Wear' ? 'body-wear-item-options' : 'non-body-item-options'}
                  />
                </label>
              ) : null}

              <datalist id="body-wear-item-options">
                {bodyWearItems.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
              <datalist id="non-body-item-options">
                {nonBodyItems.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>

              {!isAmendmentMode ? (
                <div className="input-group">
                  <span className="input-label">Order Scope</span>
                  <div className="wizard-jobtype-group">
                    {(makeCategory === 'Body Wear' ? scopeForBodyWear : scopeForNonBody).map((type) => (
                      <button
                        key={type}
                        type="button"
                        className={`pill wizard-jobtype-pill${jobType === type ? ' active' : ''}`}
                        onClick={() => handleJobTypeChange(type)}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {showBodyMeasurementFlow && jobType !== 'Single' ? (
                <div className="input-group">
                  <span className="input-label">Use same item for everyone?</span>
                  <div className="wizard-sex-group">
                    <button
                      type="button"
                      className={`pill wizard-jobtype-pill${sameItemForAll ? ' active' : ''}`}
                      onClick={() => handleSameItemToggle(true)}
                    >
                      Same Item
                    </button>
                    <button
                      type="button"
                      className={`pill wizard-jobtype-pill${!sameItemForAll ? ' active' : ''}`}
                      onClick={() => handleSameItemToggle(false)}
                    >
                      Different Items
                    </button>
                  </div>
                </div>
              ) : null}

              {showBodyMeasurementFlow && jobType === 'Single' ? (
                <div className="stack gap-8 wizard-step1-measurements">
                  <p className="input-label">Measurements</p>
                  <article className="card stack gap-12">
                    <button
                      type="button"
                      className="row-between wizard-person-toggle"
                      onClick={() => setSingleMeasurementsOpen((prev) => !prev)}
                      aria-expanded={singleMeasurementsOpen}
                    >
                      <div className="row gap-8">
                        <div className="wizard-person-icon center">
                          <UserRound size={14} />
                        </div>
                        <div className="stack gap-4">
                          <h5>{persons[0]?.name || clientName || 'Client'}</h5>
                          <p className="text-sm text-muted">{persons[0]?.sex ?? 'Male'} - adult</p>
                        </div>
                      </div>
                      {singleMeasurementsOpen ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
                    </button>

                    <motion.div
                      className="stack gap-12 wizard-collapsible"
                      initial={false}
                      animate={{
                        height: singleMeasurementsOpen ? 'auto' : 0,
                        opacity: singleMeasurementsOpen ? 1 : 0,
                      }}
                      transition={{
                        height: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
                        opacity: { duration: 0.2, ease: 'easeOut' },
                      }}
                      style={{ pointerEvents: singleMeasurementsOpen ? 'auto' : 'none' }}
                    >
                        <div className="input-group">
                          <span className="input-label">Sex</span>
                          <div className="wizard-sex-group">
                            {(['Male', 'Female'] as const).map((sex) => (
                              <button
                                key={sex}
                                type="button"
                                className={`pill wizard-jobtype-pill${persons[0]?.sex === sex ? ' active' : ''}`}
                                onClick={() =>
                                  updatePerson(persons[0].id, (person) => ({
                                    ...person,
                                    sex,
                                    role: 'adult',
                                  }))
                                }
                              >
                                {sex}
                              </button>
                            ))}
                          </div>
                        </div>

                        <label className="input-group">
                          <span className="input-label">What are you making for this person?</span>
                          <input
                            className="input"
                            value={persons[0]?.itemType || itemType}
                            onChange={(event) => {
                              updateSharedItemType(event.target.value)
                              updatePerson(persons[0].id, (person) => ({ ...person, itemType: event.target.value }))
                            }}
                            placeholder="e.g. Shirt, Gown, Agbada"
                            list="body-wear-item-options"
                          />
                        </label>

                        <div className="stack gap-8">
                          <p className="text-sm text-muted">Body Measurements (cm)</p>
                          <div className="wizard-measurements-grid">
                            {step1FieldsBySex(persons[0]?.sex ?? 'Male').map((field) => (
                              <label key={field} className="input-group">
                                <span className="input-label">
                                  {labelFromField(field)} (cm)
                                </span>
                                <input
                                  className="input"
                                  value={persons[0]?.measurements[field] ?? ''}
                                  onChange={(event) => updatePersonMeasurement(persons[0].id, field, event.target.value)}
                                  placeholder="0"
                                  inputMode="decimal"
                                />
                              </label>
                            ))}
                          </div>
                        </div>

                        <label className="input-group">
                          <span className="input-label">Description (optional)</span>
                          <input
                            className="input"
                            value={persons[0]?.description ?? ''}
                            onChange={(event) => updatePersonDescription(persons[0].id, event.target.value)}
                            placeholder="Any style notes for this person"
                          />
                        </label>
                    </motion.div>
                  </article>
                </div>
              ) : null}

              {showBodyMeasurementFlow && jobType === 'Couple' ? (
                <div className="stack gap-8 wizard-step1-measurements">
                  <p className="input-label">Measurements</p>
                  {persons.slice(0, 2).map((person, index) => {
                    const isOpen = stepOneMeasurementsOpen[person.id] ?? true

                    return (
                      <article key={person.id} className="card stack gap-12">
                        <button
                          type="button"
                          className="row-between wizard-person-toggle"
                          onClick={() => toggleStepOneMeasurements(person.id)}
                          aria-expanded={isOpen}
                        >
                          <div className="row gap-8">
                            <div className="wizard-person-icon center">
                              <UserRound size={14} />
                            </div>
                            <div className="stack gap-4">
                              <h5>{index === 0 ? person.name || clientName || 'Client' : `Person ${index + 1}`}</h5>
                              <p className="text-sm text-muted">{person.sex} - adult</p>
                            </div>
                          </div>
                          {isOpen ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
                        </button>

                        <motion.div
                          className="stack gap-12 wizard-collapsible"
                          initial={false}
                          animate={{
                            height: isOpen ? 'auto' : 0,
                            opacity: isOpen ? 1 : 0,
                          }}
                          transition={{
                            height: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
                            opacity: { duration: 0.2, ease: 'easeOut' },
                          }}
                          style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
                        >
                          <label className="input-group">
                            <span className="input-label">Name</span>
                            <input
                              className="input"
                              value={person.name}
                              onChange={(event) => updatePerson(person.id, (p) => ({ ...p, name: event.target.value }))}
                              placeholder={`Person ${index + 1} name`}
                              disabled={index === 0}
                            />
                          </label>

                          <label className="input-group">
                            <span className="input-label">What are you making for this person?</span>
                            <input
                              className="input"
                              value={sameItemForAll ? itemType : person.itemType}
                              onChange={(event) => {
                                if (sameItemForAll) {
                                  updateSharedItemType(event.target.value)
                                } else {
                                  updatePerson(person.id, (p) => ({ ...p, itemType: event.target.value }))
                                }
                              }}
                              placeholder="e.g. Suit, Gown, Kaftan"
                              list="body-wear-item-options"
                            />
                          </label>

                          <div className="input-group">
                            <span className="input-label">Sex</span>
                            <div className="wizard-sex-group">
                              {(['Male', 'Female'] as const).map((sex) => (
                                <button
                                  key={sex}
                                  type="button"
                                  className={`pill wizard-jobtype-pill${person.sex === sex ? ' active' : ''}`}
                                  onClick={() =>
                                    updatePerson(person.id, (p) => ({
                                      ...p,
                                      sex,
                                      role: 'adult',
                                    }))
                                  }
                                >
                                  {sex}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="stack gap-8">
                            <p className="text-sm text-muted">Body Measurements (cm)</p>
                            <div className="wizard-measurements-grid">
                              {step1FieldsBySex(person.sex).map((field) => (
                                <label key={`${person.id}-${field}`} className="input-group">
                                  <span className="input-label">
                                    {labelFromField(field)} (cm)
                                  </span>
                                  <input
                                    className="input"
                                    value={person.measurements[field] ?? ''}
                                    onChange={(event) => updatePersonMeasurement(person.id, field, event.target.value)}
                                    placeholder="0"
                                    inputMode="decimal"
                                  />
                                </label>
                              ))}
                            </div>
                          </div>

                          <label className="input-group">
                            <span className="input-label">Description (optional)</span>
                            <input
                              className="input"
                              value={person.description}
                              onChange={(event) => updatePersonDescription(person.id, event.target.value)}
                              placeholder="Any style notes for this person"
                            />
                          </label>
                        </motion.div>
                      </article>
                    )
                  })}
                </div>
              ) : null}

              {showBodyMeasurementFlow && jobType === 'Family' ? (
                <div className="stack gap-8 wizard-step1-measurements">
                  <p className="input-label">Measurements</p>

                  {persons.map((person, index) => {
                    const isOpen = stepOneMeasurementsOpen[person.id] ?? true
                    const adultIndex = persons.filter((p, i) => p.role === 'adult' && i <= index).length
                    const isPrimaryAdult = person.role === 'adult' && adultIndex === 1
                    const personLabel = isPrimaryAdult
                      ? person.name || clientName || 'Client'
                      : person.role === 'adult'
                        ? `Adult ${adultIndex}`
                        : person.name || 'Child'
                    const measurementFields = person.role === 'child' ? CHILD_FIELDS : step1FieldsBySex(person.sex)
                    const sexOptions = person.role === 'child' ? (['Boy', 'Girl'] as const) : (['Male', 'Female'] as const)

                    return (
                      <article key={person.id} className="card stack gap-12">
                        <div className="row-between">
                          <div className="row gap-8">
                            <div className="wizard-person-icon center">
                              <UserRound size={14} />
                            </div>
                            <div className="stack gap-4">
                              <h5>{personLabel}</h5>
                              <p className="text-sm text-muted">
                                {person.sex} - {person.role}
                              </p>
                            </div>
                          </div>
                          <div className="row gap-8">
                            {person.role === 'child' ? (
                              <button
                                type="button"
                                className="btn btn-ghost btn-icon"
                                onClick={() => removePerson(person.id)}
                                aria-label="Remove child"
                              >
                                <Trash2 size={15} />
                              </button>
                            ) : null}
                            <button
                              type="button"
                              className="btn btn-ghost btn-icon"
                              onClick={() => toggleStepOneMeasurements(person.id)}
                              aria-label={isOpen ? 'Collapse measurements' : 'Expand measurements'}
                              aria-expanded={isOpen}
                            >
                              {isOpen ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
                            </button>
                          </div>
                        </div>

                        <motion.div
                          className="stack gap-12 wizard-collapsible"
                          initial={false}
                          animate={{
                            height: isOpen ? 'auto' : 0,
                            opacity: isOpen ? 1 : 0,
                          }}
                          transition={{
                            height: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
                            opacity: { duration: 0.2, ease: 'easeOut' },
                          }}
                          style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
                        >
                          <label className="input-group">
                            <span className="input-label">Name</span>
                            <input
                              className="input"
                              value={person.name}
                              onChange={(event) => updatePerson(person.id, (p) => ({ ...p, name: event.target.value }))}
                              placeholder={person.role === 'child' ? 'Child name' : 'Adult name'}
                              disabled={isPrimaryAdult}
                            />
                          </label>

                          <label className="input-group">
                            <span className="input-label">What are you making for this person?</span>
                            <input
                              className="input"
                              value={sameItemForAll ? itemType : person.itemType}
                              onChange={(event) => {
                                if (sameItemForAll) {
                                  updateSharedItemType(event.target.value)
                                } else {
                                  updatePerson(person.id, (p) => ({ ...p, itemType: event.target.value }))
                                }
                              }}
                              placeholder="e.g. Agbada, Gown, Shirt"
                              list="body-wear-item-options"
                            />
                          </label>

                          <div className="input-group">
                            <span className="input-label">Sex</span>
                            <div className="wizard-sex-group">
                              {sexOptions.map((sex) => (
                                <button
                                  key={sex}
                                  type="button"
                                  className={`pill wizard-jobtype-pill${person.sex === sex ? ' active' : ''}`}
                                  onClick={() =>
                                    updatePerson(person.id, (p) => ({
                                      ...p,
                                      sex,
                                      role: sex === 'Boy' || sex === 'Girl' ? 'child' : 'adult',
                                    }))
                                  }
                                >
                                  {sex}
                                </button>
                              ))}
                            </div>
                          </div>

                          {person.role === 'child' ? (
                            <label className="input-group">
                              <span className="input-label">Age</span>
                              <input
                                className="input"
                                value={person.age}
                                onChange={(event) => updatePerson(person.id, (p) => ({ ...p, age: event.target.value }))}
                                placeholder="Child age"
                                inputMode="numeric"
                              />
                            </label>
                          ) : null}

                          <div className="stack gap-8">
                            <p className="text-sm text-muted">
                              {person.role === 'child' ? 'Child Measurements (cm)' : 'Body Measurements (cm)'}
                            </p>
                            <div className="wizard-measurements-grid">
                              {measurementFields.map((field) => (
                                <label key={`${person.id}-${field}`} className="input-group">
                                  <span className="input-label">
                                    {labelFromField(field)} (cm)
                                  </span>
                                  <input
                                    className="input"
                                    value={person.measurements[field] ?? ''}
                                    onChange={(event) => updatePersonMeasurement(person.id, field, event.target.value)}
                                    placeholder="0"
                                    inputMode="decimal"
                                  />
                                </label>
                              ))}
                            </div>
                          </div>

                          <label className="input-group">
                            <span className="input-label">Description (optional)</span>
                            <input
                              className="input"
                              value={person.description}
                              onChange={(event) => updatePersonDescription(person.id, event.target.value)}
                              placeholder="Any style notes for this person"
                            />
                          </label>
                        </motion.div>
                      </article>
                    )
                  })}

                  <button type="button" className="wizard-add-person-btn" onClick={addAdult}>
                    <Plus size={22} />
                    <span>Add Adult</span>
                  </button>

                  <button type="button" className="wizard-add-person-btn" onClick={addChild}>
                    <Plus size={22} />
                    <span>Add Child</span>
                  </button>
                </div>
              ) : null}

              {showNonBodyMeasurementFlow ? (
                <div className="stack gap-8 wizard-step1-measurements">
                  <p className="input-label">Item Measurements</p>
                  <article className="card stack gap-12">
                    <label className="input-group">
                      <span className="input-label">Quantity</span>
                      <input
                        className="input"
                        value={nonBodyQuantity}
                        onChange={(event) => setNonBodyQuantity(event.target.value)}
                        placeholder="1"
                        inputMode="numeric"
                      />
                    </label>

                    <div className="wizard-measurements-grid">
                      {selectedNonBodyFields.map((field) => (
                        <label key={field} className="input-group">
                          <span className="input-label">{labelFromField(field)} (cm)</span>
                          <input
                            className="input"
                            value={nonBodyMeasurements[field] ?? ''}
                            onChange={(event) => updateNonBodyMeasurement(field, event.target.value)}
                            placeholder="0"
                            inputMode="decimal"
                          />
                        </label>
                      ))}
                    </div>

                    <label className="input-group">
                      <span className="input-label">Description (optional)</span>
                      <input
                        className="input"
                        value={nonBodyDescription}
                        onChange={(event) => setNonBodyDescription(event.target.value)}
                        placeholder="Any notes for this non-body item"
                      />
                    </label>
                  </article>
                </div>
              ) : null}

              {isAmendmentMode ? (
                <div className="stack gap-8 wizard-step1-measurements">
                  <p className="input-label">Amendment / Repair Details</p>
                  <article className="card stack gap-12">
                    <label className="input-group">
                      <span className="input-label">Issue Type</span>
                      <input
                        className="input"
                        value={amendmentIssueType}
                        onChange={(event) => setAmendmentIssueType(event.target.value)}
                        placeholder="e.g. Zip replacement, Tighten waist"
                        list="amendment-issue-options"
                      />
                      <datalist id="amendment-issue-options">
                        {amendmentIssueOptions.map((option) => (
                          <option key={option} value={option} />
                        ))}
                      </datalist>
                    </label>

                    <label className="input-group">
                      <span className="input-label">Affected Area</span>
                      <input
                        className="input"
                        value={amendmentArea}
                        onChange={(event) => setAmendmentArea(event.target.value)}
                        placeholder="e.g. Waist, Sleeve, Zip area"
                      />
                    </label>

                    <label className="input-group">
                      <span className="input-label">Target Adjustment</span>
                      <input
                        className="input"
                        value={amendmentTarget}
                        onChange={(event) => setAmendmentTarget(event.target.value)}
                        placeholder="e.g. Reduce by 2 inches, replace with quality zip"
                      />
                    </label>

                    <label className="input-group">
                      <span className="input-label">Description (optional)</span>
                      <input
                        className="input"
                        value={amendmentDescription}
                        onChange={(event) => setAmendmentDescription(event.target.value)}
                        placeholder="Any extra notes about the amendment"
                      />
                    </label>
                  </article>
                </div>
              ) : null}
            </div>
          ) : null}

          {step === 1 ? (
            <div className="stack gap-12">
              {isAmendmentMode ? (
                <div className="input-group">
                  <span className="input-label">Need extra materials or parts?</span>
                  <div className="wizard-sex-group">
                    <button
                      type="button"
                      className={`pill wizard-jobtype-pill${amendmentNeedsMaterials ? ' active' : ''}`}
                      onClick={() => handleAmendmentMaterialsToggle(true)}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      className={`pill wizard-jobtype-pill${!amendmentNeedsMaterials ? ' active' : ''}`}
                      onClick={() => handleAmendmentMaterialsToggle(false)}
                    >
                      No
                    </button>
                  </div>
                </div>
              ) : null}

              {showFullMaterialFlow ? (
                <>
                  <div className="stack gap-8">
                    <span className="input-label">Material Type</span>
                    <p className="text-sm text-muted wizard-helper-inline">Pick a fabric category, then select the exact material used for this job.</p>
                    {materialCategories.map((category) => {
                      const isOpen = openMaterialCategory === category.id

                      return (
                        <article key={category.id} className="card stack gap-8">
                          <button
                            type="button"
                            className="row-between wizard-material-category-btn"
                            onClick={() => setOpenMaterialCategory((prev) => (prev === category.id ? '' : category.id))}
                            aria-expanded={isOpen}
                          >
                            <h5>{category.title}</h5>
                            {isOpen ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
                          </button>

                          <AnimatePresence initial={false}>
                            {isOpen ? (
                              <motion.div
                                className="stack gap-8 wizard-collapsible"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                              >
                                {category.options.map((option) => (
                                  <button
                                    key={option.name}
                                    type="button"
                                    className={`wizard-material-option${materialType === option.name ? ' active' : ''}`}
                                    onClick={() => setMaterialType(option.name)}
                                  >
                                    <span className="wizard-material-title">{option.name}</span>
                                    <span className="wizard-material-description">{option.description}</span>
                                  </button>
                                ))}
                              </motion.div>
                            ) : null}
                          </AnimatePresence>
                        </article>
                      )
                    })}
                  </div>

                  {materialType === 'Other Material' ? (
                    <label className="input-group">
                      <span className="input-label">Custom Material</span>
                      <input
                        className="input"
                        value={customMaterialType}
                        onChange={(event) => setCustomMaterialType(event.target.value)}
                        placeholder="Type your custom material here..."
                      />
                    </label>
                  ) : null}

                  <div className="wizard-step2-two-col">
                    <label className="input-group">
                      <span className="input-label">Color</span>
                      <input className="input" value={materialColor} onChange={(event) => setMaterialColor(event.target.value)} placeholder="e.g. Navy Blue" />
                    </label>

                    <label className="input-group">
                      <span className="input-label">Total Yards</span>
                      <input className="input" value={materialYards} onChange={(event) => setMaterialYards(event.target.value)} placeholder="0" inputMode="decimal" />
                    </label>
                  </div>

                  <div className="input-group">
                    <span className="input-label">Material Quality</span>
                    <div className="wizard-quality-scroll">
                      {qualities.map((quality) => (
                        <button
                          key={quality}
                          type="button"
                          className={`pill${materialQuality === quality ? ' active' : ''}`}
                          onClick={() => setMaterialQuality(quality)}
                        >
                          {quality}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}

              {showAmendmentMaterialFlow ? (
                <>
                  <label className="input-group">
                    <span className="input-label">Material / Part Needed</span>
                    <input
                      className="input"
                      value={amendmentPartName}
                      onChange={(event) => {
                        setAmendmentPartName(event.target.value)
                        setMaterialType(event.target.value)
                      }}
                      placeholder="e.g. Zip, Button, Fabric patch"
                      list="amendment-part-options"
                    />
                    <datalist id="amendment-part-options">
                      {amendmentPartOptions.map((option) => (
                        <option key={option} value={option} />
                      ))}
                    </datalist>
                  </label>

                  <div className="wizard-step2-two-col">
                    <label className="input-group">
                      <span className="input-label">Color (optional)</span>
                      <input className="input" value={materialColor} onChange={(event) => setMaterialColor(event.target.value)} placeholder="e.g. Black" />
                    </label>

                    <label className="input-group">
                      <span className="input-label">Part Quantity</span>
                      <input
                        className="input"
                        value={amendmentPartQuantity}
                        onChange={(event) => setAmendmentPartQuantity(event.target.value)}
                        placeholder="0"
                        inputMode="numeric"
                      />
                    </label>
                  </div>
                </>
              ) : null}

              {(showFullMaterialFlow || showAmendmentMaterialFlow) ? (
                <div className="input-group">
                  <span className="input-label">Material Source</span>
                  <div className="wizard-source-grid">
                    {materialSources.map((source) => (
                      <button
                        key={source}
                        type="button"
                        className={`wizard-material-source-btn${materialSource === source ? ' active' : ''}`}
                        onClick={() => setMaterialSource(source)}
                      >
                        {source === 'Client is Providing Material' ? 'Client Provided' : 'I Am Getting It'}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {isAmendmentMode && !amendmentNeedsMaterials ? (
                <article className="card stack gap-6">
                  <p className="text-sm text-muted">No extra material selected for this amendment.</p>
                  <p className="text-sm text-muted">You can continue with pricing and labor costing.</p>
                </article>
              ) : null}

              <label className="input-group">
                <span className="input-label">How much are you charging the client?</span>
                <p className="text-sm text-muted">Enter the total agreed price. TailorDeck auto-formats in Naira.</p>
                <input
                  className="input"
                  value={formatNairaInput(chargeAmount)}
                  onChange={(event) => setChargeAmount(digitsOnly(event.target.value))}
                  placeholder="₦0"
                  inputMode="numeric"
                />
              </label>

              <label className="input-group">
                <span className="input-label">How many percent deposit are you collecting first?</span>
                <p className="text-sm text-muted">Set upfront percentage. Deposit and balance are calculated automatically.</p>
                <input
                  className="input"
                  value={formatPercentInput(depositPercent)}
                  onKeyDown={handleDepositPercentKeyDown}
                  onChange={(event) => {
                    const digits = digitsOnly(event.target.value)
                    if (!digits) {
                      setDepositPercent('')
                      return
                    }
                    setDepositPercent(String(Math.min(Number(digits), 100)))
                  }}
                  placeholder="0%"
                  inputMode="numeric"
                />
              </label>

              <div className="card stack gap-8">
                <div className="row-between">
                  <p className="text-sm text-muted">Deposit Percent</p>
                  <p className="font-semibold">{depositPercentValue}%</p>
                </div>
                <div className="row-between">
                  <p className="text-sm text-muted">Deposit to Collect Now</p>
                  <p className="font-semibold">{formatNaira(deposit)}</p>
                </div>
                <div className="row-between">
                  <p className="text-sm text-muted">Balance After Job Done</p>
                  <p className="font-semibold">{formatNaira(balance)}</p>
                </div>
              </div>

              <div className="input-group">
                <span className="input-label wizard-inline-label">Have a reference photo? Upload if available.</span>
                <label className="wizard-upload-box">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="wizard-upload-input"
                    onChange={(event) => handleReferencePhotoUpload(event.target.files)}
                  />
                  <div className="row gap-8">
                    <Upload size={18} className="text-muted" />
                    <span className="wizard-upload-title">Tap to Upload Reference Images</span>
                  </div>
                </label>
                {referencePhotoNames.length > 0 ? (
                  <div className="stack gap-4">
                    {referencePhotoNames.map((name) => (
                      <p key={name} className="text-sm text-muted">{name}</p>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="stack gap-12">
              <div className="stack gap-8">
                <p className="wizard-section-label">Expenses</p>
                <div className="wizard-expense-entry-row">
                  <input
                    className="input wizard-expense-name-input"
                    value={expenseDraftName}
                    onChange={(event) => setExpenseDraftName(event.target.value)}
                    placeholder="Expense name (e.g. Transport)"
                  />
                  <input
                    className="input wizard-expense-cost-input"
                    value={formatNairaInput(expenseDraftCost)}
                    onChange={(event) => setExpenseDraftCost(digitsOnly(event.target.value))}
                    placeholder="₦ Amount"
                    inputMode="numeric"
                  />
                  <button type="button" className="wizard-expense-add-btn" onClick={addExpense} aria-label="Add expense">
                    <Plus size={22} />
                  </button>
                </div>
              </div>

              {expenses.length > 0 ? (
                <div className="stack gap-8">
                  {expenses.map((expense) => (
                    <article key={expense.id} className="card row-between">
                      <div className="stack gap-4 min-w-0">
                        <p className="text-sm text-heading truncate">{expense.name}</p>
                        <p className="text-sm text-muted">{formatNaira(numericValue(expense.cost))}</p>
                      </div>
                      <button
                        type="button"
                        className="btn btn-ghost btn-icon text-danger"
                        onClick={() => removeExpense(expense.id)}
                        aria-label="Remove expense"
                      >
                        <Trash2 size={15} />
                      </button>
                    </article>
                  ))}
                </div>
              ) : null}

              <div className="card stack gap-10 wizard-costing-summary">
                <div className="row-between">
                  <p className="wizard-costing-label">Charge Amount</p>
                  <p className="wizard-costing-value">{formatNaira(charge)}</p>
                </div>
                <div className="row-between">
                  <p className="wizard-costing-label">Total Expenses</p>
                  <p className="wizard-costing-value wizard-costing-expense">- {formatNaira(totalExpenses)}</p>
                </div>
                <div className="divider" />
                <div className="row-between">
                  <p className="wizard-costing-profit-label">Estimated Profit</p>
                  <p className={projectedProfit >= 0 ? 'wizard-costing-profit-positive' : 'wizard-costing-profit-negative'}>
                    {formatNaira(projectedProfit)}
                  </p>
                </div>
              </div>

              <div className="input-group">
                <span className="wizard-section-label">Is this job worth it?</span>
                <div className="wizard-worth-grid">
                  <button
                    type="button"
                    className={`wizard-worth-btn${worthIt === 'Yes' ? ' active-yes' : ''}`}
                    onClick={() => setWorthIt('Yes')}
                  >
                    <Check size={16} />
                    Yes, proceed
                  </button>
                  <button
                    type="button"
                    className={`wizard-worth-btn danger${worthIt === 'No' ? ' active-no' : ''}`}
                    onClick={() => setWorthIt('No')}
                  >
                    <X size={16} />
                    Not worth it
                  </button>
                </div>
                {worthIt === 'No' ? (
                  <p className="text-sm text-danger">Consider revising price or reducing costs before finalizing.</p>
                ) : null}
              </div>
            </div>
          ) : null}

                    {step === 3 ? (
            <div className="stack gap-12">
              {!stepFourReviewMode ? (
                <>
                  <article className="card stack gap-8 wizard-deadline-checklist">
                    <h4>Delivery Checklist</h4>
                    <p className="text-sm text-muted">Balance due on delivery: <strong>{formatNaira(balance)}</strong></p>
                    <p className="text-sm text-muted">
                      Reminder set: <strong>{reminder === 'none' ? 'No reminder' : reminder}</strong>
                    </p>
                    <p className="text-sm text-muted">
                      Deadline readiness:{' '}
                      <strong className={deadlineDate ? 'text-success' : 'text-danger'}>
                        {deadlineDate ? 'Ready to proceed' : 'Select delivery date'}
                      </strong>
                    </p>
                  </article>

                  <label className="input-group">
                    <span className="wizard-section-label">Delivery Date *</span>
                    <div className="wizard-select-input-wrap">
                      <input className="input wizard-select-input" type="date" value={deadlineDate} onChange={(event) => setDeadlineDate(event.target.value)} />
                      <ChevronDown size={18} className="wizard-select-chevron" />
                    </div>
                  </label>

                  <label className="input-group">
                    <span className="wizard-section-label">Delivery Time</span>
                    <div className="wizard-select-input-wrap">
                      <input className="input wizard-select-input" type="time" value={deadlineTime} onChange={(event) => setDeadlineTime(event.target.value)} />
                      <ChevronDown size={18} className="wizard-select-chevron" />
                    </div>
                  </label>

                  <div className="input-group">
                    <span className="wizard-section-label">Remind me before deadline</span>
                    <div className="wizard-reminder-scroll">
                      {reminders.map((value) => (
                        <button
                          key={value}
                          type="button"
                          className={`pill${reminder === value ? ' active' : ''}`}
                          onClick={() => setReminder(value)}
                        >
                          {value === 'none' ? 'No reminder' : value}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="card stack gap-10">
                    <div className="row-between">
                      <h4>Job Details</h4>
                    </div>

                    <button
                      type="button"
                      className="row-between wizard-person-toggle"
                      onClick={() => setStepFourDetailsOpen((prev) => !prev)}
                      aria-expanded={stepFourDetailsOpen}
                    >
                      <h5>Review Summary</h5>
                      {stepFourDetailsOpen ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
                    </button>

                    <motion.div
                      className="stack gap-6 wizard-collapsible"
                      initial={false}
                      animate={{
                        height: stepFourDetailsOpen ? 'auto' : 0,
                        opacity: stepFourDetailsOpen ? 1 : 0,
                      }}
                      transition={{
                        height: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
                        opacity: { duration: 0.2, ease: 'easeOut' },
                      }}
                      style={{ pointerEvents: stepFourDetailsOpen ? 'auto' : 'none' }}
                    >
                      <ReviewRow icon={<UserRound size={15} className="text-primary" />} label="Client name" value={clientName || '-'} />
                      <ReviewRow icon={<Phone size={15} className="text-success" />} label="Client phone" value={clientPhone || '-'} />
                      <ReviewRow icon={<Wrench size={15} className="text-gold" />} label="Order mode" value={orderMode} />
                      <ReviewRow icon={<Shirt size={15} className="text-primary" />} label="Job type" value={makeCategory} />
                      <ReviewRow icon={<Layers size={15} className="text-success" />} label="Order scope" value={scopeLabel} />
                      <ReviewRow
                        icon={<Scissors size={15} className="text-primary" />}
                        label="Item type"
                        value={
                          makeCategory === 'Body Wear'
                            ? sameItemForAll
                              ? effectiveItemType || '-'
                              : persons
                                  .map((person) => `${person.name || 'Person'}: ${person.itemType || '-'}`)
                                  .join(', ')
                            : effectiveItemType || '-'
                        }
                      />
                      <ReviewRow
                        icon={<Ruler size={15} className="text-gold" />}
                        label="Measurement"
                        value={
                          isAmendmentMode
                            ? 'Amendment details captured'
                            : makeCategory === 'Body Wear'
                              ? `${persons.length} person profile(s) captured`
                              : `${selectedNonBodyFields.length} item dimension(s) captured`
                        }
                      />
                      <ReviewRow
                        icon={<FileText size={15} className="text-success" />}
                        label="Description"
                        value={
                          makeCategory === 'Body Wear'
                            ? persons
                                .filter((person) => person.description.trim())
                                .map((person) => `${person.name || 'Person'}: ${person.description}`)
                                .join(', ') || '-'
                            : nonBodyDescription || '-'
                        }
                      />
                      {isAmendmentMode ? (
                        <>
                          <ReviewRow icon={<Wrench size={15} className="text-danger" />} label="Amendment issue" value={amendmentIssueType || '-'} />
                          <ReviewRow icon={<ClipboardList size={15} className="text-gold" />} label="Affected area" value={amendmentArea || '-'} />
                          <ReviewRow icon={<Scissors size={15} className="text-primary" />} label="Target adjustment" value={amendmentTarget || '-'} />
                          <ReviewRow icon={<FileText size={15} className="text-success" />} label="Repair notes" value={amendmentDescription || '-'} />
                        </>
                      ) : null}
                      <ReviewRow icon={<Package size={15} className="text-primary" />} label="Material type" value={selectedMaterialValue || '-'} />
                      <ReviewRow icon={<Palette size={15} className="text-gold" />} label="Color" value={materialColor || '-'} />
                      <ReviewRow icon={<Ruler size={15} className="text-success" />} label="Total yard" value={materialYards || '0'} />
                      <ReviewRow icon={<ClipboardList size={15} className="text-primary" />} label="Material quality" value={materialQuality} />
                      <ReviewRow icon={<Truck size={15} className="text-gold" />} label="Material source" value={materialSource === 'Client is Providing Material' ? 'Client Provided' : 'I Am Getting It'} />
                      <ReviewRow icon={<Banknote size={15} className="text-primary" />} label="Charged amount" value={formatNaira(charge)} />
                      <ReviewRow icon={<Coins size={15} className="text-gold" />} label="Deposited collected" value={formatNaira(deposit)} />
                      <ReviewRow icon={<Images size={15} className="text-success" />} label="Reference photo" value={referencePhotoNames.length ? referencePhotoNames.join(', ') : '-'} />
                      <ReviewRow
                        icon={<ClipboardList size={15} className="text-primary" />}
                        label="Expenses list"
                        value={expenses.length ? expenses.map((expense) => `${expense.name} (${formatNaira(numericValue(expense.cost))})`).join(', ') : '-'}
                      />
                      <ReviewRow icon={<Banknote size={15} className="text-danger" />} label="Expenses cost" value={formatNaira(totalExpenses)} />
                      <ReviewRow
                        icon={<TrendingUp size={15} className={projectedProfit >= 0 ? 'text-success' : 'text-danger'} />}
                        label="Estimated profit"
                        value={formatNaira(projectedProfit)}
                        valueClassName={projectedProfit >= 0 ? 'text-success' : 'text-danger'}
                      />
                      <ReviewRow icon={<CalendarClock size={15} className="text-primary" />} label="Delivery date and time" value={`${deadlineDate || '-'} ${deadlineTime ? `at ${deadlineTime}` : ''}`} />
                    </motion.div>
                  </div>

                  {draftSaved ? <p className="text-sm text-success">Draft saved successfully.</p> : null}
                </>
              )}
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>

      <div className="wizard-footer">
        <div className="wizard-footer-inner">
          {step < 3 ? (
            <>
              <button type="button" className="btn btn-secondary flex-1" onClick={goBack}>
                {step === 0 ? 'Cancel' : 'Back'}
              </button>
              <button type="button" className="btn btn-primary flex-1" onClick={goNext}>
                <>
                  Next <ArrowRight size={16} />
                </>
              </button>
            </>
          ) : !stepFourReviewMode ? (
            <>
              <button type="button" className="btn btn-secondary flex-1" onClick={goBack}>
                Back
              </button>
              <button type="button" className="btn btn-primary flex-1" onClick={() => setStepFourReviewMode(true)}>
                Proceed to Review
              </button>
            </>
          ) : (
            <>
              <button type="button" className="btn btn-secondary flex-1" onClick={handleSaveDraft}>
                Save as Draft
              </button>
              <button type="button" className="btn btn-primary flex-1" onClick={handleFinalizeJob} disabled={isFinalizing}>
                {isFinalizing ? 'Finalizing...' : 'Confirm & Finalize Job'}
              </button>
            </>
          )}
        </div>
      </div>

      {isFinalizing ? (
        <div className="sheet-overlay wizard-loading-overlay">
          <div className="card stack gap-10 wizard-loading-card">
            <div className="wizard-spinner" />
            <p className="text-sm text-muted">Creating contract...</p>
          </div>
        </div>
      ) : null}
    </section>
  )
}

