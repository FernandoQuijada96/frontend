import { timeout } from 'es-toolkit'

import { disablePopups } from '../../support/app.po'
import { clickCanvasMap, clickMultipleTimes, switchLanguage } from '../../support/demo/demo.po'

describe('vms', () => {
  before(() => {
    cy.clearLocalStorage()
    cy.clearCookies()
    cy.visit('/')
    switchLanguage('en')
    disablePopups()
  })

  it('displays Moby Dick activity on the Canary Islands', () => {
    // Set viewport resolution to ensure consistent canvas coordinates across browsers.
    cy.viewport(1000, 660)
    cy.getBySel('map-search-button').should('be.visible').click()
    cy.getBySel('map-search-input').should('be.visible').and('be.enabled').type('Canary Islands')
    cy.contains('li', 'eez: Canary Islands').should('be.visible').click()

    cy.get('[title="Select a time range"]', { timeout: 10000 })
      .should('be.visible')
      .and('be.enabled')
      .click()

    cy.get('input[name="start month"]').should('be.enabled').clear().type('7')
    cy.get('input[name="start day"]').should('be.enabled').clear().type('1')
    cy.get('input[name="end month"]').should('be.enabled').clear().type('8')
    cy.get('input[name="end day"]').should('be.enabled').clear().type('31')
    cy.get('button[class*="timerange-selector-module"]').click()

    clickMultipleTimes('button[aria-label="Zoom in"]', 3)

    cy.getBySel('activity-visualizations-change-positions')
      .first()
      .should(($el) => {
        expect($el.attr('class')).not.to.include('disabled')
      })
      .click()

    const percentFromLeft = 52
    const percentFromTop = 58
    clickCanvasMap(percentFromLeft, percentFromTop)

    cy.get('.Popup-module__wIr1hG__content').should('exist')
  })
})
