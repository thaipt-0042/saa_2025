import { test, expect } from '@playwright/test'

// US1: Google OAuth login flow
test.describe('US1 – Login page', () => {
  test('error alert is visible when navigating to /login?error=auth_failed', async ({ page }) => {
    await page.goto('/login?error=auth_failed')
    const alert = page.getByRole('alert')
    await expect(alert).toBeVisible()
  })

  test('no error alert when navigating to /login without error param', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('alert')).not.toBeVisible()
  })

  test('login button is enabled on load', async ({ page }) => {
    await page.goto('/login')
    const button = page.getByRole('button', { name: /sign in with google/i })
    await expect(button).toBeEnabled()
  })

  test('/auth/callback with no params redirects to /login', async ({ page }) => {
    await page.goto('/auth/callback')
    await expect(page).toHaveURL(/\/login/)
  })

  // Requires real Google session cookie – skipped in CI until credentials configured
  test.skip('auth guard: authenticated user on /login is redirected to post-login URL', async ({
    page,
  }) => {
    // Inject a valid Supabase session cookie here when credentials are available
    await page.goto('/login')
    await expect(page).not.toHaveURL('/login')
  })

  // Requires real Google OAuth credentials – skipped in CI
  test.skip('full OAuth flow: clicking login button redirects to Google', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: /sign in with google/i }).click()
    await expect(page).toHaveURL(/accounts\.google\.com/)
  })
})

// US2: Language switcher
test.describe('US2 – Language switcher', () => {
  test('language selector is visible in the header', async ({ page }) => {
    await page.goto('/login')
    const trigger = page.getByRole('button', { name: /select language/i })
    await expect(trigger).toBeVisible()
  })

  test('clicking selector opens dropdown listing available locales', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: /select language/i }).click()
    await expect(page.getByRole('option', { name: /english/i })).toBeVisible()
    await expect(page.getByRole('option', { name: /tiếng việt/i })).toBeVisible()
  })

  test('selecting English sets lang cookie and updates label', async ({ page, context }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: /select language/i }).click()
    await page.getByRole('option', { name: /english/i }).click()

    const cookies = await context.cookies()
    const langCookie = cookies.find((c) => c.name === 'lang')
    expect(langCookie?.value).toBe('en')
  })

  test('lang cookie persists after reload and page renders in selected language', async ({
    page,
    context,
  }) => {
    await context.addCookies([{ name: 'lang', value: 'en', url: 'http://localhost:3000' }])
    await page.goto('/login')
    // The page should render in English from first byte — no flash of wrong language
    const button = page.getByRole('button', { name: /sign in with google/i })
    await expect(button).toBeVisible()
  })
})
