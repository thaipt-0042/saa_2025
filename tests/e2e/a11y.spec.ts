import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility audit — WCAG 2.1 AA', () => {
  test('homepage (unauthenticated) has no critical/serious violations', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .exclude('#__next [data-testid="notification-badge"]') // dynamic badge — tested separately
      .analyze()

    const criticalOrSerious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    )

    if (criticalOrSerious.length > 0) {
      console.log('\n=== WCAG 2.1 AA Violations ===')
      criticalOrSerious.forEach((v) => {
        console.log(`\n[${v.impact?.toUpperCase()}] ${v.id}: ${v.description}`)
        console.log(`  Help: ${v.helpUrl}`)
        v.nodes.forEach((n) => {
          console.log(`  Element: ${n.html}`)
          console.log(`  Fix: ${n.failureSummary}`)
        })
      })
    }

    expect(criticalOrSerious, 'Critical/serious WCAG 2.1 AA violations found').toHaveLength(0)
  })
})
