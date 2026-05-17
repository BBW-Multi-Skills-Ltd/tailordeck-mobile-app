import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Plus, Trash2, UserRound } from 'lucide-react'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatNaira } from '../lib/utils'

type JobType = 'Single' | 'Couple' | 'Family'
type PersonSex = 'Male' | 'Female' | 'Boy' | 'Girl'
type Reminder = '1 day before' | '3 days before' | '1 week before' | 'none'
type MaterialQuality = 'Normal' | 'Original' | 'Fake' | 'High Standard'
type MaterialSource = 'Client Provided' | 'I Am Getting It'

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
  'Client Info',
  'Persons & Measurements',
  'Material & Pricing',
  'Costing / Expenses',
  'Deadline & Draft Review',
] as const

const reminders: Reminder[] = ['1 day before', '3 days before', '1 week before', 'none']
const qualities: MaterialQuality[] = ['Normal', 'Original', 'Fake', 'High Standard']
const materialSources: MaterialSource[] = ['Client Provided', 'I Am Getting It']
const STEP1_MALE_FIELDS = ['chest', 'waist', 'shoulder', 'hip', 'inseam', 'sleeve', 'neck', 'thigh']
const STEP1_FEMALE_FIELDS = ['chest', 'bust', 'waist', 'shoulder', 'hip', 'sleeve', 'neck', 'thigh']

const MALE_FIELDS = ['chest', 'shoulder', 'sleeve', 'waist', 'hip', 'thigh', 'inseam', 'ankle', 'neck', 'head']
const FEMALE_FIELDS = ['bust', 'shoulder', 'sleeve', 'waist', 'hip', 'thigh', 'inseam', 'ankle', 'neck', 'head']
const CHILD_FIELDS = ['chest', 'shoulder', 'sleeve', 'waist', 'hip', 'inseam', 'ankle']

function labelFromField(field: string): string {
  return field.charAt(0).toUpperCase() + field.slice(1)
}

function fieldsBySex(sex: PersonSex): string[] {
  if (sex === 'Female') return FEMALE_FIELDS
  if (sex === 'Boy' || sex === 'Girl') return CHILD_FIELDS
  return MALE_FIELDS
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

  return [
    { ...firstAdult, role: 'adult', sex: firstAdult.sex === 'Boy' || firstAdult.sex === 'Girl' ? 'Male' : firstAdult.sex },
    { ...secondAdult, role: 'adult', sex: secondAdult.sex === 'Boy' || secondAdult.sex === 'Girl' ? 'Female' : secondAdult.sex },
    ...children,
  ]
}

