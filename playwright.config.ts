import { defineConfig } from '@playwright/test'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// .env.e2e by default; `npm run test:e2e:staging` passes E2E_ENV_FILE=.env.staging.
function loadE2eEnv() {
  const envPath = resolve(process.cwd(), process.env.E2E_ENV_FILE || '.env.e2e')
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
  testIgnore: ['**/auth.setup.ts', '**/authenticated-flow.e2e.ts', '**/signup-flow.e2e.ts', '**/admin-two-step.e2e.ts'],
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
  projects: [
    ...publicProjects,
    ...authenticatedProjects,
    // Real sign-up with an emailed code: local staging only (creates an account each run).
    ...(process.env.E2E_MAILPIT_URL
      ? [
          { name: 'signup-staging', testMatch: '**/signup-flow.e2e.ts', use: { channel: 'chrome', hasTouch: true, viewport: { width: 390, height: 844 } } },
          // Runs after the signed-in tests: it adds a two-step factor to the QA account (removed by staging:reset).
          {
            name: 'admin-staging',
            testMatch: '**/admin-two-step.e2e.ts',
            dependencies: hasAuthenticatedE2eCredentials ? mobileViewports.map(({ name }) => `auth-${name}`) : [],
            use: { channel: 'chrome', isMobile: false, viewport: { width: 1280, height: 800 } },
          },
        ]
      : []),
  ],
})
