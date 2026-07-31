import type { MaterialQuality, MeasurementUnit } from '../../lib/settingsTypes'
import type { DbJobStatus } from './commonRows'

export interface JobRow {
  id: string
  user_id: string
  client_id: string | null
  client_name: string
  client_phone: string | null
  client_phone_normalized: string | null
  title: string | null
  order_mode: 'New Stitch' | 'Amendment / Repair'
  make_category: 'Body Wear' | 'Non-Body Item'
  order_scope: 'Single' | 'Couple' | 'Family'
  same_item_for_all: boolean | null
  item_type: string | null
  description: string | null
  amendment_issue_type: string | null
  amendment_area: string | null
  amendment_target: string | null
  amendment_description: string | null
  amendment_needs_materials: boolean | null
  amendment_part_name: string | null
  amendment_part_quantity: string | null
  material_type: string | null
  material_color: string | null
  material_yards: number | null
  material_quality: MaterialQuality | null
  material_source: 'Client is Providing Material' | 'I Am Getting It' | null
  charge_amount_kobo: number
  deposit_percent: number | null
  deposit_amount_kobo: number
  balance_amount_kobo: number | null
  total_expenses_kobo: number
  profit_kobo: number | null
  is_worth_it: boolean | null
  deadline_date: string | null
  deadline_time: string | null
  reminder: '1 day before' | '3 days before' | '1 week before' | 'none'
  status: DbJobStatus
  completed_at: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface JobPersonRow {
  id: string
  user_id: string
  job_id: string
  client_id: string | null
  person_name: string
  name: string
  sex: 'Male' | 'Female' | 'Boy' | 'Girl'
  role: 'adult' | 'child'
  age: string | null
  item_type: string | null
  description: string | null
  is_primary: boolean
  measurement_kind: 'body' | 'non_body'
  quantity: number | null
  measurements: Record<string, number | string>
  measurement_unit: MeasurementUnit
  sort_order: number
  created_at: string
  updated_at: string
}

export interface JobExpenseRow {
  id: string
  user_id: string
  job_id: string
  name: string
  cost_amount_kobo: number
  created_at: string
  updated_at: string
}

export interface JobReferencePhotoRow {
  id: string
  user_id: string
  job_id: string
  storage_path: string
  signed_url?: string
  target_id: string | null
  target_label: string | null
  file_name: string | null
  mime_type: string | null
  size_bytes: number | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface JobWithRelations extends JobRow {
  job_expenses?: JobExpenseRow[]
  job_persons?: JobPersonRow[]
  job_reference_photos?: JobReferencePhotoRow[]
}
