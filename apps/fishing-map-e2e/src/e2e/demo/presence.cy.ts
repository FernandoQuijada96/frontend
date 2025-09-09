import { ACTIVITY_LAYER_PANEL_PRESENCE, SWITCH_BUTTON } from '../../constants/demo'
import { disablePopups } from '../../support/app.po'
import { clickCanvasMap, login, percySnapshot, switchLanguage } from '../../support/demo/demo.po'

describe('vms', () => {
  before(() => {
    cy.clearLocalStorage()
    cy.clearCookies()
    cy.visit('/')
    switchLanguage('en')
    disablePopups()
    cy.intercept('GET', '/v3/4wings/tile/heatmap/1/1/1*').as('getHeatmapTiles')
    cy.intercept('GET', '/v3/vessels*').as('getVesselPresenceData')
  })

  it('displays vessel presence', () => {
    login()

    cy.getBySel(ACTIVITY_LAYER_PANEL_PRESENCE, { timeout: 10000 })
      .should('be.visible')
      .and('have.class', 'print-hidden')

    cy.getBySel(ACTIVITY_LAYER_PANEL_PRESENCE)
      .find(SWITCH_BUTTON)
      .should('be.visible')
      .and('be.enabled')
      .click()

    cy.wait('@getHeatmapTiles').its('response.statusCode').should('eq', 200)

    cy.getBySel(ACTIVITY_LAYER_PANEL_PRESENCE)
      .should('be.visible')
      .and('not.have.class', 'print-hidden')

    percySnapshot(1000, 'vms-presence-layer-on-logged')

    const percentFromLeft = 20
    const percentFromTop = 70
    clickCanvasMap(percentFromLeft, percentFromTop)

    cy.wait('@getVesselPresenceData').its('response.statusCode').should('eq', 200)
  })
})
