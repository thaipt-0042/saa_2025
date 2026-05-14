import { test, expect } from '@playwright/test'

test.describe('Homepage SAA', () => {
  test.describe('US1 — Hero section', () => {
    test('renders hero keyvisual background image', async ({ page }) => {
      await page.goto('/')
      await expect(page.getByAltText('SAA 2025 keyvisual')).toBeVisible()
    })

    test('shows countdown timer with DAYS, HOURS, MINUTES labels', async ({ page }) => {
      await page.goto('/')
      await expect(page.getByText('DAYS')).toBeVisible()
      await expect(page.getByText('HOURS')).toBeVisible()
      await expect(page.getByText('MINUTES')).toBeVisible()
    })

    test('ABOUT AWARDS CTA links to /awards-information', async ({ page }) => {
      await page.goto('/')
      const link = page.getByRole('link', { name: /ABOUT AWARDS/i })
      await expect(link).toHaveAttribute('href', '/awards-information')
    })

    test('ABOUT KUDOS CTA links to /sun-kudos', async ({ page }) => {
      await page.goto('/')
      const link = page.getByRole('link', { name: /ABOUT KUDOS/i })
      await expect(link).toHaveAttribute('href', '/sun-kudos')
    })
  })

  test.describe('US2 — Header and Footer', () => {
    test('header contains nav links to /, /awards-information, /sun-kudos', async ({ page }) => {
      await page.goto('/')
      const nav = page.locator('header nav')
      await expect(nav.getByRole('link', { name: 'About SAA 2025' })).toBeVisible()
      await expect(nav.getByRole('link', { name: 'Awards Information' })).toBeVisible()
      await expect(nav.getByRole('link', { name: "Sun* Kudos" })).toBeVisible()
    })

    test('footer has nav links', async ({ page }) => {
      await page.goto('/')
      const footer = page.locator('footer')
      await expect(footer.getByRole('link', { name: 'About SAA 2025' })).toBeVisible()
      await expect(footer.getByRole('link', { name: 'Awards Information' })).toBeVisible()
    })

    test('unauthenticated user sees no notification bell', async ({ page }) => {
      await page.goto('/')
      await expect(page.getByLabel('Thông báo')).not.toBeVisible()
    })
  })

  test.describe('US3 — Award cards', () => {
    test('renders 6 award cards', async ({ page }) => {
      await page.goto('/')
      const cards = page.locator('a[href^="/awards-information#"]')
      await expect(cards).toHaveCount(6)
    })

    test('Top Talent card links to /awards-information#top-talent', async ({ page }) => {
      await page.goto('/')
      await expect(page.locator('a[href="/awards-information#top-talent"]')).toBeVisible()
    })
  })

  test.describe('US4 — Auth features (authenticated)', () => {
    // These tests require a logged-in session — skipped in CI without auth fixture
    test.skip('notification bell visible when authenticated', async ({ page }) => {
      await page.goto('/')
      await expect(page.getByLabel('Thông báo')).toBeVisible()
    })

    test.skip('account dropdown shows admin dashboard for admin role', async ({ page }) => {
      await page.goto('/')
      await page.getByLabel('Tài khoản').click()
      await expect(page.getByText('Admin Dashboard')).toBeVisible()
    })
  })

  test.describe('US6 — Widget button', () => {
    test('widget button is visible', async ({ page }) => {
      await page.goto('/')
      await expect(page.getByLabel('Quick actions')).toBeVisible()
    })

    test('widget button toggles quick-action menu on click', async ({ page }) => {
      await page.goto('/')
      const btn = page.getByLabel('Quick actions')
      await btn.click()
      await expect(page.getByText('Quick actions')).toBeVisible()
      await btn.click()
      await expect(page.getByText('Quick actions')).toHaveCount(1) // only the button aria-label remains
    })
  })
})
