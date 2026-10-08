import { jsonResponse } from '../_shared/cors.ts'
import { cancelLinkedSubscriptionForUser } from '../_shared/googlePlay.ts'
import { timingSafeEqual } from '../_shared/secrets.ts'
import { createServiceClient, type ServiceClient } from '../_shared/supabase.ts'

// Every stored file of the user (list_due_account_deletions reads storage.objects by folder), not only
// the files rows still point to.
type StorageTarget = {
  bucket: 'avatars' | 'brand-assets' | 'job-photos' | 'documents' | 'support-attachments'
  path: string
}

const REMOVE_CHUNK = 100

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

async function deleteStorageTargets(admin: ServiceClient, targets: StorageTarget[]): Promise<number> {
  let deleted = 0
  const grouped = groupStorageTargets(targets)

  for (const [bucket, paths] of grouped.entries()) {
    const uniquePaths = [...new Set(paths)]
    for (let start = 0; start < uniquePaths.length; start += REMOVE_CHUNK) {
      const chunk = uniquePaths.slice(start, start + REMOVE_CHUNK)
      const { data, error } = await admin.storage.from(bucket).remove(chunk)
      if (error) throw error
      deleted += data?.length ?? chunk.length
    }
  }

  return deleted
}

/** Personal data that outlives the auth user (no foreign key): free-text reasons and rate-limit rows. */
async function scrubLeftoverPersonalData(admin: ServiceClient, userId: string): Promise<void> {
  const { error: auditError } = await admin.from('account_audit_logs').update({ reason: null }).eq('user_id', userId)
  if (auditError) throw auditError
  const { error: rateLimitError } = await admin.from('edge_rate_limits').delete().eq('actor_id', userId)
  if (rateLimitError) throw rateLimitError
}

async function insertDeletionAudit(admin: ServiceClient, account: DueAccount, deletedStorageTargets: number): Promise<void> {
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

  if (!timingSafeEqual(request.headers.get('x-cleanup-secret') ?? '', cleanupSecret)) {
    return jsonResponse({ error: 'Unauthorized cleanup request.' }, 401, request)
  }

  try {
    const body = await request.json().catch(() => ({}))
    const dryRun = parseBoolean(body.dryRun, true)
    const batchSize = Math.max(1, Math.min(Number(body.batchSize) || 25, 100))
    const admin = createServiceClient()

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
          // Never delete an account that Google Play would keep billing. If Google is unreachable this
          // throws, the account is skipped, and the next daily run tries again.
          await cancelLinkedSubscriptionForUser(admin, account.userId)
          result.deletedStorageTargets = await deleteStorageTargets(admin, account.storage ?? [])
          await insertDeletionAudit(admin, account, result.deletedStorageTargets)
          const { error: deleteUserError } = await admin.auth.admin.deleteUser(account.userId)
          if (deleteUserError) throw deleteUserError
          result.authUserDeleted = true
          await scrubLeftoverPersonalData(admin, account.userId)
        }
      } catch (error) {
        result.error = error instanceof Error ? error.message : 'Unknown cleanup error.'
      }

      results.push(result)
    }

    // No emails/names in the response: scheduled runs store responses in net._http_response,
    // which must not keep personal data of deleted users.
    return jsonResponse({
      ok: true,
      dryRun,
      dueAccounts: accounts.length,
      deleted: results.filter((result) => result.authUserDeleted).length,
      failed: results.filter((result) => result.error).length,
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
