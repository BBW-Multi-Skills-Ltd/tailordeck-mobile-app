import { createHmac } from 'node:crypto'
import { expect, test, type Page } from '@playwright/test'

// Admin two-step login on LOCAL staging (docs/11 S-1): first sign-in sets up an authenticator (QR + key),
// the next sign-in asks for the 6-digit code, and only then the admin portal opens.
// The test computes the codes like an authenticator app does (TOTP, RFC 6238).

const mailpitUrl = process.env.E2E_MAILPIT_URL ?? '' // only set for local staging
const email = process.env.E2E_TEST_EMAIL ?? ''
const password = process.env.E2E_TEST_PASSWORD ?? ''

function base32Decode(value: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let bits = ''
  for (const char of value.replace(/=+$/, '').toUpperCase()) bits += alphabet.indexOf(char).toString(2).padStart(5, '0')
  const bytes = bits.match(/.{8}/g) ?? []
  return Buffer.from(bytes.map((byte) => parseInt(byte, 2)))
}

function totp(secret: string, at = Date.now()): string {
  const counter = Buffer.alloc(8)
  counter.writeBigUInt64BE(BigInt(Math.floor(at / 30_000)))
  const hmac = createHmac('sha1', base32Decode(secret)).update(counter).digest()
  const offset = hmac[hmac.length - 1] & 0xf
  const code = (hmac.readUInt32BE(offset) & 0x7fffffff) % 1_000_000
  return code.toString().padStart(6, '0')
}

async function signInToAdmin(page: Page, { open = true } = {}) {
  if (open) {
    await page.goto('/?site=marketing', { waitUntil: 'domcontentloaded' })
    await page.goto('/admin', { waitUntil: 'domcontentloaded' })
  }
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Two-step login' })).toBeVisible({ timeout: 20_000 })
}

test('admin portal requires two-step login: set up once, then a code every sign-in', async ({ page }) => {
  test.skip(!mailpitUrl || !email, 'Needs local staging (npm run test:e2e:staging)')
  test.setTimeout(120_000)

  // First sign-in: set up the authenticator app.
  await signInToAdmin(page)
  await expect(page.getByAltText('QR code for your authenticator app')).toBeVisible({ timeout: 20_000 })
  const secret = (await page.locator('.ad-twostep-secret').innerText()).trim()
  expect(secret.length).toBeGreaterThan(10)

  await page.getByLabel('Code shown in the app').fill('000000')
  await page.getByRole('button', { name: 'Finish setup' }).click()
  await expect(page.getByRole('alert')).toContainText('not correct', { timeout: 15_000 })

  await page.getByLabel('Code shown in the app').fill(totp(secret))
  const setupWindow = Math.floor(Date.now() / 30_000)
  await page.getByRole('button', { name: 'Finish setup' }).click()
  await expect(page.getByRole('heading', { name: 'What would you like to manage?' })).toBeVisible({ timeout: 20_000 })

  // The database now treats this session as an admin: the support inbox loads without an error.
  await page.getByRole('link', { name: /Manage support/ }).click()
  await expect(page.getByRole('heading', { name: 'Support centre' })).toBeVisible()
  await expect(page.locator('.ad-error')).toHaveCount(0)

  // Next sign-in: only the code is asked (no new QR).
  await page.getByRole('button', { name: 'Sign out' }).click()
  await expect(page.getByLabel('Email')).toBeVisible({ timeout: 15_000 }) // signed out before signing in again
  await signInToAdmin(page, { open: false })
  await expect(page.getByAltText('QR code for your authenticator app')).toHaveCount(0)
  // Like a person: wait for the app's next code (a code cannot be used twice).
  while (Math.floor(Date.now() / 30_000) <= setupWindow) await page.waitForTimeout(1000)
  await page.getByLabel('6-digit code').fill(totp(secret))
  await page.getByRole('button', { name: 'Continue' }).click()
  // Back in the portal, on the page the admin was on before signing out.
  await expect(page.getByRole('heading', { name: 'Support centre' })).toBeVisible({ timeout: 20_000 })
  await expect(page.locator('.ad-error')).toHaveCount(0)
})
