import { toKobo } from '../lib/money'
import { normalizeNigerianPhone } from '../lib/phone'
import type { MockJob, JobStatus } from '../types/job'
import { supabase } from '../lib/supabase'
import { createClient } from './clientService'
import { mapJobCreateMoney, mapJobRow } from './mappers/jobMapper'
import { mapJobStatusToDb } from './mappers/statusMapper'
import { uploadJobPhoto } from './photoService'
import { requireUserId } from './serviceHelpers'
import type { JobPersonRow, JobRow, JobWithRelations } from './types'

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

export interface CreateJobPersonInput {
  name: string
  sex: JobPersonRow['sex']
  role: JobPersonRow['role']
  age?: string | null
  itemType?: string | null
  description?: string | null
  isPrimary: boolean
  measurementKind: JobPersonRow['measurement_kind']
  quantity?: string | null
  measurements: Record<string, number | string>
  measurementUnit: JobPersonRow['measurement_unit']
  sortOrder: number
}

export interface CreateFullJobInput extends CreateJobInput {
  clientSex: 'Male' | 'Female'
  measurementUnit: JobPersonRow['measurement_unit']
  sameItemForAll: boolean
  amendmentIssueType?: string
  amendmentArea?: string
  amendmentTarget?: string
  amendmentDescription?: string
  amendmentNeedsMaterials?: boolean
  amendmentPartName?: string
  amendmentPartQuantity?: string
  materialType?: string
  materialColor?: string
  materialYards?: number | null
  materialQuality?: JobRow['material_quality']
  materialSource?: JobRow['material_source']
  totalExpenses: number
  projectedProfit: number
  isWorthIt: boolean
  persons: CreateJobPersonInput[]
  expenses: Array<{ name: string; cost: number }>
  referencePhotos: File[]
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

function buildFullJobRow(input: CreateFullJobInput, userId: string, clientId: string | null) {
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
    balance_amount_kobo: toKobo(Math.max(input.chargeAmount - (input.chargeAmount * input.depositPercent) / 100, 0)),
    total_expenses_kobo: toKobo(input.totalExpenses),
    profit_kobo: toKobo(input.projectedProfit),
    is_worth_it: input.isWorthIt,
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

export async function getClientJobs(clientId: string): Promise<JobWithRelations[]> {
  const userId = await requireUserId()
  const { data, error } = await supabase
    .from('jobs')
    .select('*, job_expenses(*), job_persons(*), job_reference_photos(*)')
    .eq('user_id', userId)
    .eq('client_id', clientId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .returns<JobWithRelations[]>()
  if (error) throw error
  return data ?? []
}

export async function createJob(input: CreateJobInput): Promise<MockJob> {
  const userId = await requireUserId()
  const { data, error } = await supabase.from('jobs').insert(buildJobRow(input, userId)).select('*').single<JobRow>()
  if (error) throw error
  return mapJobRow(data)
}

export async function createFullJob(input: CreateFullJobInput): Promise<MockJob> {
  const userId = await requireUserId()
  const client = input.clientId
    ? null
    : await createClient({
        name: input.clientName,
        phone: input.clientPhone,
        sex: input.clientSex,
        measurement_unit: input.measurementUnit,
        measurements: {},
      })
  const clientId = input.clientId || client?.id || null

  const { data: job, error: jobError } = await supabase.from('jobs').insert(buildFullJobRow(input, userId, clientId)).select('*').single<JobRow>()
  if (jobError) throw jobError

  const personRows = input.persons.map((person) => ({
    user_id: userId,
    job_id: job.id,
    client_id: clientId,
    name: person.name.trim() || input.clientName.trim(),
    sex: person.sex,
    role: person.role,
    age: person.age?.trim() || null,
    item_type: person.itemType?.trim() || input.itemType.trim() || null,
    description: person.description?.trim() || null,
    is_primary: person.isPrimary,
    measurement_kind: person.measurementKind,
    quantity: person.quantity?.trim() || null,
    measurements: person.measurements,
    measurement_unit: person.measurementUnit,
    sort_order: person.sortOrder,
  }))

  if (personRows.length) {
    const { error } = await supabase.from('job_persons').insert(personRows)
    if (error) throw error
  }

  const expenseRows = input.expenses
    .filter((expense) => expense.name.trim())
    .map((expense) => ({
      user_id: userId,
      job_id: job.id,
      name: expense.name.trim(),
      cost_amount_kobo: toKobo(expense.cost),
    }))

  if (expenseRows.length) {
    const { error } = await supabase.from('job_expenses').insert(expenseRows)
    if (error) throw error
  }

  await Promise.all(input.referencePhotos.slice(0, 3).map((file, index) => uploadJobPhoto(job.id, file, index + 1)))

  if (clientId) {
    await supabase.from('clients').update({ last_job_date: new Date().toISOString().slice(0, 10), updated_at: new Date().toISOString() }).eq('user_id', userId).eq('id', clientId)
  }

  return mapJobRow(job)
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
