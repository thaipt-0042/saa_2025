# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: awards-information.spec.ts >> Awards Information >> US1 — Award list (auth guard) >> unauthenticated user is redirected to /login
- Location: tests/e2e/awards-information.spec.ts:5:9

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/login/
Received string:  "http://localhost:3000/awards-information"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    14 × unexpected value "http://localhost:3000/awards-information"

```

```yaml
- heading "404" [level=1]
- heading "This page could not be found." [level=2]
- alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('Awards Information', () => {
  4  |   test.describe('US1 — Award list (auth guard)', () => {
  5  |     test('unauthenticated user is redirected to /login', async ({ page }) => {
  6  |       await page.goto('/awards-information')
> 7  |       await expect(page).toHaveURL(/\/login/)
     |                          ^ Error: expect(page).toHaveURL(expected) failed
  8  |     })
  9  |   })
  10 | 
  11 |   // Authenticated tests require a logged-in session — skipped in CI without auth fixture
  12 |   test.describe('US1 — Award list (authenticated)', () => {
  13 |     test.skip('shows 6 award blocks in correct order', async ({ page }) => {
  14 |       await page.goto('/awards-information')
  15 |       const slugs = [
  16 |         'top-talent',
  17 |         'top-project',
  18 |         'top-project-leader',
  19 |         'best-manager',
  20 |         'signature-2025-creator',
  21 |         'mvp-most-valuable-person',
  22 |       ]
  23 |       for (const slug of slugs) {
  24 |         await expect(page.locator(`#${slug}`)).toBeVisible()
  25 |       }
  26 |     })
  27 | 
  28 |     test.skip('each award block shows quantity and unit', async ({ page }) => {
  29 |       await page.goto('/awards-information')
  30 |       await expect(page.locator('#top-talent')).toContainText('10')
  31 |       await expect(page.locator('#top-talent')).toContainText('Đơn vị')
  32 |     })
  33 | 
  34 |     test.skip('Signature 2025 shows two prize values', async ({ page }) => {
  35 |       await page.goto('/awards-information')
  36 |       const section = page.locator('#signature-2025-creator')
  37 |       await expect(section).toContainText('5.000.000 VNĐ')
  38 |       await expect(section).toContainText('8.000.000 VNĐ')
  39 |     })
  40 |   })
  41 | 
  42 |   test.describe('US2 — Left navigation', () => {
  43 |     test.skip('click "Best Manager" in nav scrolls to section and sets active', async ({ page }) => {
  44 |       await page.goto('/awards-information')
  45 |       const nav = page.getByRole('navigation', { name: 'Danh mục giải thưởng' })
  46 |       await nav.getByText('Best Manager').click()
  47 |       await expect(nav.getByText('Best Manager')).toHaveAttribute('aria-current', 'true')
  48 |     })
  49 | 
  50 |     test.skip('URL hash #top-project activates that nav item on load', async ({ page }) => {
  51 |       await page.goto('/awards-information#top-project')
  52 |       const nav = page.getByRole('navigation', { name: 'Danh mục giải thưởng' })
  53 |       await expect(nav.getByText('Top Project')).toHaveAttribute('aria-current', 'true')
  54 |     })
  55 |   })
  56 | 
  57 |   test.describe('US3 — Sun* Kudos CTA', () => {
  58 |     test.skip('Sun* Kudos banner is present', async ({ page }) => {
  59 |       await page.goto('/awards-information')
  60 |       await expect(page.getByText(/Sun\* Kudos/i)).toBeVisible()
  61 |     })
  62 | 
  63 |     test.skip('"Chi tiết" button navigates to /sun-kudos in same tab', async ({ page }) => {
  64 |       await page.goto('/awards-information')
  65 |       await page.getByLabel('Xem chi tiết Sun* Kudos').click()
  66 |       await expect(page).toHaveURL(/\/sun-kudos/)
  67 |     })
  68 |   })
  69 | })
  70 | 
```