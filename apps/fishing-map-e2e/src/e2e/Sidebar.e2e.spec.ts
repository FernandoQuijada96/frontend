import { expect, test } from '@playwright/test'

import { SidebarPage } from '../support/SidebarPage'

test.describe('Map Sidebar - POM Tests', () => {
  let sidebarPage: SidebarPage

  test.beforeEach(async ({ page }) => {
    // Set a fixed time for the test
    await page.clock.setFixedTime(new Date('2026-01-07T12:00:00'))

    sidebarPage = new SidebarPage(page)
    await page.goto('https://globalfishingwatch.org/map')
    await sidebarPage.dismissWelcomeModal()
    await page.waitForLoadState('load')
    await sidebarPage.waitForSidebarLoaded()
    await sidebarPage.dismissHighlightPopup()
  })

  test('SB01 - Toggle sidebar open and closed', async () => {
    // Verify sidebar is initially visible
    await sidebarPage.expectSidebarVisible()

    // Toggle to hide sidebar
    await sidebarPage.toggleSidebar()
    await sidebarPage.expectSidebarHidden()

    // Toggle to show sidebar again
    await sidebarPage.toggleSidebar()
    await sidebarPage.expectSidebarVisible()
  })

  test('SB02 - Collapse and expand Activity section', async () => {
    // Collapse Activity section
    await sidebarPage.collapseSection('activity')

    // Expand Activity section
    await sidebarPage.expandSection('activity')
  })

  test('SB03 - Toggle AIS layer visibility', async () => {
    // Verify AIS layer is initially enabled
    await sidebarPage.expectLayerEnabled('Apparent fishing effort (AIS)')

    // Toggle layer off
    await sidebarPage.toggleLayer('Apparent fishing effort (AIS)')
    await sidebarPage.expectLayerDisabled('Apparent fishing effort (AIS)')

    // Toggle layer back on
    await sidebarPage.toggleLayer('Apparent fishing effort (AIS)')
    await sidebarPage.expectLayerEnabled('Apparent fishing effort (AIS)')
  })

  test('SB04 - Open filters for AIS layer and apply flag filter', async () => {
    // Open filters for AIS layer
    await sidebarPage.openFilters('Apparent fishing effort (AIS)')

    // Apply Panama flag filter
    await sidebarPage.applyFlagFilter('Panama')

    // Verify filter is applied
    await sidebarPage.expectActiveFilter('Apparent fishing effort (AIS)', 'Panama')
  })

  test('SB05 - Add a new layer to Activity section', async () => {
    // Open layer library
    await sidebarPage.addLayerToSection('activity')
    await sidebarPage.expectLayerLibraryModalOpen()

    // Verify layer library is open and add a layer
    await sidebarPage.expectLayerLibraryModalOpen()
    await sidebarPage.addLayerFromLibrary(1)

    // Verify the layer library closed (no more 'Add to workspace' buttons)
    await expect(sidebarPage.page.getByText('Add to workspace').first()).not.toBeVisible()
  })

  test('SB06 - Remove a layer from Activity section', async () => {
    // Remove the AIS layer
    await sidebarPage.removeLayer('Apparent fishing effort (AIS)')

    // Verify layer is no longer visible
    await expect(sidebarPage.page.getByText('Apparent fishing effort (AIS)')).not.toBeVisible()
  })

  test('SB07 - Change color of AIS layer', async () => {
    // Click change color button
    await sidebarPage.changeLayerColor('Apparent fishing effort (AIS)')

    // Verify color picker appears - the ColorBar component renders inline color buttons
    await expect(sidebarPage.page.locator('[class*="colorBarWrapper"]').first()).toBeVisible()
  })

  test('SB09 - Toggle Optical imagery detections layer', async () => {
    // Dismiss any highlight popups first
    await sidebarPage.dismissHighlightPopup()

    // Toggle the optical layer
    await sidebarPage.toggleLayer('Imagery vessel detections (Optical)')
    await sidebarPage.expectLayerEnabled('Imagery vessel detections (Optical)')

    // Toggle it off
    await sidebarPage.toggleLayer('Imagery vessel detections (Optical)')
    await sidebarPage.expectLayerDisabled('Imagery vessel detections (Optical)')
  })

  test('SB10 - Toggle Encounter events layer', async () => {
    // Toggle encounter events layer
    await sidebarPage.toggleLayer('Encounter events (AIS)')
    await sidebarPage.expectLayerEnabled('Encounter events (AIS)')

    // Verify URL reflects the change
    await sidebarPage.expectURLContains('encounter')
  })

  test('SB11 - Enable EEZ reference layer', async () => {
    // Enable EEZ layer
    await sidebarPage.toggleLayer('EEZs')
    await sidebarPage.expectLayerEnabled('EEZs')
  })

  test('SB12 - Vessels section shows empty state when unauthenticated', async () => {
    // Verify empty state message
    await sidebarPage.expectEmptyState('Search for vessels or add them from the map.')
  })

  test('SB13 - Vessel Groups section prompts login', async () => {
    // Verify login prompt is visible
    await sidebarPage.expectLoginPrompt('vessel groups')

    // Click login and verify navigation
    await sidebarPage.clickLoginInSection('vessel groups')
    await sidebarPage.expectURLContains('/v3/auth')
  })

  test('SB14 - User Datasets section shows register/login prompt', async () => {
    // Verify register/login text and links
    await sidebarPage.expectEmptyState('Register or login to upload datasets')
    await sidebarPage.expectLoginPrompt('user datasets')

    // Click login and verify navigation
    await sidebarPage.clickLoginInSection('user datasets')
    await sidebarPage.expectURLContains('/v3/auth')
  })

  test('SB15 - See global report link navigates correctly', async () => {
    // Click global report link
    await sidebarPage.clickGlobalReport()
    await sidebarPage.expectURLContains('/report')
  })

  test('SB16 - Share map button opens share dialog', async () => {
    // Click share map button
    await sidebarPage.clickShareMap()

    // Verify share dialog appears
    await expect(
      sidebarPage.page.locator('[role="dialog"], .share, [class*="share"]')
    ).toBeVisible()
  })
})
