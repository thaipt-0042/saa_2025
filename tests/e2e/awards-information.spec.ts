import { test, expect } from '@playwright/test'

test.describe('Awards Information', () => {
  test.describe('US1 — Award list (auth guard)', () => {
    test('unauthenticated user is redirected to /login', async ({ page }) => {
      await page.goto('/awards-information')
      await expect(page).toHaveURL(/\/login/)
    })
  })

  // Authenticated tests require a logged-in session — skipped in CI without auth fixture
  test.describe('US1 — Award list (authenticated)', () => {
    test.skip('shows 6 award blocks in correct order', async ({ page }) => {
      await page.goto('/awards-information')
      const slugs = [
        'top-talent',
        'top-project',
        'top-project-leader',
        'best-manager',
        'signature-2025-creator',
        'mvp-most-valuable-person',
      ]
      for (const slug of slugs) {
        await expect(page.locator(`#${slug}`)).toBeVisible()
      }
    })

    test.skip('each award block shows quantity and unit', async ({ page }) => {
      await page.goto('/awards-information')
      await expect(page.locator('#top-talent')).toContainText('10')
      await expect(page.locator('#top-talent')).toContainText('Đơn vị')
    })

    test.skip('Signature 2025 shows two prize values', async ({ page }) => {
      await page.goto('/awards-information')
      const section = page.locator('#signature-2025-creator')
      await expect(section).toContainText('5.000.000 VNĐ')
      await expect(section).toContainText('8.000.000 VNĐ')
    })
  })

  test.describe('US2 — Left navigation', () => {
    test.skip('click "Best Manager" in nav scrolls to section and sets active', async ({ page }) => {
      await page.goto('/awards-information')
      const nav = page.getByRole('navigation', { name: 'Danh mục giải thưởng' })
      await nav.getByText('Best Manager').click()
      await expect(nav.getByText('Best Manager')).toHaveAttribute('aria-current', 'true')
    })

    test.skip('URL hash #top-project activates that nav item on load', async ({ page }) => {
      await page.goto('/awards-information#top-project')
      const nav = page.getByRole('navigation', { name: 'Danh mục giải thưởng' })
      await expect(nav.getByText('Top Project')).toHaveAttribute('aria-current', 'true')
    })
  })

  test.describe('US3 — Sun* Kudos CTA', () => {
    test.skip('Sun* Kudos banner is present', async ({ page }) => {
      await page.goto('/awards-information')
      await expect(page.getByText(/Sun\* Kudos/i)).toBeVisible()
    })

    test.skip('"Chi tiết" button navigates to /sun-kudos in same tab', async ({ page }) => {
      await page.goto('/awards-information')
      await page.getByLabel('Xem chi tiết Sun* Kudos').click()
      await expect(page).toHaveURL(/\/sun-kudos/)
    })
  })
})
