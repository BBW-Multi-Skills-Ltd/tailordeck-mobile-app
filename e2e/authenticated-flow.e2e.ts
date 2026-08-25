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
  await expect(page.locator('.app-shell-header')).toBeVisible({ timeout: 15_000 })
  await expect(page.getByText('TailorDeck').first()).toBeVisible()
  await expectNoHorizontalOverflow(page)
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
    await page.goto(route.path)
    await expectReadyAuthenticatedShell(page)
  })
}

test('reference image viewer stays above notification drawer layer', async ({ page }) => {
  await page.goto('/')
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
