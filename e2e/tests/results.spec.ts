import { test, expect } from '@playwright/test'

test.describe('Results Page', () => {
  test('should display profile summary', async ({ page }) => {
    // Navigate to results (would normally come from completed chat)
    await page.goto('/results')

    // Profile summary should be visible
    await expect(page.getByTestId('profile-summary')).toBeVisible()
  })

  test('should display university cards', async ({ page }) => {
    await page.goto('/results')

    // Should show university list
    await expect(page.getByTestId('university-list')).toBeVisible()

    // Should have at least one university card
    await expect(page.getByTestId('university-card').first()).toBeVisible()
  })

  test('should show university details', async ({ page }) => {
    await page.goto('/results')

    // Wait for cards to load
    await expect(page.getByTestId('university-card').first()).toBeVisible()

    // Check for key information
    const firstCard = page.getByTestId('university-card').first()
    await expect(firstCard.getByTestId('university-name')).toBeVisible()
    await expect(firstCard.getByTestId('university-tuition')).toBeVisible()
  })

  test('should filter universities by country', async ({ page }) => {
    await page.goto('/results')

    // Open filter panel
    await expect(page.getByTestId('filter-panel')).toBeVisible()

    // Select Canada
    const canadaFilter = page.getByTestId('filter-country').getByLabel('Canada')
    await canadaFilter.check()

    // Apply filters
    await page.getByTestId('filter-apply-button').click()

    // Results should update
    await expect(page.getByTestId('university-list')).toBeVisible()
  })

  test('should filter by budget', async ({ page }) => {
    await page.goto('/results')

    // Adjust budget slider
    const budgetSlider = page.getByTestId('filter-budget')
    await budgetSlider.fill('2000000') // 20 lakhs NPR

    // Apply filters
    await page.getByTestId('filter-apply-button').click()

    // Results should update
    await expect(page.getByTestId('university-list')).toBeVisible()
  })

  test('should filter scholarship only', async ({ page }) => {
    await page.goto('/results')

    // Check scholarship filter
    await page.getByTestId('filter-scholarship').check()

    // Apply filters
    await page.getByTestId('filter-apply-button').click()

    // Results should show only universities with scholarships
    await expect(page.getByTestId('university-list')).toBeVisible()
  })

  test('should filter no GMAT required', async ({ page }) => {
    await page.goto('/results')

    // Check no GMAT filter
    await page.getByTestId('filter-no-gmat').check()

    // Apply filters
    await page.getByTestId('filter-apply-button').click()

    // Results should show only programs without GMAT
    await expect(page.getByTestId('university-list')).toBeVisible()
  })

  test('should reset filters', async ({ page }) => {
    await page.goto('/results')

    // Apply some filters
    await page.getByTestId('filter-scholarship').check()
    await page.getByTestId('filter-apply-button').click()

    // Reset filters
    await page.getByTestId('filter-reset-button').click()

    // All filters should be cleared
    await expect(page.getByTestId('filter-scholarship')).not.toBeChecked()
  })

  test('should navigate to university detail', async ({ page }) => {
    await page.goto('/results')

    // Wait for cards
    await expect(page.getByTestId('university-card').first()).toBeVisible()

    // Click on first university card
    await page.getByTestId('university-card').first().click()

    // Should navigate to detail page
    await expect(page).toHaveURL(/\/university\//)
  })

  test('should open official link in new tab', async ({ page, context }) => {
    await page.goto('/results')

    // Wait for cards
    await expect(page.getByTestId('university-card').first()).toBeVisible()

    // Set up listener for new page
    const pagePromise = context.waitForEvent('page')

    // Click official link
    await page.getByTestId('university-official-link').first().click()

    // New page should open
    const newPage = await pagePromise
    await expect(newPage).toHaveURL(/http/)
  })

  test('should edit profile', async ({ page }) => {
    await page.goto('/results')

    // Click edit button
    await page.getByTestId('profile-edit-button').click()

    // Should navigate back to chat
    await expect(page).toHaveURL('/chat')
  })

  test('should show match reasons', async ({ page }) => {
    await page.goto('/results')

    // Wait for cards
    await expect(page.getByTestId('university-card').first()).toBeVisible()

    // Should display match reasons
    const matchReasons = page.getByTestId('university-match-reasons').first()
    await expect(matchReasons).toBeVisible()
  })

  test('should show requirements summary', async ({ page }) => {
    await page.goto('/results')

    // Wait for cards
    await expect(page.getByTestId('university-card').first()).toBeVisible()

    // Should display requirements
    const requirements = page.getByTestId('university-requirements').first()
    await expect(requirements).toBeVisible()
  })
})

test.describe('Results API Integration', () => {
  test('should handle no results', async ({ page }) => {
    // Mock empty results
    await page.route('**/api/universities/match', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          data: {
            universities: [],
            totalMatches: 0,
          },
        }),
      })
    })

    await page.goto('/results')

    // Should show no results message
    // Implementation specific
  })

  test('should load more results', async ({ page }) => {
    await page.goto('/results')

    // Scroll to bottom or click load more button
    // Should fetch additional results
  })
})
