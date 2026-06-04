import type { Client } from '../../types/client'
import type { ClientRow } from '../types'

export function mapClientRow(row: ClientRow): Client {
  return {
    id: row.id,
    created_date: row.created_at,
    updated_date: row.updated_at,
    created_by: row.user_id,
    name: row.name,
    phone: row.phone,
    sex: row.sex,
    measurement_unit: row.measurement_unit,
    last_job_date: row.last_job_date ?? row.updated_at.slice(0, 10),
    measurements: {},
  }
}
