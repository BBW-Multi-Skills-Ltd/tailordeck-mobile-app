import { defineConfig } from '@playwright/test'

const mobileViewports = [
  { name: 'mobile-320', viewport: { width: 320, height: 740 } },
  { name: 'mobile-360', viewport: { width: 360, height: 800 } },
  { name: 'mobile-375', viewport: { width: 375, height: 812 } },
  { name: 'mobile-390', viewport: { width: 390, height: 844 } },
  { name: 'mobile-412', viewport: { width: 412, height: 915 } },
  { name: 'mobile-430', viewport: { width: 430, height: 932 } },
]

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
  projects: mobileViewports.map(({ name, viewport }) => ({
    name,
    use: {
      channel: 'chrome',
      deviceScaleFactor: 2,
      hasTouch: true,
      viewport,
    },
  })),
})
