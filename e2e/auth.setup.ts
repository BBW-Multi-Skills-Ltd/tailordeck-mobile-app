import { expect, test } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const authStorageState = '.playwright/.auth/qa-user.json'

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error && 'message' in error) {
    return String((error as { message?: unknown }).message ?? '')
  }
  return String(error)
}

function isRetriableNetworkError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase()
  return (
    message.includes('fetch failed') ||
    message.includes('connect timeout') ||
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('502') ||
    message.includes('503') ||
    message.includes('504')
  )
}

async function withNetworkRetry<T>(label: string, operation: () => Promise<T>, attempts = 4): Promise<T> {
  let lastError: unknown

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      if (attempt === attempts || !isRetriableNetworkError(error)) throw error

      console.warn(`[e2e] ${label} failed on attempt ${attempt}; retrying...`)
      await sleep(attempt * 1500)
    }
  }

  throw lastError
}

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

  await withNetworkRetry('sign in QA user', async () => {
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) throw signInError
  })

  await withNetworkRetry('activate QA profile', async () => {
    const { error: activateError } = await supabase.rpc('activate_verified_profile', {
      email_value: email,
      full_name_value: 'TailorDeck QA',
      phone_value: '+2349010851071',
    })
    if (activateError) throw activateError
  })

  const userId = await withNetworkRetry('load QA user', async () => {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    return data.user?.id
  })

  await withNetworkRetry('mark QA onboarding complete', async () => {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ onboarding_complete: true })
      .eq('user_id', userId)
    if (profileError) throw profileError
  })

  await withNetworkRetry('start QA trial', async () => {
    const { error: trialError } = await supabase.rpc('start_free_trial_subscription')
    if (trialError && !trialError.message.toLowerCase().includes('duplicate')) throw trialError
  })
}

test('authenticate QA user', async ({ page }) => {
  test.setTimeout(90_000)

  const email = process.env.E2E_TEST_EMAIL
  const password = process.env.E2E_TEST_PASSWORD

  if (!email || !password) {
    throw new Error('E2E_TEST_EMAIL and E2E_TEST_PASSWORD are required for authenticated E2E tests.')
  }

  await prepareQaAccount(email, password)
  mkdirSync(dirname(authStorageState), { recursive: true })

  await page.goto('/auth/signin', { waitUntil: 'domcontentloaded' })
  await expect(page.getByLabel('Email')).toBeVisible({ timeout: 20_000 })
  await page.getByLabel('Email').fill(email)
  await page.getByRole('textbox', { name: 'Password' }).fill(password)
  await page.getByRole('button', { name: 'Sign In', exact: true }).click()

  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(page.locator('.app-shell-header')).toBeVisible({ timeout: 20_000 })
  await page.context().storageState({ path: authStorageState })
})
