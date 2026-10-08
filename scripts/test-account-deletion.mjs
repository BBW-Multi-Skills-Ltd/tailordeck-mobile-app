// End-to-end test of account deletion on LOCAL staging (docs/11 P-4):
// a throwaway account gets files in every bucket (including a replaced avatar no row points to and a
// support attachment), is scheduled for deletion in the past, and the real process-due-account-deletions
// function runs with dryRun:false. Passes only if no file, row or leftover of that account remains.
//
//   npm run test:deletion:staging     (needs `npm run staging:start` first)

import { spawnSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'

const CLEANUP_SECRET = 'local-staging-cleanup-secret' // matches supabase/functions/.env (local only)
const EMAIL = `delete-me-${Date.now()}@staging.local`
const PASSWORD = 'staging-delete-test'
const PNG = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='), (c) => c.charCodeAt(0))
const PDF = new TextEncoder().encode('%PDF-1.4\n%%EOF\n')

function sql(query) {
  const result = spawnSync('docker', ['exec', 'supabase_db_tailordeck', 'psql', '-U', 'postgres', '-tA', '-c', query], { encoding: 'utf8' })
  if (result.status !== 0) throw new Error(result.stderr)
  return result.stdout.trim()
}

function check(condition, label) {
  if (!condition) throw new Error(`FAIL: ${label}`)
  console.log(`  ok: ${label}`)
}

const status = spawnSync('npx supabase status -o env', { shell: true, encoding: 'utf8' })
const env = Object.fromEntries([...status.stdout.matchAll(/^([A-Z_]+)="?(.*?)"?$/gm)].map((match) => [match[1], match[2]]))
if (!/^http:\/\/127\.0\.0\.1:/.test(env.API_URL ?? '')) throw new Error('Local staging is not running: npm run staging:start')

const admin = createClient(env.API_URL, env.SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } })
const user = createClient(env.API_URL, env.ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } })

console.log('Setting up a throwaway account with files everywhere...')
const { data: created, error: createError } = await admin.auth.admin.createUser({ email: EMAIL, password: PASSWORD, email_confirm: true })
if (createError) throw createError
const userId = created.user.id
sql(`update public.profiles set account_status = 'active' where user_id = '${userId}'`)
const { error: signInError } = await user.auth.signInWithPassword({ email: EMAIL, password: PASSWORD })
if (signInError) throw signInError

async function upload(bucket, path, body, contentType) {
  const { error } = await user.storage.from(bucket).upload(path, body, { contentType })
  if (error) throw new Error(`${bucket}/${path}: ${error.message}`)
}
await upload('avatars', `${userId}/avatar-old.png`, PNG, 'image/png') // replaced: no row points to it
await upload('avatars', `${userId}/avatar-new.png`, PNG, 'image/png')
await upload('brand-assets', `${userId}/logo-1.png`, PNG, 'image/png')
await upload('brand-assets', `${userId}/signature-1.png`, PNG, 'image/png')
await upload('job-photos', `${userId}/job-1/photo.png`, PNG, 'image/png')
await upload('documents', `${userId}/job-1/invoice.pdf`, PDF, 'application/pdf')
await user.from('profiles').update({ avatar_storage_path: `${userId}/avatar-new.png` }).eq('user_id', userId)

const { data: ticket, error: ticketError } = await user
  .from('support_tickets')
  .insert({ user_id: userId, category: 'general', priority: 'normal', subject: 'Delete test', message: 'Delete test message' })
  .select('id')
  .single()
if (ticketError) throw ticketError
await upload('support-attachments', `${ticket.id}/screenshot.png`, PNG, 'image/png')
sql(`insert into public.edge_rate_limits (action, actor_id, window_start, request_count, updated_at) values ('test', '${userId}', now(), 1, now())`)

const { error: requestError } = await user.rpc('request_account_deletion', { reason_value: 'personal reason text' })
if (requestError) throw requestError
sql(`update public.profiles set deletion_scheduled_at = now() - interval '1 day' where user_id = '${userId}'`)

const filesBefore = Number(sql(`select count(*) from storage.objects where (storage.foldername(name))[1] in ('${userId}', '${ticket.id}')`))
check(filesBefore === 7, `7 files stored before deletion (got ${filesBefore})`)

console.log('Running process-due-account-deletions (dryRun: false)...')
const response = await fetch(`${env.FUNCTIONS_URL}/process-due-account-deletions`, {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'x-cleanup-secret': CLEANUP_SECRET },
  body: JSON.stringify({ dryRun: false }),
})
const body = await response.text()
check(response.ok, `function returned ${response.status}`)
const result = JSON.parse(body).results?.find((row) => row.userId === userId)
check(result?.authUserDeleted === true && !result.error, `account deleted (${result?.error ?? 'no error'})`)
check(result.deletedStorageTargets === 7, `7 files deleted (got ${result.deletedStorageTargets})`)
check(!body.includes(EMAIL), 'response contains no email address')

check(sql(`select count(*) from storage.objects where (storage.foldername(name))[1] in ('${userId}', '${ticket.id}')`) === '0', 'no files left')
check(sql(`select count(*) from auth.users where id = '${userId}'`) === '0', 'login removed')
check(sql(`select count(*) from public.profiles where user_id = '${userId}'`) === '0', 'profile removed')
check(sql(`select count(*) from public.support_tickets where id = '${ticket.id}'`) === '0', 'support ticket removed')
check(sql(`select count(*) from public.edge_rate_limits where actor_id = '${userId}'`) === '0', 'rate-limit rows removed')
check(sql(`select count(*) from public.account_audit_logs where user_id = '${userId}' and event_type = 'account_deleted'`) === '1', 'deletion audit row kept')
check(sql(`select count(*) from public.account_audit_logs where user_id = '${userId}' and reason is not null`) === '0', 'free-text reasons erased')
console.log('\nAccount deletion test passed.')
