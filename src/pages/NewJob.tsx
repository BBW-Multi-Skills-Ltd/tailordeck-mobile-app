import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Plus, Trash2, Upload, UserRound } from 'lucide-react'
import { useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatNaira } from '../lib/utils'

type JobType = 'Single' | 'Couple' | 'Family'
type PersonSex = 'Male' | 'Female' | 'Boy' | 'Girl'
type MakeCategory = 'Body Wear' | 'Non-Body Item'
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
  measurements: Record<string, string>
}

type ExpenseForm = {
  id: string
  name: string
  cost: string
}

const stepLabels = [
  'Client Info & Measurements',
  'Material & Pricing',
  'Costing / Expenses',
  'Deadline & Draft Review',
] as const

const reminders: Reminder[] = ['1 day before', '3 days before', '1 week before', 'none']
const qualities: MaterialQuality[] = ['Normal', 'Original', 'Fake', 'High Standard']
const materialSources: MaterialSource[] = ['Client is Providing Material', 'I Am Getting It']
const makeCategories: MakeCategory[] = ['Body Wear', 'Non-Body Item']
const scopeForBodyWear: JobType[] = ['Single', 'Couple', 'Family']
const scopeForNonBody: JobType[] = ['Single']
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
  'Other',
] as const
const nonBodyItems = [
  'Bedcover',
  'Blanket',
  'Duvet',
  'Pillow Case',
  'Face Cap',
  'Other',
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
  return `₦${Number(digits).toLocaleString('en-NG')}`
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
    measurements: {},
    ...overrides,
  }
}

function ensurePersonsForJobType(jobType: JobType, prevPersons: PersonForm[], clientName: string): PersonForm[] {
  if (jobType === 'Single') {
    const existing = prevPersons[0]
    return [
      existing
        ? { ...existing, name: existing.name || clientName, role: 'adult', sex: existing.sex === 'Boy' || existing.sex === 'Girl' ? 'Female' : existing.sex }
        : newPerson({ name: clientName, sex: 'Female', role: 'adult' }),
    ]
  }

  if (jobType === 'Couple') {
    const first = prevPersons[0] ?? newPerson({ name: clientName || 'Person 1', sex: 'Male', role: 'adult' })
    const second = prevPersons[1] ?? newPerson({ name: 'Person 2', sex: 'Female', role: 'adult' })
    return [
      { ...first, role: 'adult', sex: first.sex === 'Boy' || first.sex === 'Girl' ? 'Male' : first.sex },
      { ...second, role: 'adult', sex: second.sex === 'Boy' || second.sex === 'Girl' ? 'Female' : second.sex },
    ]
  }

  const adults = prevPersons.filter((person) => person.role === 'adult')
  const children = prevPersons.filter((person) => person.role === 'child')
  const firstAdult = adults[0] ?? newPerson({ name: clientName || 'Adult 1', sex: 'Male', role: 'adult' })
  const secondAdult = adults[1] ?? newPerson({ name: 'Adult 2', sex: 'Female', role: 'adult' })
  const extraAdults = adults.slice(2).map((adult, index) => ({
    ...adult,
    role: 'adult' as const,
    sex: adult.sex === 'Boy' || adult.sex === 'Girl' ? (index % 2 === 0 ? 'Male' : 'Female') : adult.sex,
  }))

  return [
    { ...firstAdult, role: 'adult', sex: firstAdult.sex === 'Boy' || firstAdult.sex === 'Girl' ? 'Male' : firstAdult.sex },
    { ...secondAdult, role: 'adult', sex: secondAdult.sex === 'Boy' || secondAdult.sex === 'Girl' ? 'Female' : secondAdult.sex },
    ...extraAdults,
    ...children,
  ]
}

