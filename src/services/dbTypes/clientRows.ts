import type { MeasurementUnit } from '../../lib/settingsTypes'
import type { ClientSex } from '../../types/client'

export interface ClientRow {
  id: string
  user_id: string
  name: string
  phone: string
  phone_normalized: string | null
  sex: ClientSex
  measurement_unit: MeasurementUnit
  last_job_date: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}
