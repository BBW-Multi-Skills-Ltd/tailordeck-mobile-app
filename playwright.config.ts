import { defineConfig } from '@playwright/test'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function loadE2eEnv() {
  const envPath = resolve(process.cwd(), '.env.e2e')
  if (!existsSync(envPath)) return

  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex === -1) continue

    const key = trimmed.slice(0, separatorIndex).trim()
    const value = trimmed.slice(separatorIndex + 1).trim()
    if (key && value && !process.env[key]) process.env[key] = value
  }
}

loadE2eEnv()

const mobileViewports = [
  { name: 'mobile-320', viewport: { width: 320, height: 740 } },
  { name: 'mobile-360', viewport: { width: 360, height: 800 } },
  { name: 'mobile-375', viewport: { width: 375, height: 812 } },
  { name: 'mobile-390', viewport: { width: 390, height: 844 } },
  { name: 'mobile-412', viewport: { width: 412, height: 915 } },
  { name: 'mobile-430', viewport: { width: 430, height: 932 } },
]
const hasAuthenticatedE2eCredentials = Boolean(process.env.E2E_TEST_EMAIL && process.env.E2E_TEST_PASSWORD)
const authStorageState = '.playwright/.auth/qa-user.json'
const publicProjects = mobileViewports.map(({ name, viewport }) => ({
  name,
  testIgnore: ['**/auth.setup.ts', '**/authenticated-flow.e2e.ts'],
  use: {
    channel: 'chrome',
    deviceScaleFactor: 2,
    hasTouch: true,
    viewport,
  },
}))
const authenticatedProjects = hasAuthenticatedE2eCredentials
  ? [
      {
        name: 'auth-setup',
        testMatch: '**/auth.setup.ts',
        use: {
          channel: 'chrome',
          deviceScaleFactor: 2,
          hasTouch: true,
          viewport: { width: 390, height: 844 },
        },
      },
      ...mobileViewports.map(({ name, viewport }) => ({
        name: `auth-${name}`,
        dependencies: ['auth-setup'],
        testMatch: '**/authenticated-flow.e2e.ts',
        use: {
          channel: 'chrome',
          deviceScaleFactor: 2,
          hasTouch: true,
          storageState: authStorageState,
          viewport,
        },
      })),
    ]
  : []

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: 'http://127.0.0.1:4173',
    isMobile: true,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1',
    port: 4173,
    reuseExistingServer: !process.env.CI,
  },
  projects: [...publicProjects, ...authenticatedProjects],
})