export default function NewJob() {
  const navigate = useNavigate()
  const sectionRef = useRef<HTMLElement | null>(null)

  const [step, setStep] = useState(0)
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [jobType, setJobType] = useState<JobType>('Single')
  const [persons, setPersons] = useState<PersonForm[]>([newPerson({ sex: 'Female', role: 'adult' })])

  const [materialType, setMaterialType] = useState('')
  const [materialColor, setMaterialColor] = useState('')
  const [materialYards, setMaterialYards] = useState('')
  const [materialQuality, setMaterialQuality] = useState<MaterialQuality>('Normal')
  const [materialSource, setMaterialSource] = useState<MaterialSource>('Client Provided')
  const [chargeAmount, setChargeAmount] = useState('')
  const [depositAmount, setDepositAmount] = useState('')

  const [expenses, setExpenses] = useState<ExpenseForm[]>([{ id: 'ex-1', name: '', cost: '' }])
  const [worthIt, setWorthIt] = useState<'Yes' | 'No'>('Yes')

  const [deadlineDate, setDeadlineDate] = useState('')
  const [deadlineTime, setDeadlineTime] = useState('')
  const [reminder, setReminder] = useState<Reminder>('1 day before')
  const [draftReady, setDraftReady] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [singleMeasurementsOpen, setSingleMeasurementsOpen] = useState(true)

  const charge = numericValue(chargeAmount)
  const deposit = numericValue(depositAmount)
  const balance = Math.max(charge - deposit, 0)
  const totalExpenses = expenses.reduce((sum, item) => sum + numericValue(item.cost), 0)
  const projectedProfit = charge - totalExpenses

  function handleClientNameChange(value: string): void {
    setClientName(value)
    setPersons((prev) => ensurePersonsForJobType(jobType, prev, value))
  }

  function handleJobTypeChange(nextType: JobType): void {
    setJobType(nextType)
    setPersons((prev) => ensurePersonsForJobType(nextType, prev, clientName))
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

  function goBack(): void {
    if (step > 0) {
      setStep((prev) => prev - 1)
      return
    }

    const confirmed = window.confirm('Discard this new job and return to Jobs?')
    if (confirmed) navigate('/jobs')
  }

  function goNext(): void {
    if (step === 4) {
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
                <span className="input-label">Job Type</span>
                <div className="wizard-jobtype-group">
                  {(['Single', 'Couple', 'Family'] as const).map((type) => (
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

              {jobType === 'Single' ? (
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

                    {singleMeasurementsOpen ? (
                      <>
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
                      </>
                    ) : null}
                  </article>
                </div>
              ) : null}
            </div>
          ) : null}

          {step === 1 ? (
            <div className="stack gap-12">
              <div className="row-between">
                <h4>Persons</h4>
                {jobType === 'Family' ? (
                  <button type="button" className="btn btn-secondary btn-sm" onClick={addChild}>
                    <Plus size={14} />
                    Add Child
                  </button>
                ) : null}
              </div>

              {persons.map((person, index) => (
                <article key={person.id} className="card stack gap-12">
                  <div className="row-between">
                    <h5>Person {index + 1}</h5>
                    {jobType === 'Family' && person.role === 'child' ? (
                      <button type="button" className="btn btn-ghost btn-icon" onClick={() => removePerson(person.id)} aria-label="Remove child">
                        <Trash2 size={16} />
                      </button>
                    ) : null}
                  </div>

                  <label className="input-group">
                    <span className="input-label">Name</span>
                    <input
                      className="input"
                      value={person.name}
                      onChange={(event) => updatePerson(person.id, (p) => ({ ...p, name: event.target.value }))}
                      placeholder="Person name"
                    />
                  </label>

                  <div className="input-group">
                    <span className="input-label">Sex</span>
                    <div className="pill-group">
                      {(['Male', 'Female', 'Boy', 'Girl'] as const).map((sex) => (
                        <button
                          key={sex}
                          type="button"
                          className={`pill${person.sex === sex ? ' active' : ''}`}
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

                  <div className="stack gap-10">
                    {fieldsBySex(person.sex).map((field) => (
                      <label className="input-group" key={`${person.id}-${field}`}>
                        <span className="input-label">{labelFromField(field)}</span>
                        <input
                          className="input"
                          value={person.measurements[field] ?? ''}
                          onChange={(event) => updatePersonMeasurement(person.id, field, event.target.value)}
                          placeholder={`Enter ${field}`}
                          inputMode="decimal"
                        />
                      </label>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          ) : null}

          {step === 2 ? (
            <div className="stack gap-12">
              <label className="input-group">
                <span className="input-label">Material Type</span>
                <input className="input" value={materialType} onChange={(event) => setMaterialType(event.target.value)} placeholder="Ankara, Lace..." />
              </label>

              <label className="input-group">
                <span className="input-label">Color</span>
                <input className="input" value={materialColor} onChange={(event) => setMaterialColor(event.target.value)} placeholder="Wine, Navy..." />
              </label>

              <label className="input-group">
                <span className="input-label">Total Yards</span>
                <input className="input" value={materialYards} onChange={(event) => setMaterialYards(event.target.value)} placeholder="0" inputMode="decimal" />
              </label>

              <div className="input-group">
                <span className="input-label">Material Quality</span>
                <div className="pill-group">
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
                <div className="pill-group">
                  {materialSources.map((source) => (
                    <button
                      key={source}
                      type="button"
                      className={`pill${materialSource === source ? ' active' : ''}`}
                      onClick={() => setMaterialSource(source)}
                    >
                      {source}
                    </button>
                  ))}
                </div>
              </div>

              <label className="input-group">
                <span className="input-label">Charge Amount</span>
                <input className="input" value={chargeAmount} onChange={(event) => setChargeAmount(event.target.value)} placeholder="0" inputMode="numeric" />
              </label>

              <label className="input-group">
                <span className="input-label">Deposit Collected</span>
                <input className="input" value={depositAmount} onChange={(event) => setDepositAmount(event.target.value)} placeholder="0" inputMode="numeric" />
              </label>

              {deposit > 0 ? (
                <div className="card" style={{ background: 'var(--success-bg)' }}>
                  <p className="text-sm">
                    Balance left to collect on delivery: <strong>{formatNaira(balance)}</strong>
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}

          {step === 3 ? (
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

          {step === 4 ? (
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
                  <p className="text-sm text-muted">Job Type: {jobType}</p>
                  <p className="text-sm text-muted">Persons: {persons.length}</p>
                  <p className="text-sm text-muted">Charge: {formatNaira(charge)}</p>
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
            {step < 4 ? (
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
