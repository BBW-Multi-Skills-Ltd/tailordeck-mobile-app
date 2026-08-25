import { expect, test } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const authStorageState = '.playwright/.auth/qa-user.json'

function readEnvValue(key: string): string {
  if (process.env[key]) return process.env[key] as string

  for (const envFile of ['.env.e2e', '.env.local', '.env']) {
    const envPath = resolve(process.cwd(), envFile)
    if (!existsSync(envPath)) continue

    for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const separatorIndex = trimmed.indexOf('=')
      if (separatorIndex === -1) continue
      const envKey = trimmed.slice(0, separatorIndex).trim()
      if (envKey !== key) continue

      return trimmed
        .slice(separatorIndex + 1)
        .trim()
        .replace(/^['"]|['"]$/g, '')
    }
  }

  return ''
}

async function prepareQaAccount(email: string, password: string): Promise<void> {
  const supabaseUrl = readEnvValue('VITE_SUPABASE_URL')
  const supabaseAnonKey = readEnvValue('VITE_SUPABASE_ANON_KEY')

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required for authenticated E2E setup.')
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  })

  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
  if (signInError) throw signInError

  const { error: activateError } = await supabase.rpc('activate_verified_profile', {
    email_value: email,
    full_name_value: 'TailorDeck QA',
    phone_value: '+2349010851071',
  })
  if (activateError) throw activateError

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ onboarding_complete: true })
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
  if (profileError) throw profileError

  const { error: trialError } = await supabase.rpc('start_free_trial_subscription')
  if (trialError && !trialError.message.toLowerCase().includes('duplicate')) throw trialError
}

test('authenticate QA user', async ({ page }) => {
  const email = process.env.E2E_TEST_EMAIL
  const password = process.env.E2E_TEST_PASSWORD

  if (!email || !password) {
    throw new Error('E2E_TEST_EMAIL and E2E_TEST_PASSWORD are required for authenticated E2E tests.')
  }

  await prepareQaAccount(email, password)
  mkdirSync(dirname(authStorageState), { recursive: true })

  await page.goto('/auth/signin')
  await page.getByLabel('Email').fill(email)
  await page.getByRole('textbox', { name: 'Password' }).fill(password)
  await page.getByRole('button', { name: 'Sign In', exact: true }).click()

  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(page.locator('.app-shell-header')).toBeVisible({ timeout: 20_000 })
  await page.context().storageState({ path: authStorageState })
})
