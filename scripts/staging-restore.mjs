// Restore test: loads a nightly production backup (from the private tailordeck-backups repo) into LOCAL staging,
// to prove the backup can be opened and loaded. It never touches production.
//
//   npm run staging:restore -- "C:\Users\me\Downloads\tailordeck-2026-10-08.zip"
//
// Asks for BACKUP_PASSPHRASE. The decrypted files are deleted at the end, but staging then holds real
// personal data: run `npm run staging:reset` when you have finished checking.

import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const DB_CONTAINER = 'supabase_db_tailordeck'
const GIT_GPG = 'C:\\Program Files\\Git\\usr\\bin\\gpg.exe'

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', ...options })
  if (result.error) throw result.error
  return result
}

function psqlFile(file, preamble = '') {
  const sql = preamble + readFileSync(file, 'utf8')
  return spawnSync('docker', ['exec', '-i', DB_CONTAINER, 'psql', '-q', '-U', 'postgres', '-d', 'postgres'], {
    input: sql,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  })
}

const input = process.argv[2] ? resolve(process.argv[2]) : ''
if (!input || !existsSync(input)) {
  console.error('Usage: npm run staging:restore -- "<path to tailordeck-YYYY-MM-DD.zip or .tar.gz.gpg>"')
  process.exit(1)
}

const status = spawnSync('npx supabase status -o env', { shell: true, encoding: 'utf8' })
const apiUrl = status.stdout?.match(/^API_URL="?([^"\r\n]+)/m)?.[1] ?? ''
if (status.status !== 0 || !/^http:\/\/(127\.0\.0\.1|localhost)[:/]/.test(apiUrl)) {
  console.error('Local staging is not running. Start Docker Desktop, then: npm run staging:start')
  process.exit(1)
}

const work = mkdtempSync(join(tmpdir(), 'tailordeck-restore-'))
try {
  let encrypted = input
  if (input.toLowerCase().endsWith('.zip')) {
    run('tar', ['-xf', input, '-C', work])
    const found = readdirSync(work).find((name) => name.endsWith('.gpg'))
    if (!found) throw new Error('No .gpg file inside the zip.')
    encrypted = join(work, found)
  }

  console.log('\nEnter BACKUP_PASSPHRASE when asked.')
  const gpg = existsSync(GIT_GPG) ? GIT_GPG : 'gpg'
  const decrypted = join(work, 'backup.tar.gz')
  if (run(gpg, ['--pinentry-mode', 'loopback', '--decrypt', '-o', decrypted, encrypted]).status !== 0) {
    throw new Error('Could not decrypt. Check the passphrase.')
  }
  const extracted = join(work, 'backup')
  run('cmd', ['/c', 'mkdir', extracted])
  run('tar', ['-xzf', decrypted, '-C', extracted])

  console.log('\nRebuilding an empty staging database from the migrations...')
  if (run('npx', ['supabase', 'db', 'reset', '--local'], { shell: true }).status !== 0) throw new Error('Reset failed.')

  console.log('Loading roles and data (duplicate-key notes for plans/site settings are expected)...')
  psqlFile(join(extracted, 'roles.sql'))
  const data = psqlFile(join(extracted, 'data.sql'), 'set session_replication_role = replica;\n')
  const errors = (data.stderr ?? '').split(/\r?\n/).filter((line) => line.includes('ERROR'))
  console.log(errors.length ? `${errors.length} load errors (first 5):\n  ${errors.slice(0, 5).join('\n  ')}` : 'Data loaded with no errors.')

  const counts = spawnSync(
    'docker',
    ['exec', DB_CONTAINER, 'psql', '-U', 'postgres', '-d', 'postgres', '-tA', '-F', ': ', '-c',
      "select 'accounts', count(*) from auth.users union all select 'clients', count(*) from public.clients union all select 'jobs', count(*) from public.jobs union all select 'support tickets', count(*) from public.support_tickets"],
    { encoding: 'utf8' },
  )
  console.log(`\nRestored into local staging:\n${counts.stdout}`)

  // Files are checked, not loaded: count them per bucket to compare with production.
  const storageDir = join(extracted, 'storage')
  if (existsSync(storageDir)) {
    for (const bucket of readdirSync(storageDir)) {
      const files = readdirSync(join(storageDir, bucket), { recursive: true, withFileTypes: true }).filter((entry) => entry.isFile())
      console.log(`files in ${bucket}: ${files.length}`)
    }
  } else {
    console.log('No storage files in this backup (made before file backups were added).')
  }
  console.log('Compare with production in the Supabase dashboard. When done: npm run staging:reset (wipes the real data).')
} catch (error) {
  console.error(`\nRestore test failed: ${error instanceof Error ? error.message : error}`)
  process.exitCode = 1
} finally {
  rmSync(work, { recursive: true, force: true })
}
