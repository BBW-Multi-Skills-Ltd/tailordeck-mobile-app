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
