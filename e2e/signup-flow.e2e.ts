import { expect, test } from '@playwright/test'

// Full sign-up on LOCAL staging: create an account, read the 8-digit code from the staging inbox (Mailpit),
// verify, and land on the plan screen without being sent back to the code screen (regression of the
// 2026-10-08 "bounce back" bug). Runs only with `npm run test:e2e:staging` (E2E_MAILPIT_URL is set there).

const mailpitUrl = process.env.E2E_MAILPIT_URL ?? ''

async function readSignUpCode(email: string): Promise<string> {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const search = await fetch(`${mailpitUrl}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`)
    const { messages = [] } = (await search.json()) as { messages?: Array<{ ID: string }> }
    if (messages[0]) {
      const message = (await (await fetch(`${mailpitUrl}/api/v1/message/${messages[0].ID}`)).json()) as { Text?: string; HTML?: string }
      const code = `${message.Text ?? ''} ${message.HTML ?? ''}`.match(/\b\d{8}\b/)?.[0]
      if (code) return code
    }
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  throw new Error(`No sign-up code arrived for ${email}`)
}

test('sign up after shop setup reaches the plan screen and stays there', async ({ page }) => {
  test.skip(!mailpitUrl, 'Needs local staging (npm run test:e2e:staging)')
  test.setTimeout(90_000)
  const email = `signup-${Date.now()}@staging.local`
  const password = 'Staging-Test-123'

  // The usual route: shop setup first, then sign up (setup is pending sync until the account exists).
  await page.goto('/onboarding', { waitUntil: 'domcontentloaded' })
  await page.evaluate(() => window.localStorage.setItem('tailordeck-onboarding-sync-pending', 'true'))

  await page.goto('/auth/signup', { waitUntil: 'domcontentloaded' })
  await page.getByLabel('Full Name').fill('Signup Test')
  await page.getByLabel('Email Address').fill(email)
  await page.getByLabel('Phone Number').fill('8031234567')
  await page.locator('#signup-password').fill(password)
  await page.getByLabel('Confirm Password').fill(password)
  await page.locator('.auth-agree input[type="checkbox"]').check()
  await page.getByRole('button', { name: 'Create Account' }).click()
  await expect(page).toHaveURL(/\/auth\/verify-email/, { timeout: 20_000 })

  // Phones on a slow connection: the account activation request arrives after background screens have
  // already loaded the not-yet-active profile. Delaying it here reproduces that order every time.
  await page.route('**/rest/v1/rpc/activate_verified_profile', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 2500))
    await route.continue()
  })

  const code = await readSignUpCode(email)
  for (const [index, digit] of [...code].entries()) {
    await page.locator(`[data-otp-index="${index}"]`).fill(digit)
  }
  const verifyButton = page.getByRole('button', { name: 'Verify Email' })
  if (await verifyButton.isEnabled().catch(() => false)) await verifyButton.click().catch(() => undefined)

  await expect(page).toHaveURL(/\/onboarding\/plan/, { timeout: 20_000 })
  // The bug sent users back to the code screen a moment after arriving; make sure we stay.
  await page.waitForTimeout(3000)
  await expect(page).toHaveURL(/\/onboarding\/plan/)
  await expect(page.getByText('Choose the plan that\'s right for you')).toBeVisible()
})
