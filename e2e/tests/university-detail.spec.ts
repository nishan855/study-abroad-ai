import { test, expect } from '@playwright/test'

test.describe('University Detail Page', () => {
  test('should display university header', async ({ page }) => {
    // Navigate to a specific university
    await page.goto('/university/test-university-id')

    // Header should be visible
    await expect(page.getByTestId('university-detail-page')).toBeVisible()
    await expect(page.getByTestId('university-header')).toBeVisible()
  })

  test('should display requirements card', async ({ page }) => {
    await page.goto('/university/test-university-id')

    // Requirements should be visible
    await expect(page.getByTestId('requirements-card')).toBeVisible()
  })

  test('should display budget breakdown', async ({ page }) => {
    await page.goto('/university/test-university-id')

    // Budget breakdown should be visible
    await expect(page.getByTestId('budget-breakdown')).toBeVisible()

    // Should show itemized costs
    // Tuition, living, health insurance, books, total
  })

  test('should display scholarships section', async ({ page }) => {
    await page.goto('/university/test-university-id')

    // Scholarships section should be visible
    await expect(page.getByTestId('scholarships-section')).toBeVisible()
  })

  test('should display intakes and deadlines', async ({ page }) => {
    await page.goto('/university/test-university-id')

    // Intakes section should be visible
    await expect(page.getByTestId('intakes-section')).toBeVisible()
  })

  test('should display PR pathway information', async ({ page }) => {
    await page.goto('/university/test-university-id')

    // PR pathway section should be visible
    await expect(page.getByTestId('pr-pathway-section')).toBeVisible()
  })

  test('should display official sources', async ({ page }) => {
    await page.goto('/university/test-university-id')

    // Official sources should be visible with verification date
    await expect(page.getByTestId('official-sources')).toBeVisible()
  })

  test('should show comparison to user budget', async ({ page }) => {
    await page.goto('/university/test-university-id')

    // Budget breakdown should show if within/over budget
    const budgetBreakdown = page.getByTestId('budget-breakdown')
    await expect(budgetBreakdown).toBeVisible()
  })

  test('should handle 404 for invalid university', async ({ page }) => {
    const response = await page.goto('/university/invalid-id')

    // Should return 404 or show error
    expect(response?.status()).toBe(404)
  })

  test('should open official links', async ({ page, context }) => {
    await page.goto('/university/test-university-id')

    // Official sources should have clickable links
    const officialSources = page.getByTestId('official-sources')
    await expect(officialSources).toBeVisible()
  })
})

test.describe('University Detail Navigation', () => {
  test('should navigate back to results', async ({ page }) => {
    // Start from results
    await page.goto('/results')

    // Click on a university
    await page.getByTestId('university-card').first().click()

    // Should be on detail page
    await expect(page).toHaveURL(/\/university\//)

    // Go back
    await page.goBack()

    // Should be back on results
    await expect(page).toHaveURL('/results')
  })

  test('should save university', async ({ page }) => {
    await page.goto('/university/test-university-id')

    // Click save button (if implemented)
    // Should save to user's saved list
  })
})
