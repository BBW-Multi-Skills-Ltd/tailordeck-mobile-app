import type { JobType, MakeCategory, MaterialQuality, MaterialSource, OrderMode, Reminder } from './newJobTypes'

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

export const nonBodyItems = ['Bedcover', 'Blanket', 'Duvet', 'Pillow Case', 'Face Cap'] as const

