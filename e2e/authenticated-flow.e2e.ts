import { expect, test, type Page } from '@playwright/test'

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => ({
    body: document.body.scrollWidth - window.innerWidth,
    document: document.documentElement.scrollWidth - window.innerWidth,
  }))

  expect(overflow.body).toBeLessThanOrEqual(2)
  expect(overflow.document).toBeLessThanOrEqual(2)
}

async function expectReadyAuthenticatedShell(page: Page) {
  // The real header, not the loading placeholder's copy (.app-boot-header).
  await expect(page.locator('.app-shell-header:not(.app-boot-header)')).toBeVisible({ timeout: 15_000 })
  await expect(page.getByText('TailorDeck').first()).toBeVisible()
  await expectNoHorizontalOverflow(page)
}

async function gotoAppRoute(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'domcontentloaded' })
}

const protectedRoutes = [
  { path: '/', label: 'home' },
  { path: '/jobs', label: 'jobs' },
  { path: '/dashboard', label: 'dashboard' },
  { path: '/more', label: 'more' },
  { path: '/help', label: 'help and support' },
  { path: '/settings/security', label: 'account and security' },
  { path: '/documents', label: 'invoice and receipt setup' },
]

for (const route of protectedRoutes) {
  test(`authenticated ${route.label} route renders within mobile viewport`, async ({ page }) => {
    await gotoAppRoute(page, route.path)
    await expectReadyAuthenticatedShell(page)
  })
}

test('deleting the account asks for the password and refuses a wrong one', async ({ page }) => {
  await gotoAppRoute(page, '/settings/security')
  await expectReadyAuthenticatedShell(page)

  await page.getByRole('button', { name: 'Delete Account Permanently' }).click()
  const dialog = page.getByRole('dialog', { name: 'Delete account?' })
  await expect(dialog).toBeVisible()
  const confirmButton = dialog.getByRole('button', { name: 'Request deletion' })

  await dialog.locator('input[type="text"]').fill('DELETE')
  await expect(confirmButton).toBeDisabled() // the password is required too
  await dialog.locator('input[type="password"]').fill('not-the-password-1')
  await confirmButton.click()
  await expect(dialog.getByRole('alert')).toHaveText('That password is incorrect.')
  await expect(dialog).toBeVisible() // nothing was deleted

  await dialog.getByRole('button', { name: 'Cancel' }).click()
  await expect(dialog).toBeHidden()
})

test('reference image viewer stays above notification drawer layer', async ({ page }) => {
  await gotoAppRoute(page, '/')
  await expectReadyAuthenticatedShell(page)

  const zIndex = await page.evaluate(() => {
    const probe = document.createElement('div')
    probe.className = 'sheet-overlay job-image-viewer'
    document.body.appendChild(probe)
    const viewer = Number(window.getComputedStyle(probe).zIndex)
    probe.remove()

    const notificationProbe = document.createElement('div')
    notificationProbe.className = 'notification-panel-overlay'
    document.body.appendChild(notificationProbe)
    const notification = Number(window.getComputedStyle(notificationProbe).zIndex)
    notificationProbe.remove()

    return { notification, viewer }
  })

  expect(zIndex.viewer).toBeGreaterThan(zIndex.notification)
})