import { normalizeNigerianPhone } from '../lib/phone'
import type { MockJob, JobStatus } from '../types/job'
import { supabase } from '../lib/supabase'
import { mapJobCreateMoney, mapJobRow } from './mappers/jobMapper'
import { mapJobStatusToDb } from './mappers/statusMapper'
import type { JobRow, JobWithRelations } from './types'
import { requireUserId } from './serviceHelpers'

export interface CreateJobInput {
  clientId?: string | null
  clientName: string
  clientPhone: string
  title: string
  orderMode: JobRow['order_mode']
  makeCategory: JobRow['make_category']
  orderScope: JobRow['order_scope']
  itemType: string
  description?: string
  chargeAmount: number
  depositPercent: number
  deadlineDate?: string
  deadlineTime?: string
  reminder: JobRow['reminder']
  status?: JobStatus
}

function buildJobRow(input: CreateJobInput, userId: string) {
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

export async function getJobs(status?: JobStatus): Promise<MockJob[]> {
  const userId = await requireUserId()
  let query = supabase.from('jobs').select('*').eq('user_id', userId).is('deleted_at', null).order('created_at', { ascending: false })
  if (status) query = query.eq('status', mapJobStatusToDb(status))
  const { data, error } = await query.returns<JobRow[]>()
  if (error) throw error
  return (data ?? []).map(mapJobRow)
}

export async function getJob(id: string): Promise<JobWithRelations | null> {
  const userId = await requireUserId()
  const { data, error } = await supabase
    .from('jobs')
    .select('*, job_expenses(*), job_persons(*), job_reference_photos(*)')
    .eq('user_id', userId)
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle<JobWithRelations>()
  if (error) throw error
  return data
}

export async function createJob(input: CreateJobInput): Promise<MockJob> {
  const userId = await requireUserId()
  const { data, error } = await supabase.from('jobs').insert(buildJobRow(input, userId)).select('*').single<JobRow>()
  if (error) throw error
  return mapJobRow(data)
}

export async function updateJob(id: string, updates: Partial<CreateJobInput>): Promise<MockJob> {
  const userId = await requireUserId()
  const row = {
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
  const { data, error } = await supabase.from('jobs').update(row).eq('user_id', userId).eq('id', id).select('*').single<JobRow>()
  if (error) throw error
  return mapJobRow(data)
}

export async function updateJobStatus(id: string, status: JobStatus): Promise<MockJob> {
  const userId = await requireUserId()
  const { data, error } = await supabase
    .from('jobs')
    .update({ status: mapJobStatusToDb(status), updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('id', id)
    .select('*')
    .single<JobRow>()
  if (error) throw error
  return mapJobRow(data)
}

export async function softDeleteJob(id: string): Promise<void> {
  const userId = await requireUserId()
  const { error } = await supabase.from('jobs').update({ deleted_at: new Date().toISOString() }).eq('user_id', userId).eq('id', id)
  if (error) throw error
}
