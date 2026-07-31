import type { MockJob, JobStatus } from '../types/job'
import { supabase } from '../lib/supabase'
import { createClient } from './clientService'
import { mapJobRow } from './mappers/jobMapper'
import { mapJobStatusToDb } from './mappers/statusMapper'
import { uploadJobPhoto } from './photoService'
import { createSignedUrl, requireUserId, ServiceError } from './serviceHelpers'
import type { JobRow, JobWithRelations } from './types'
import { buildJobExpenseRows, buildJobPersonRows } from './jobs/jobRelationRows'
import { buildFullJobRow, buildJobRow } from './jobs/jobRows'
import { buildJobUpdateRow } from './jobs/jobUpdateRows'
import type { CreateFullJobInput, CreateJobInput } from './jobs/jobServiceTypes'
import { validateCreateFullJobInput } from '../validation/jobSchemas'

export type { CreateFullJobInput, CreateJobInput, CreateJobPersonInput, CreateJobReferencePhotoInput } from './jobs/jobServiceTypes'

export async function getJobs(status?: JobStatus): Promise<MockJob[]> {
  const userId = await requireUserId()
  let query = supabase.from('jobs').select('*').eq('user_id', userId).is('deleted_at', null).order('created_at', { ascending: false })
  if (status) {
    query = query.eq('status', mapJobStatusToDb(status))
  } else {
    query = query.neq('status', 'draft')
  }
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
  return data ? hydrateJobPhotoUrls(data) : null
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
  return Promise.all((data ?? []).map(hydrateJobPhotoUrls))
}

export async function createJob(input: CreateJobInput): Promise<MockJob> {
  const userId = await requireUserId()
  const { data, error } = await supabase.from('jobs').insert(buildJobRow(input, userId)).select('*').single<JobRow>()
  if (error) throw error
  return mapJobRow(data)
}

export async function createFullJob(input: CreateFullJobInput): Promise<MockJob> {
  validateCreateFullJobInput(input)
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

  const personRows = buildJobPersonRows(input, userId, job.id, clientId)
  if (personRows.length) {
    const { error } = await supabase.from('job_persons').insert(personRows)
    if (error) throw error
  }

  const expenseRows = buildJobExpenseRows(input, userId, job.id)
  if (expenseRows.length) {
    const { error } = await supabase.from('job_expenses').insert(expenseRows)
    if (error) throw error
  }

  await Promise.all(
    input.referencePhotos.map((photo, index) =>
      uploadJobPhoto({
        file: photo.file,
        jobId: job.id,
        sortOrder: photo.sortOrder || index + 1,
        targetId: photo.targetId,
        targetLabel: photo.targetLabel,
      }),
    ),
  )

  if (clientId && input.status !== 'Draft') {
    await supabase.from('clients').update({ last_job_date: new Date().toISOString().slice(0, 10), updated_at: new Date().toISOString() }).eq('user_id', userId).eq('id', clientId)
  }

  return mapJobRow(job)
}

export async function updateFullJob(id: string, input: CreateFullJobInput): Promise<MockJob> {
  validateCreateFullJobInput(input)
  const userId = await requireUserId()
  const existing = await getJob(id)
  if (!existing) throw new ServiceError('Draft not found.')

  const clientId = input.clientId || existing.client_id
  const nextRow = buildFullJobRow(input, userId, clientId)
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .update({ ...nextRow, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('id', id)
    .select('*')
    .single<JobRow>()
  if (jobError) throw jobError

  await Promise.all([
    supabase.from('job_persons').delete().eq('user_id', userId).eq('job_id', id),
    supabase.from('job_expenses').delete().eq('user_id', userId).eq('job_id', id),
  ])

  const personRows = buildJobPersonRows(input, userId, id, clientId)
  if (personRows.length) {
    const { error } = await supabase.from('job_persons').insert(personRows)
    if (error) throw error
  }

  const expenseRows = buildJobExpenseRows(input, userId, id)
  if (expenseRows.length) {
    const { error } = await supabase.from('job_expenses').insert(expenseRows)
    if (error) throw error
  }

  const existingPhotoCount = existing.job_reference_photos?.length ?? 0
  await Promise.all(
    input.referencePhotos.map((photo, index) =>
      uploadJobPhoto({
        file: photo.file,
        jobId: id,
        sortOrder: existingPhotoCount + (photo.sortOrder || index + 1),
        targetId: photo.targetId,
        targetLabel: photo.targetLabel,
      }),
    ),
  )

  if (clientId && input.status !== 'Draft') {
    await supabase.from('clients').update({ last_job_date: new Date().toISOString().slice(0, 10), updated_at: new Date().toISOString() }).eq('user_id', userId).eq('id', clientId)
  }

  return mapJobRow(job)
}

async function hydrateJobPhotoUrls(job: JobWithRelations): Promise<JobWithRelations> {
  const photos = job.job_reference_photos ?? []
  if (!photos.length) return job

  const signedPhotos = await Promise.all(
    photos.map(async (photo) => ({
      ...photo,
      signed_url: await createSignedUrl('job-photos', photo.storage_path),
    })),
  )

  return { ...job, job_reference_photos: signedPhotos }
}

export async function updateJob(id: string, updates: Partial<CreateJobInput>): Promise<MockJob> {
  const userId = await requireUserId()
  const row = buildJobUpdateRow(updates)
  const { data, error } = await supabase.from('jobs').update(row).eq('user_id', userId).eq('id', id).select('*').single<JobRow>()
  if (error) throw error
  return mapJobRow(data)
}

export async function updateJobStatus(id: string, status: JobStatus): Promise<MockJob> {
  const userId = await requireUserId()
  const dbStatus = mapJobStatusToDb(status)
  const { data, error } = await supabase
    .from('jobs')
    .update({
      status: dbStatus,
      completed_at: dbStatus === 'completed' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
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

