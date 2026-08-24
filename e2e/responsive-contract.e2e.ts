import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

function readBuiltCss(): string {
  const assetsDir = join(process.cwd(), 'dist', 'assets')
  const cssFile = readdirSync(assetsDir).find((file) => file.startsWith('index-') && file.endsWith('.css'))
  if (!cssFile) throw new Error('Built TailorDeck CSS was not found. Run npm run build before Playwright tests.')
  return readFileSync(join(assetsDir, cssFile), 'utf8')
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => ({
    body: document.body.scrollWidth - window.innerWidth,
    document: document.documentElement.scrollWidth - window.innerWidth,
  }))

  expect(overflow.body).toBeLessThanOrEqual(2)
  expect(overflow.document).toBeLessThanOrEqual(2)
}

async function expectSameRow(left: Locator, right: Locator, tolerance = 3) {
  const leftBox = await left.boundingBox()
  const rightBox = await right.boundingBox()
  expect(leftBox).not.toBeNull()
  expect(rightBox).not.toBeNull()
  expect(Math.abs((leftBox?.y ?? 0) - (rightBox?.y ?? 0))).toBeLessThanOrEqual(tolerance)
}

async function attachResponsiveScreenshot(page: Page, testInfo: TestInfo) {
  const screenshot = await page.screenshot({ fullPage: true, animations: 'disabled' })
  await testInfo.attach(`responsive-${testInfo.project.name}`, {
    body: screenshot,
    contentType: 'image/png',
  })
}

function fixtureHtml(css: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>${css}</style>
  </head>
  <body>
    <main class="app-shell-main">
      <section class="section stack gap-16">
        <article class="card stack gap-14 settings-profile-summary-panel" data-contract="profile-actions">
          <div class="settings-profile-summary">
            <div class="settings-profile-avatar-large"></div>
            <div class="settings-profile-summary-copy">
              <h3>Faith Matarh</h3>
              <p>prosperoanija@gmail.com</p>
              <p>FaithShop</p>
              <div class="settings-profile-summary-actions">
                <button class="settings-profile-edit-btn upload-photo" type="button">Upload Photo</button>
                <button class="settings-profile-edit-btn save-photo" type="button">Save Photo</button>
              </div>
            </div>
          </div>
        </article>

        <article class="dashboard-empty-guide card stack gap-12" data-contract="dashboard-empty">
          <div class="dashboard-empty-icon" aria-hidden>▥</div>
          <div class="stack gap-4">
            <h2>Your analytics will unlock as you work</h2>
            <p>Create jobs with pricing and expenses. TailorDeck will turn them into insights.</p>
          </div>
          <div class="dashboard-empty-steps">
            <span>Create jobs</span>
            <span>Track expenses</span>
            <span>View profit</span>
          </div>
        </article>

        <article class="card stack gap-8" data-contract="expense-entry">
          <div class="wizard-expense-entry-row">
            <input class="input wizard-expense-name-input" value="Fuel" aria-label="Expense name" />
            <input class="input wizard-expense-cost-input" value="₦0" aria-label="Expense cost" />
            <button class="wizard-expense-add-btn" type="button" aria-label="Add expense">+</button>
          </div>
        </article>

        <article class="card stack gap-8 wizard-deadline-checklist" data-contract="delivery-checklist">
          <div class="row-between">
            <div>
              <h4>Delivery Checklist</h4>
              <p class="text-sm text-muted">Confirm the details needed before final review.</p>
            </div>
            <span class="wizard-checklist-score is-ready">Ready</span>
          </div>
          <div class="wizard-checklist-grid">
            <div class="wizard-checklist-row is-complete">
              <span class="wizard-checklist-icon">✓</span>
              <span class="wizard-checklist-copy"><span>Balance due</span><strong>₦4,950</strong></span>
              <span class="wizard-checklist-status">✓</span>
            </div>
          </div>
        </article>

        <div class="notification-panel-overlay" data-contract="notification-layer"></div>
        <div class="sheet-overlay job-image-viewer" data-contract="image-viewer-layer">
          <div class="job-image-stage">
            <button class="btn btn-ghost btn-icon job-image-close" type="button" aria-label="Close image viewer">×</button>
          </div>
        </div>
      </section>
    </main>
  </body>
</html>`
}

test('critical mobile component layouts stay stable across supported widths', async ({ page }, testInfo) => {
  await page.setContent(fixtureHtml(readBuiltCss()), { waitUntil: 'domcontentloaded' })

  await expectNoHorizontalOverflow(page)

  await expectSameRow(page.getByText('Upload Photo'), page.getByText('Save Photo'))
  await expectSameRow(page.getByLabel('Expense name'), page.getByLabel('Expense cost'))
  await expectSameRow(page.getByLabel('Expense cost'), page.getByLabel('Add expense'))

  const dashboardCard = page.locator('[data-contract="dashboard-empty"]')
  const dashboardIcon = page.locator('.dashboard-empty-icon')
  const [dashboardCardBox, dashboardIconBox] = await Promise.all([dashboardCard.boundingBox(), dashboardIcon.boundingBox()])
  expect(dashboardCardBox).not.toBeNull()
  expect(dashboardIconBox).not.toBeNull()
  const cardCenterX = (dashboardCardBox?.x ?? 0) + (dashboardCardBox?.width ?? 0) / 2
  const iconCenterX = (dashboardIconBox?.x ?? 0) + (dashboardIconBox?.width ?? 0) / 2
  expect(Math.abs(cardCenterX - iconCenterX)).toBeLessThanOrEqual(3)

  const checklistCard = page.locator('[data-contract="delivery-checklist"]')
  const readyBadge = page.locator('.wizard-checklist-score')
  const [checklistCardBox, readyBadgeBox] = await Promise.all([checklistCard.boundingBox(), readyBadge.boundingBox()])
  expect(checklistCardBox).not.toBeNull()
  expect(readyBadgeBox).not.toBeNull()
  expect((readyBadgeBox?.x ?? 0) + (readyBadgeBox?.width ?? 0)).toBeLessThanOrEqual((checklistCardBox?.x ?? 0) + (checklistCardBox?.width ?? 0) + 1)

  const zIndex = await page.evaluate(() => {
    const notification = document.querySelector('[data-contract="notification-layer"]')
    const viewer = document.querySelector('[data-contract="image-viewer-layer"]')
    return {
      notification: Number(window.getComputedStyle(notification as Element).zIndex),
      viewer: Number(window.getComputedStyle(viewer as Element).zIndex),
    }
  })
  expect(zIndex.viewer).toBeGreaterThan(zIndex.notification)

  await attachResponsiveScreenshot(page, testInfo)
})
