import { expect, test } from '@playwright/test'

test('first-time visitor starts at onboarding and reaches setup', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Welcome to TailorDeck' })).toBeVisible()

  await page.getByRole('button', { name: 'Get Started' }).click()

  await expect(page.getByRole('heading', { name: 'Set Up Your Shop' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Next' })).toBeVisible()
})

test('returning logged-out visitor can open sign in and sign up shells', async ({ page }) => {
  await page.goto('/auth/signin')

  await expect(page.getByRole('heading', { name: 'TailorDeck' })).toBeVisible()
  await expect(page.getByLabel('Email')).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible()

  await page.getByRole('link', { name: 'Sign up' }).click()

  await expect(page.getByText('Create your account to get started')).toBeVisible()
  await expect(page.getByRole('button', { name: /create account/i })).toBeVisible()
})

test('protected client creation route redirects unauthenticated users to sign in', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('tailordeck-onboarding-stage', 'done')
    window.localStorage.setItem('tailordeck-onboarding-done', 'true')
  })

  await page.goto('/clients/new')

  await expect(page).toHaveURL(/\/auth\/signin/)
})
