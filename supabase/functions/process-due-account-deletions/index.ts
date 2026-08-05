import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.107.0'
import { jsonResponse } from '../_shared/cors.ts'

type StorageTarget = {
  bucket: 'avatars' | 'brand-assets' | 'job-photos' | 'documents'
  path: string
}

type DueAccount = {
  userId: string
  profileId: string
  email: string | null
  fullName: string | null
  deletionScheduledAt: string
  counts: Record<string, number>
  storage: StorageTarget[]
}

type CleanupResult = {
  userId: string
  dryRun: boolean
  storageTargets: number
  deletedStorageTargets: number
  authUserDeleted: boolean
  error: string | null
}

function requiredEnv(name: string): string {
  const value = Deno.env.get(name)
  if (!value) throw new Error(`Missing ${name}`)
  return value
}

function adminClient() {
  return createClient(requiredEnv('SUPABASE_URL'), requiredEnv('SUPABASE_SERVICE_ROLE_KEY'))
}

function parseBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return value.toLowerCase() === 'true'
  return fallback
}

function groupStorageTargets(targets: StorageTarget[]): Map<StorageTarget['bucket'], string[]> {
  const grouped = new Map<StorageTarget['bucket'], string[]>()
  for (const target of targets) {
    if (!target.bucket || !target.path) continue
    const current = grouped.get(target.bucket) ?? []
    current.push(target.path)
    grouped.set(target.bucket, current)
  }
  return grouped
}

async function deleteStorageTargets(admin: ReturnType<typeof adminClient>, targets: StorageTarget[]): Promise<number> {
  let deleted = 0
  const grouped = groupStorageTargets(targets)

  for (const [bucket, paths] of grouped.entries()) {
    const uniquePaths = [...new Set(paths)]
    if (uniquePaths.length === 0) continue
    const { data, error } = await admin.storage.from(bucket).remove(uniquePaths)
    if (error) throw error
    deleted += data?.length ?? uniquePaths.length
  }

  return deleted
}

async function insertDeletionAudit(admin: ReturnType<typeof adminClient>, account: DueAccount, deletedStorageTargets: number): Promise<void> {
  const { error } = await admin.from('account_audit_logs').insert({
    user_id: account.userId,
    event_type: 'account_deleted',
    metadata: {
      profile_id: account.profileId,
      email_present: Boolean(account.email),
      full_name_present: Boolean(account.fullName),
      deletion_scheduled_at: account.deletionScheduledAt,
      counts: account.counts,
      storage_targets: account.storage.length,
      deleted_storage_targets: deletedStorageTargets,
    },
  })

  if (error) throw error
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405, request)
  }

  const cleanupSecret = Deno.env.get('ACCOUNT_CLEANUP_SECRET')
  if (!cleanupSecret) {
    return jsonResponse({ error: 'Account cleanup is not enabled. Missing ACCOUNT_CLEANUP_SECRET.' }, 503, request)
  }

  if (request.headers.get('x-cleanup-secret') !== cleanupSecret) {
    return jsonResponse({ error: 'Unauthorized cleanup request.' }, 401, request)
  }

  try {
    const body = await request.json().catch(() => ({}))
    const dryRun = parseBoolean(body.dryRun, true)
    const batchSize = Math.max(1, Math.min(Number(body.batchSize) || 25, 100))
    const admin = adminClient()

    const { data, error } = await admin.rpc('list_due_account_deletions', { batch_size: batchSize })
    if (error) throw error

    const accounts = Array.isArray(data) ? (data as DueAccount[]) : []
    const results: CleanupResult[] = []

    for (const account of accounts) {
      const result: CleanupResult = {
        userId: account.userId,
        dryRun,
        storageTargets: account.storage?.length ?? 0,
        deletedStorageTargets: 0,
        authUserDeleted: false,
        error: null,
      }

      try {
        if (!dryRun) {
          result.deletedStorageTargets = await deleteStorageTargets(admin, account.storage ?? [])
          await insertDeletionAudit(admin, account, result.deletedStorageTargets)
          const { error: deleteUserError } = await admin.auth.admin.deleteUser(account.userId)
          if (deleteUserError) throw deleteUserError
          result.authUserDeleted = true
        }
      } catch (error) {
        result.error = error instanceof Error ? error.message : 'Unknown cleanup error.'
      }

      results.push(result)
    }

    return jsonResponse({
      ok: true,
      dryRun,
      dueAccounts: accounts.length,
      accounts,
      results,
    }, 200, request)
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === 'object' && error !== null
          ? JSON.stringify(error)
          : 'Unable to process due account deletions.'
    return jsonResponse({ error: message }, 500, request)
  }
})
