import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class SidebarPage {
  public page: Page

  // Use Activity heading as proxy for sidebar open/closed state
  private sidebarPanel: Locator
  private toggleButton: Locator

  // Section containers (2 levels up from heading → section header → section container)
  private activitySection: Locator
  private detectionsSection: Locator
  private eventsSection: Locator
  private vesselsSection: Locator
  private vesselGroupsSection: Locator
  private environmentSection: Locator
  private referenceLayersSection: Locator
  private userDatasetsSection: Locator

  constructor(page: Page) {
    this.page = page
    // Activity heading visibility is a reliable proxy for whether sidebar panel is open
    this.sidebarPanel = page.getByRole('heading', { name: 'Activity', level: 2 })
    this.toggleButton = page.getByLabel('Toggle sidebar')

    // Section locators: heading → parent (section header) → parent (section container)
    this.activitySection = page
      .getByRole('heading', { name: 'Activity', level: 2 })
      .locator('../..')
    this.detectionsSection = page
      .getByRole('heading', { name: 'Detections', level: 2 })
      .locator('../..')
    this.eventsSection = page.getByRole('heading', { name: 'Events', level: 2 }).locator('../..')
    this.vesselsSection = page.getByRole('heading', { name: 'Vessels', level: 2 }).locator('../..')
    this.vesselGroupsSection = page
      .getByRole('heading', { name: 'Vessel groups', level: 2 })
      .locator('../..')
    this.environmentSection = page
      .getByRole('heading', { name: 'Environment', level: 2 })
      .locator('../..')
    this.referenceLayersSection = page
      .getByRole('heading', { name: 'Reference layers', level: 2 })
      .locator('../..')
    this.userDatasetsSection = page
      .getByRole('heading', { name: 'User Datasets', level: 2 })
      .locator('../..')
  }

  async waitForSidebarLoaded() {
    // Use an explicit timeout since the React SPA on a live CDN can take >10s to render
    await this.sidebarPanel.waitFor({ state: 'visible', timeout: 60000 })
  }

  async dismissWelcomeModal() {
    await this.page.evaluate(() => {
      document.querySelector<HTMLElement>('[data-testid="modal-close-button"]')?.click()
      // Also set localStorage to suppress future popups
      localStorage.setItem('WelcomePopup', '{"visible":false,"showAgain":false}')
      localStorage.setItem('MarineManagerPopup', '{"visible":false,"showAgain":false}')
      localStorage.setItem('VesselProfilePopup', '{"visible":false,"showAgain":false}')
      localStorage.setItem('DeepSeaMiningPopup', '{"visible":false,"showAgain":false}')
    })
  }

  async dismissHighlightPopup() {
    const dismissButton = this.page.getByRole('button', { name: 'Dismiss', exact: true })
    if (await dismissButton.isVisible()) {
      await dismissButton.click()
    }
  }

  // Sidebar visibility
  async toggleSidebar() {
    await this.toggleButton.click()
  }

  async expectSidebarVisible() {
    // Sidebar slides off-screen (CSS transform), so check viewport intersection not DOM visibility
    await expect(this.sidebarPanel).toBeInViewport()
  }

  async expectSidebarHidden() {
    await expect(this.sidebarPanel).not.toBeInViewport()
  }

  // Section collapse/expand
  async collapseSection(sectionName: string) {
    const section = this.getSectionByName(sectionName)
    const collapseButton = section.getByLabel('Collapse section')
    await collapseButton.click()
  }

  async expandSection(sectionName: string) {
    const section = this.getSectionByName(sectionName)
    const expandButton = section.getByLabel('Expand section')
    await expandButton.click()
  }

  // Layer operations
  async toggleLayer(layerName: string) {
    const layerSwitch = this.page
      .getByText(layerName)
      .locator('..')
      .getByLabel('Toggle layer visibility')
    await layerSwitch.click()
  }

  async expectLayerEnabled(layerName: string) {
    const layerSwitch = this.page
      .getByText(layerName)
      .locator('..')
      .getByLabel('Toggle layer visibility')
    await expect(layerSwitch).toBeChecked()
  }

  async expectLayerDisabled(layerName: string) {
    const layerSwitch = this.page
      .getByText(layerName)
      .locator('..')
      .getByLabel('Toggle layer visibility')
    await expect(layerSwitch).not.toBeChecked()
  }

  async openFilters(layerName: string) {
    const layerContainer = this.page.getByText(layerName).locator('..')
    // Hover first to reveal action buttons hidden behind the 'more' overlay
    await layerContainer.hover()
    const filtersButton = layerContainer.getByLabel('Open filters')
    await filtersButton.click()
  }

  async changeLayerColor(layerName: string) {
    const layerContainer = this.page.getByText(layerName).locator('..')
    await layerContainer.hover()
    const colorButton = layerContainer.getByLabel('Change color')
    await colorButton.click()
  }

  async removeLayer(layerName: string) {
    const layerContainer = this.page.getByText(layerName).locator('..')
    await layerContainer.hover()
    const removeButton = layerContainer.getByLabel('Remove layer')
    await removeButton.click()
  }

  // Add layer functionality
  async addLayerToSection(sectionName: string) {
    const section = this.getSectionByName(sectionName)
    const addButton = section.getByLabel('Add layer')
    await addButton.click()
  }

  async expectLayerLibraryModalOpen() {
    await expect(this.page.getByText('Add to workspace').first()).toBeVisible()
  }

  async addLayerFromLibrary(layerIndex: number = 0) {
    const addButtons = this.page.getByText('Add to workspace')
    await addButtons.nth(layerIndex).click()
  }

  // Filters
  async applyFlagFilter(flagName: string) {
    // Open flag dropdown
    const flagDropdown = this.page.getByPlaceholder('All').first()
    await flagDropdown.click()
    await flagDropdown.fill(flagName)

    // Wait for the dropdown option (role="option") to appear, then click it
    const option = this.page.getByRole('option', { name: flagName })
    await option.waitFor({ state: 'visible', timeout: 30000 })
    await option.click()

    // Confirm filters
    await this.page.getByText('Confirm').click()
  }

  async expectActiveFilter(layerName: string, filterValue: string) {
    // Filter badge appears in the expanded layer content (sibling of the layer header),
    // so search two levels up to encompass both header and expanded content
    const layerSection = this.page.getByText(layerName).locator('../..')
    await expect(layerSection.getByText(filterValue)).toBeVisible()
  }

  // Navigation
  async clickGlobalReport() {
    await this.page.getByRole('link', { name: /see global report/i }).click()
  }

  async clickShareMap() {
    await this.page.getByLabel('Share map').click()
  }

  async expectURLContains(text: string) {
    await expect.poll(() => this.page.url()).toContain(text)
  }

  // Authentication-related checks
  async expectLoginPrompt(sectionName: string) {
    const section = this.getSectionByName(sectionName)
    // Login links are icon-buttons with aria-label; use getByRole to match accessible name
    await expect(section.getByRole('link', { name: /login/i }).first()).toBeVisible()
  }

  async clickLoginInSection(sectionName: string) {
    const section = this.getSectionByName(sectionName)
    await section.getByRole('link', { name: /login/i }).first().click()
  }

  async expectEmptyState(message: string) {
    await expect(this.page.getByText(message)).toBeVisible()
  }

  // Helper method to get section by name
  private getSectionByName(sectionName: string): Locator {
    switch (sectionName.toLowerCase()) {
      case 'activity':
        return this.activitySection
      case 'detections':
        return this.detectionsSection
      case 'events':
        return this.eventsSection
      case 'vessels':
        return this.vesselsSection
      case 'vessel groups':
        return this.vesselGroupsSection
      case 'environment':
        return this.environmentSection
      case 'reference layers':
        return this.referenceLayersSection
      case 'user datasets':
        return this.userDatasetsSection
      default:
        throw new Error(`Unknown section: ${sectionName}`)
    }
  }
}
