import { toKobo } from '../../lib/money'
import { normalizeNigerianPhone } from '../../lib/phone'
import { mapJobCreateMoney } from '../mappers/jobMapper'
import { mapJobStatusToDb } from '../mappers/statusMapper'
import type { CreateFullJobInput, CreateJobInput } from './jobServiceTypes'

export function buildJobRow(input: CreateJobInput, userId: string) {
  return {
    user_id: userId,
    client_id: input.clientId ?? null,
    client_name: input.clientName.trim(),
    client_phone: input.clientPhone.trim(),
    client_phone_normalized: normalizeNigerianPhone(input.clientPhone),
    title: input.title.trim(),
    order_mode: input.orderMode,
    make_category: input.makeCategory,
    order_scope: input.orderScope,
    item_type: input.itemType.trim(),
    description: input.description?.trim() || null,
    ...mapJobCreateMoney({ chargeAmount: input.chargeAmount, depositPercent: input.depositPercent }),
    deadline_date: input.deadlineDate || null,
    deadline_time: input.deadlineTime || null,
    reminder: input.reminder,
    status: mapJobStatusToDb(input.status ?? 'Pending'),
  }
}

export function buildFullJobRow(input: CreateFullJobInput, userId: string, clientId: string | null) {
  return {
    ...buildJobRow({ ...input, clientId }, userId),
    same_item_for_all: input.sameItemForAll,
    amendment_issue_type: input.amendmentIssueType?.trim() || null,
    amendment_area: input.amendmentArea?.trim() || null,
    amendment_target: input.amendmentTarget?.trim() || null,
    amendment_description: input.amendmentDescription?.trim() || null,
    amendment_needs_materials: input.amendmentNeedsMaterials ?? false,
    amendment_part_name: input.amendmentPartName?.trim() || null,
    amendment_part_quantity: input.amendmentPartQuantity?.trim() || null,
    material_type: input.materialType?.trim() || null,
    material_color: input.materialColor?.trim() || null,
    material_yards: input.materialYards ?? null,
    material_quality: input.materialQuality ?? null,
    material_source: input.materialSource ?? null,
    total_expenses_kobo: toKobo(input.totalExpenses),
    is_worth_it: input.isWorthIt,
  }
}
