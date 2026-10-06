import type { JobType, MakeCategory, MaterialQuality, MaterialSource, OrderMode, PersonSex, Reminder } from './newJobTypes'

export const stepLabels = [
  'Client Info & Measurements',
  'Materials / Parts',
  'Pricing / Costing & Expenses',
  'Deadline',
] as const

export const reminders: Reminder[] = ['none', 'custom', '1 day before', '3 days before', '1 week before']
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

// Body-wear items grouped by who usually wears them. Men/boys see men's + unisex items,
// women/girls see women's + unisex items, and a shared "same item for everyone" field sees all.
export const menWearItems = [
  'Agbada',
  'Kaftan',
  'Senator',
  'Buba & Sokoto',
  'Dashiki',
  'Jalabiya',
  'Waistcoat',
] as const

export const womenWearItems = [
  'Gown',
  'Wedding Gown',
  'Iro & Buba',
  'Bubu (Boubou)',
  'Skirt & Blouse',
  'Skirt',
  'Blouse',
  'Corset Dress',
  'Jumpsuit',
  'Wrapper',
] as const

export const unisexWearItems = [
  'T-shirt',
  'Shirt',
  '2-Piece (Up & Down)',
  'Suit Jacket',
  'Full Suit Set',
  'Trouser',
  'Shorts',
  'Jacket',
  'Hoodie',
] as const

export const bodyWearItems = [...menWearItems, ...womenWearItems, ...unisexWearItems] as const

export type ItemOptionGroup = { label?: string; items: readonly string[] }

export function getBodyWearGroups(sex?: PersonSex): ItemOptionGroup[] {
  const unisex = { label: 'Unisex', items: unisexWearItems }
  if (sex === 'Male' || sex === 'Boy') return [{ label: "Men's wear", items: menWearItems }, unisex]
  if (sex === 'Female' || sex === 'Girl') return [{ label: "Women's wear", items: womenWearItems }, unisex]
  return [{ label: "Men's wear", items: menWearItems }, { label: "Women's wear", items: womenWearItems }, unisex]
}

export const nonBodyItems = ['Bedcover', 'Blanket', 'Duvet', 'Pillow Case', 'Face Cap'] as const