export default function NewJob() {
  const navigate = useNavigate()
  const sectionRef = useRef<HTMLElement | null>(null)

  const [step, setStep] = useState(0)
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [makeCategory, setMakeCategory] = useState<MakeCategory>('Body Wear')
  const [itemType, setItemType] = useState<string>(bodyWearItems[0])
  const [customItemType, setCustomItemType] = useState('')
  const [jobType, setJobType] = useState<JobType>('Single')
  const [persons, setPersons] = useState<PersonForm[]>([newPerson({ sex: 'Female', role: 'adult' })])
  const [nonBodyMeasurements, setNonBodyMeasurements] = useState<Record<string, string>>({})
  const [nonBodyQuantity, setNonBodyQuantity] = useState('1')

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

  const [expenses, setExpenses] = useState<ExpenseForm[]>([{ id: 'ex-1', name: '', cost: '' }])
  const [worthIt, setWorthIt] = useState<'Yes' | 'No'>('Yes')

  const [deadlineDate, setDeadlineDate] = useState('')
  const [deadlineTime, setDeadlineTime] = useState('')
  const [reminder, setReminder] = useState<Reminder>('1 day before')
  const [draftReady, setDraftReady] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [singleMeasurementsOpen, setSingleMeasurementsOpen] = useState(true)
  const [stepOneMeasurementsOpen, setStepOneMeasurementsOpen] = useState<Record<string, boolean>>({})

  const charge = numericValue(chargeAmount)
  const depositPercentValue = Math.max(Math.min(numericValue(depositPercent), 100), 0)
  const deposit = Math.round((charge * depositPercentValue) / 100)
  const balance = Math.max(charge - deposit, 0)
  const totalExpenses = expenses.reduce((sum, item) => sum + numericValue(item.cost), 0)
  const projectedProfit = charge - totalExpenses
  const selectedNonBodyFields = nonBodyMeasurementTemplate[itemType] ?? nonBodyMeasurementTemplate.Other
  const selectedMaterialValue = materialType === 'Other Material' ? customMaterialType : materialType

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
      setItemType(bodyWearItems[0])
      setJobType('Single')
      setPersons((prev) => ensurePersonsForJobType('Single', prev, clientName))
      return
    }

    setItemType(nonBodyItems[0])
    setJobType('Single')
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

  function addChild(): void {
    setPersons((prev) => [...prev, newPerson({ name: `Child ${prev.filter((p) => p.role === 'child').length + 1}`, sex: 'Boy', role: 'child' })])
  }

  function addAdult(): void {
    const nextAdultNumber = persons.filter((person) => person.role === 'adult').length + 1
    const nextSex: PersonSex = nextAdultNumber % 2 === 0 ? 'Female' : 'Male'
    setPersons((prev) => [...prev, newPerson({ name: `Adult ${nextAdultNumber}`, sex: nextSex, role: 'adult' })])
  }

  function removePerson(personId: string): void {
    setPersons((prev) => prev.filter((person) => person.id !== personId))
  }

  function addExpense(): void {
    setExpenses((prev) => [...prev, { id: `ex-${Date.now()}-${Math.floor(Math.random() * 1000)}`, name: '', cost: '' }])
  }

  function updateExpense(expenseId: string, field: 'name' | 'cost', value: string): void {
    setExpenses((prev) => prev.map((expense) => (expense.id === expenseId ? { ...expense, [field]: value } : expense)))
  }

  function removeExpense(expenseId: string): void {
    setExpenses((prev) => (prev.length <= 1 ? prev : prev.filter((expense) => expense.id !== expenseId)))
  }

  function toggleStepOneMeasurements(personId: string): void {
    setStepOneMeasurementsOpen((prev) => ({
      ...prev,
      [personId]: !(prev[personId] ?? true),
    }))
  }

  function goBack(): void {
    if (step > 0) {
      setStep((prev) => prev - 1)
      return
    }

    const confirmed = window.confirm('Discard this new job and return to Jobs?')
    if (confirmed) navigate('/jobs')
  }

  function goNext(): void {
    if (step === 3) {
      if (!draftReady) {
        setDraftReady(true)
        return
      }

      setSuccessOpen(true)
      return
    }

    setStep((prev) => Math.min(prev + 1, stepLabels.length - 1))
  }

  return (
    <section ref={sectionRef} className="section stack gap-16 wizard-page">
      <div className="row-between">
        <button type="button" className="btn btn-ghost btn-icon" onClick={goBack} aria-label="Back">
          <ArrowLeft size={18} />
        </button>
        <h2>New Job</h2>
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
                />
              </label>

              <div className="input-group">
                <span className="input-label">What are you making?</span>
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

              <label className="input-group">
                <span className="input-label">Item Type</span>
                <select
                  className="input"
                  value={itemType}
                  onChange={(event) => setItemType(event.target.value)}
                >
                  {(makeCategory === 'Body Wear' ? bodyWearItems : nonBodyItems).map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              {itemType === 'Other' ? (
                <label className="input-group">
                  <span className="input-label">Custom Item Name</span>
                  <input
                    className="input"
                    value={customItemType}
                    onChange={(event) => setCustomItemType(event.target.value)}
                    placeholder="Enter custom item"
                  />
                </label>
              ) : null}

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

              {makeCategory === 'Body Wear' && jobType === 'Single' ? (
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
                          <h5>Person 1</h5>
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
                    </motion.div>
                  </article>
                </div>
              ) : null}

              {makeCategory === 'Body Wear' && jobType === 'Couple' ? (
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
                              <h5>Person {index + 1}</h5>
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
                        </motion.div>
                      </article>
                    )
                  })}
                </div>
              ) : null}

              {makeCategory === 'Body Wear' && jobType === 'Family' ? (
                <div className="stack gap-8 wizard-step1-measurements">
                  <p className="input-label">Measurements</p>

                  {persons.map((person, index) => {
                    const isOpen = stepOneMeasurementsOpen[person.id] ?? true
                    const adultIndex = persons.filter((p, i) => p.role === 'adult' && i <= index).length
                    const personLabel = person.role === 'adult' ? `Adult ${adultIndex}` : person.name || 'Child'
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

              {makeCategory === 'Non-Body Item' ? (
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
                  </article>
                </div>
              ) : null}
            </div>
          ) : null}

          {step === 1 ? (
            <div className="stack gap-12">
              <div className="stack gap-8">
                <span className="input-label">Material Type</span>
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

              <label className="input-group">
                <span className="input-label">How much are you charging the client?</span>
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
              <div className="row-between">
                <h4>Expenses</h4>
                <button type="button" className="btn btn-secondary btn-sm" onClick={addExpense}>
                  <Plus size={14} />
                  Add Expense
                </button>
              </div>

              {expenses.map((expense, index) => (
                <article key={expense.id} className="card stack gap-10">
                  <div className="row-between">
                    <h5>Expense {index + 1}</h5>
                    <button
                      type="button"
                      className="btn btn-ghost btn-icon"
                      onClick={() => removeExpense(expense.id)}
                      aria-label="Remove expense"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <label className="input-group">
                    <span className="input-label">Name</span>
                    <input
                      className="input"
                      value={expense.name}
                      onChange={(event) => updateExpense(expense.id, 'name', event.target.value)}
                      placeholder="Transport, Buttons..."
                    />
                  </label>

                  <label className="input-group">
                    <span className="input-label">Cost</span>
                    <input
                      className="input"
                      value={expense.cost}
                      onChange={(event) => updateExpense(expense.id, 'cost', event.target.value)}
                      placeholder="0"
                      inputMode="numeric"
                    />
                  </label>
                </article>
              ))}

              <div className="card stack gap-8">
                <div className="row-between">
                  <p className="text-sm text-muted">Total Charge</p>
                  <p className="font-semibold">{formatNaira(charge)}</p>
                </div>
                <div className="row-between">
                  <p className="text-sm text-muted">Total Expenses</p>
                  <p className="font-semibold">{formatNaira(totalExpenses)}</p>
                </div>
                <div className="row-between">
                  <p className="text-sm text-muted">Projected Profit</p>
                  <p className={projectedProfit >= 0 ? 'profit-positive' : 'profit-negative'}>{formatNaira(projectedProfit)}</p>
                </div>
              </div>

              <div className="input-group">
                <span className="input-label">Is this job worth it?</span>
                <div className="pill-group">
                  {(['Yes', 'No'] as const).map((value) => (
                    <button
                      type="button"
                      key={value}
                      className={`pill${worthIt === value ? ' active' : ''}`}
                      onClick={() => setWorthIt(value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
                {worthIt === 'No' ? (
                  <p className="text-sm text-danger">Consider revising price or reducing costs before finalizing.</p>
                ) : null}
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="stack gap-12">
              <label className="input-group">
                <span className="input-label">Delivery Date</span>
                <input className="input" type="date" value={deadlineDate} onChange={(event) => setDeadlineDate(event.target.value)} />
              </label>

              <label className="input-group">
                <span className="input-label">Delivery Time (optional)</span>
                <input className="input" type="time" value={deadlineTime} onChange={(event) => setDeadlineTime(event.target.value)} />
              </label>

              <div className="input-group">
                <span className="input-label">Reminder</span>
                <div className="pill-group">
                  {reminders.map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={`pill${reminder === value ? ' active' : ''}`}
                      onClick={() => setReminder(value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              {!draftReady ? (
                <div className="card stack gap-8">
                  <h4>Auto Draft Mode</h4>
                  <p className="text-sm text-muted">
                    Generate a draft summary before final submission. You can review and edit before finalizing this job.
                  </p>
                </div>
              ) : (
                <div className="card stack gap-10">
                  <div className="row-between">
                    <h4>Draft Summary</h4>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setDraftReady(false)}>
                      Edit
                    </button>
                  </div>
                  <p className="text-sm text-muted">Client: {clientName || 'Not set'}</p>
                  <p className="text-sm text-muted">Category: {makeCategory}</p>
                  <p className="text-sm text-muted">Item: {(itemType === 'Other' ? customItemType : itemType) || 'Not set'}</p>
                  <p className="text-sm text-muted">Order Scope: {jobType}</p>
                  <p className="text-sm text-muted">
                    {makeCategory === 'Body Wear' ? `Persons: ${persons.length}` : `Quantity: ${nonBodyQuantity || '1'}`}
                  </p>
                  <p className="text-sm text-muted">Material: {selectedMaterialValue || 'Not set'}</p>
                  <p className="text-sm text-muted">Charge: {formatNaira(charge)}</p>
                  <p className="text-sm text-muted">Deposit Now: {formatNaira(deposit)}</p>
                  <p className="text-sm text-muted">Balance: {formatNaira(balance)}</p>
                  <p className="text-sm text-muted">Expenses: {formatNaira(totalExpenses)}</p>
                  <p className="text-sm text-muted">Profit: {formatNaira(projectedProfit)}</p>
                  <p className="text-sm text-muted">Deadline: {deadlineDate || 'Not set'} {deadlineTime ? `at ${deadlineTime}` : ''}</p>
                </div>
              )}
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>

      <div className="wizard-footer">
        <div className="wizard-footer-inner">
          <button type="button" className="btn btn-secondary flex-1" onClick={goBack}>
            {step === 0 ? 'Cancel' : 'Back'}
          </button>
          <button type="button" className="btn btn-primary flex-1" onClick={goNext}>
            {step < 3 ? (
              <>
                Next <ArrowRight size={16} />
              </>
            ) : draftReady ? (
              'Finalize Job'
            ) : (
              'Generate Draft Summary'
            )}
          </button>
        </div>
      </div>

      {successOpen ? (
        <div className="sheet-overlay">
          <div className="sheet p-16 stack gap-12" style={{ borderRadius: '24px 24px 0 0' }}>
            <h2>Job Saved</h2>
            <p className="text-sm text-muted">Draft reviewed and job finalized successfully.</p>
            <button type="button" className="btn btn-primary btn-full" onClick={() => navigate('/jobs')}>
              Go to Jobs
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
