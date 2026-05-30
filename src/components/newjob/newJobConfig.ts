export type JobType = 'Single' | 'Couple' | 'Family'
export type PersonSex = 'Male' | 'Female' | 'Boy' | 'Girl'
export type MakeCategory = 'Body Wear' | 'Non-Body Item'
export type OrderMode = 'New Stitch' | 'Amendment / Repair'
export type Reminder = '1 day before' | '3 days before' | '1 week before' | 'none'
export type MaterialQuality = 'Normal' | 'Original' | 'Fake' | 'High Standard'
export type MaterialSource = 'Client is Providing Material' | 'I Am Getting It'

export type MaterialOption = {
  name: string
  description: string
}

export type MaterialCategory = {
  id: string
  title: string
  options: MaterialOption[]
}

export type PersonForm = {
  id: string
  name: string
  sex: PersonSex
  role: 'adult' | 'child'
  age: string
  itemType: string
  description: string
  measurements: Record<string, string>
}

export type ExpenseForm = {
  id: string
  name: string
  cost: string
}

export const stepLabels = [
  'Client Info & Measurements',
  'Materials / Parts & Pricing',
  'Costing / Expenses',
  'Deadline',
] as const

export const reminders: Reminder[] = ['1 day before', '3 days before', '1 week before', 'none']
export const qualities: MaterialQuality[] = ['Normal', 'Original', 'Fake', 'High Standard']
export const materialSources: MaterialSource[] = ['Client is Providing Material', 'I Am Getting It']
export const makeCategories: MakeCategory[] = ['Body Wear', 'Non-Body Item']
export const orderModes: OrderMode[] = ['New Stitch', 'Amendment / Repair']
export const scopeForBodyWear: JobType[] = ['Single', 'Couple', 'Family']
export const scopeForNonBody: JobType[] = ['Single']
export const amendmentIssueOptions = [
  'Resize / Tighten',
  'Loose / Expand',
  'Zip Replacement',
  'Patch / Repair Tear',
  'Shorten Length',
  'Adjust Sleeve',
  'Button Replacement',
  'Other',
] as const
export const amendmentPartOptions = ['Zip', 'Button', 'Lining', 'Thread', 'Fabric Patch', 'Hook', 'Elastic', 'Other'] as const
export const bodyWearItems = [
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
export const nonBodyItems = [
  'Bedcover',
  'Blanket',
  'Duvet',
  'Pillow Case',
  'Face Cap',
] as const
export const nonBodyMeasurementTemplate: Record<string, string[]> = {
  Bedcover: ['length', 'width', 'drop'],
  Blanket: ['length', 'width'],
  Duvet: ['length', 'width'],
  'Pillow Case': ['length', 'width'],
  'Face Cap': ['head_circumference', 'crown_height', 'brim_length'],
  Other: ['length', 'width', 'height'],
}

export const materialCategories: MaterialCategory[] = [
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

export const CHILD_FIELDS = ['chest', 'shoulder', 'sleeve', 'waist', 'hip', 'inseam', 'ankle']

export function labelFromField(field: string): string {
  return field
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function step1FieldsBySex(sex: PersonSex): string[] {
  if (sex === 'Female') return STEP1_FEMALE_FIELDS
  return STEP1_MALE_FIELDS
}

export function numericValue(value: string): number {
  const parsed = Number(value)
  if (Number.isNaN(parsed)) return 0
  return parsed
}

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

export function formatNairaInput(value: string): string {
  const digits = digitsOnly(value)
  if (!digits) return ''
  return `\u20A6${Number(digits).toLocaleString('en-NG')}`
}

export function formatPercentInput(value: string): string {
  const digits = digitsOnly(value)
  if (!digits) return ''
  const safe = Math.min(Number(digits), 100)
  return `${safe}%`
}

export function newPerson(overrides?: Partial<PersonForm>): PersonForm {
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

export function measurementNumbersToStrings(measurements: Record<string, number>): Record<string, string> {
  return Object.fromEntries(Object.entries(measurements).map(([field, value]) => [field, String(value)]))
}
