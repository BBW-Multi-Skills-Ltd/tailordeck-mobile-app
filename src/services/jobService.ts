import type { Job, JobStatus } from '../types/job'
import { supabase } from '../lib/supabase'
import { toLocalDateKey } from '../lib/localDate'
import { normalizeNigerianPhone } from '../lib/phone'
import { mapJobRow } from './mappers/jobMapper'
import { mapJobStatusToDb } from './mappers/statusMapper'
import { LIST_PAGE_SIZE, toIlikeTerm, toListPage, type ListPage } from './listPaging'
import { createSignedUrl, getServiceErrorMessage, requireUserId, ServiceError } from './serviceHelpers'
import type { JobRow, JobWithRelations } from './types'
import { uploadJobReferencePhotos } from './jobs/jobRelationPersistence'
import { buildJobExpenseRows, buildJobPersonRows } from './jobs/jobRelationRows'
import { buildFullJobRow } from './jobs/jobRows'
import type { CreateFullJobInput } from './jobs/jobServiceTypes'
import { validateCreateFullJobInput } from '../validation/jobSchemas'
import { getJobCreationBlockedMessage } from './subscriptionService'

const JOB_PHOTO_SIGNED_URL_TTL = 60 * 60 * 24 * 7

export type { CreateFullJobInput, CreateJobInput, CreateJobPersonInput, CreateJobReferencePhotoInput } from './jobs/jobServiceTypes'

export type JobReminderSchedule = Pick<
  JobRow,
  | 'id'
  | 'client_name'
  | 'deadline_date'
  | 'deadline_time'
  | 'item_type'
  | 'reminder'
  | 'custom_reminder_minutes'
  | 'reminder_label'
  | 'status'
  | 'title'
>

/** One page of jobs, newest first. Search runs on the server so it finds every job, not just loaded ones. */
export async function getJobsPage(params: { status?: JobStatus; search?: string; offset?: number }): Promise<ListPage<Job>> {
  const userId = await requireUserId()
  const offset = params.offset ?? 0
  let query = supabase
    .from('jobs')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    // One extra row tells us whether another page exists.
    .range(offset, offset + LIST_PAGE_SIZE)
  query = params.status ? query.eq('status', mapJobStatusToDb(params.status)) : query.neq('status', 'draft')
  const term = toIlikeTerm(params.search)
  if (term) query = query.ilike('client_name', term)

  const { data, error } = await query.returns<JobRow[]>()
  if (error) throw error
  return toListPage(data ?? [], offset, mapJobRow)
}

export async function getJobReminderSchedules(limit = 100): Promise<JobReminderSchedule[]> {
  const userId = await requireUserId()
  // Past deadlines can't be reminded about anymore; without this, old unfinished jobs filled the 100 slots
  // and upcoming jobs got no phone alarm. Yesterday is kept so late-evening deadlines near midnight still count.
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const { data, error } = await supabase
    .from('jobs')
    .select('id, client_name, deadline_date, deadline_time, item_type, reminder, custom_reminder_minutes, reminder_label, status, title')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .gte('deadline_date', toLocalDateKey(yesterday))
    .neq('reminder', 'none')
    .in('status', ['pending', 'in_progress'])
    .order('deadline_date', { ascending: true })
    .limit(limit)
    .returns<JobReminderSchedule[]>()
  if (error) throw error
  return data ?? []
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

/**
 * Jobs for the client profile (history + latest measurements). Only persons are loaded: the profile shows no
 * photos or expenses, and signing every photo URL made long-time clients slow to open.
 */
export async function getClientJobs(clientId: string): Promise<JobWithRelations[]> {
  const userId = await requireUserId()
  const { data, error } = await supabase
    .from('jobs')
    .select('*, job_persons(*)')
    .eq('user_id', userId)
    .eq('client_id', clientId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .returns<JobWithRelations[]>()
  if (error) throw error
  return data ?? []
}

/**
 * Creates or updates a job with its persons, measurements and expenses in one database transaction
 * (save_full_job). `jobId` and `newClientId` are generated once per wizard, so retrying after a network
 * failure updates the same job instead of creating a duplicate job or client.
 */
export async function saveFullJob(params: { jobId: string; newClientId: string; input: CreateFullJobInput }): Promise<Job> {
  const { input, jobId, newClientId } = params
  validateCreateFullJobInput(input)
  const userId = await requireUserId()

  const { data: existing, error: existingError } = await supabase
    .from('jobs')
    .select('id, client_id, deleted_at')
    .eq('user_id', userId)
    .eq('id', jobId)
    .maybeSingle<Pick<JobRow, 'id' | 'client_id' | 'deleted_at'>>()
  if (existingError) throw existingError
  if (existing?.deleted_at) throw new ServiceError('This job was deleted.')
  // The plan limit is enforced by the enforce_free_plan_job_limit trigger inside save_full_job (new jobs only),
  // so there is no separate entitlement round trip here; its error is translated below.

  const clientId = input.clientId || existing?.client_id || null
  const newClient = !clientId && !existing
    ? {
        id: newClientId,
        name: input.clientName.trim(),
        phone: input.clientPhone.trim(),
        phone_normalized: normalizeNigerianPhone(input.clientPhone),
        sex: input.clientSex,
        measurement_unit: input.measurementUnit,
      }
    : null

  const { data: job, error } = await supabase
    .rpc('save_full_job', {
      p_job_id: jobId,
      p_job: buildFullJobRow(input, userId, clientId),
      p_persons: buildJobPersonRows(input, userId, jobId, clientId),
      p_expenses: buildJobExpenseRows(input, userId, jobId),
      p_new_client: newClient,
    })
    .single<JobRow>()
  if (error) throw toJobLimitError(error)

  try {
    await uploadJobReferencePhotos(input, jobId)
  } catch (photoError) {
    console.error('Job saved but reference photos failed to upload:', photoError)
    throw new JobPhotosNotSavedError()
  }

  return mapJobRow(job)
}

/** The job itself is saved; only photos failed. Saving again retries just the photos (same job, no duplicates). */
class JobPhotosNotSavedError extends ServiceError {
  constructor() {
    super('Job saved, but some reference photos could not be saved. Tap the button again to retry the photos.')
    this.name = 'JobPhotosNotSavedError'
  }
}

/** Turns the plan-limit errors raised by the jobs trigger into the app's upgrade message. */
export function toJobLimitError(error: unknown): unknown {
  const message = getServiceErrorMessage(error, '')
  if (message.startsWith('Free plan job limit reached')) {
    return new ServiceError(getJobCreationBlockedMessage({ effective_plan: 'free', job_limit: 3 }))
  }
  if (message.startsWith('Your current plan cannot create jobs') || message.startsWith('An active subscription is required')) {
    return new ServiceError(getJobCreationBlockedMessage(null))
  }
  return error
}

async function hydrateJobPhotoUrls(job: JobWithRelations): Promise<JobWithRelations> {
  const photos = job.job_reference_photos ?? []
  if (!photos.length) return job

  const signedPhotos = await Promise.all(
    photos.map(async (photo) => ({
      ...photo,
      signed_url: await createSignedUrl('job-photos', photo.storage_path, JOB_PHOTO_SIGNED_URL_TTL),
    })),
  )

  return { ...job, job_reference_photos: signedPhotos }
}

export async function updateJobStatus(id: string, status: JobStatus): Promise<Job> {
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

export async function softDeleteAllJobs(): Promise<void> {
  const userId = await requireUserId()
  const { error } = await supabase
    .from('jobs')
    .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('deleted_at', null)
  if (error) throw error
}

