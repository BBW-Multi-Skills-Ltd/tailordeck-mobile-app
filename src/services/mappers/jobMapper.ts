import { toKobo, toNaira } from '../../lib/money'
import type { MockJob } from '../../types/job'
import { mapJobStatusFromDb } from './statusMapper'
import type { JobRow } from '../types'

export function mapJobRow(row: JobRow): MockJob {
  return {
    id: row.id,
    clientId: row.client_id ?? '',
    clientName: row.client_name,
    clientPhone: row.client_phone ?? '',
    title: row.title || row.item_type || 'Tailoring job',
    jobType: row.order_scope,
    chargeAmount: toNaira(row.charge_amount_kobo),
    status: mapJobStatusFromDb(row.status),
    deadlineDate: row.deadline_date ?? row.created_at.slice(0, 10),
    createdDate: row.created_at.slice(0, 10),
  }
}

export function mapJobCreateMoney(input: { chargeAmount: number; depositPercent: number }) {
  const chargeAmountKobo = toKobo(input.chargeAmount)
  const depositAmountKobo = Math.round(chargeAmountKobo * (input.depositPercent / 100))
  return {
    charge_amount_kobo: chargeAmountKobo,
    deposit_percent: input.depositPercent,
    deposit_amount_kobo: depositAmountKobo,
  }
}
