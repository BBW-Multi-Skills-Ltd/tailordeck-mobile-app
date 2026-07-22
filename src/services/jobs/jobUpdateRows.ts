import { normalizeNigerianPhone } from '../../lib/phone'
import { mapJobCreateMoney } from '../mappers/jobMapper'
import { mapJobStatusToDb } from '../mappers/statusMapper'
import type { CreateJobInput } from './jobServiceTypes'

export function buildJobUpdateRow(updates: Partial<CreateJobInput>): Record<string, unknown> {
  return {
    ...(updates.clientName ? { client_name: updates.clientName.trim() } : {}),
    ...(updates.clientPhone ? { client_phone: updates.clientPhone.trim(), client_phone_normalized: normalizeNigerianPhone(updates.clientPhone) } : {}),
    ...(updates.title ? { title: updates.title.trim() } : {}),
    ...(updates.orderMode ? { order_mode: updates.orderMode } : {}),
    ...(updates.makeCategory ? { make_category: updates.makeCategory } : {}),
    ...(updates.orderScope ? { order_scope: updates.orderScope } : {}),
    ...(updates.itemType ? { item_type: updates.itemType.trim() } : {}),
    ...(updates.description !== undefined ? { description: updates.description?.trim() || null } : {}),
    ...(updates.chargeAmount !== undefined || updates.depositPercent !== undefined
      ? mapJobCreateMoney({ chargeAmount: updates.chargeAmount ?? 0, depositPercent: updates.depositPercent ?? 0 })
      : {}),
    ...(updates.deadlineDate !== undefined ? { deadline_date: updates.deadlineDate || null } : {}),
    ...(updates.deadlineTime !== undefined ? { deadline_time: updates.deadlineTime || null } : {}),
    ...(updates.reminder ? { reminder: updates.reminder } : {}),
    ...(updates.status ? { status: mapJobStatusToDb(updates.status) } : {}),
    updated_at: new Date().toISOString(),
  }
}
