import { expect, test } from 'playwright/test'

test('SearchGen01 - Search for a vessel and navigate to profile', async ({ page }) => {
  // Set a fixed time for the test
  await page.clock.setFixedTime(new Date('2026-01-07T12:00:00'))

  await page.goto('/map/vessel-search')

  await page.waitForLoadState('networkidle')

  await page.getByTestId('modal-close-button').click()

  await page.waitForLoadState('networkidle')

  // Type vessel name in the search box
  await page
    .getByPlaceholder('Type to search for vessels (Name, IMO, MMSI or call sign)')
    .fill('GABU REEFER')

  // Wait for search results to load
  await expect(page.getByText('629009266')).toBeVisible({ timeout: 10000 })

  // Verify vessel info is displayed in search results
  expect(page.getByText('Gabu Reefer')).toBeVisible()
  expect(page.getByText('8300949')).toBeVisible() // IMO

  // Click on the vessel to navigate to its profile
  await page.getByTestId('link-vessel-profile').click()

  await page.waitForLoadState('networkidle')

  // Verify we navigated to the vessel profile page
  expect(page.url()).toContain('map/vessel/9827ea1ea-a120-f374-0cc6-138b38bd8130')
  expect(page.url()).toContain('vDi=public-global-vessel-identity')
})
