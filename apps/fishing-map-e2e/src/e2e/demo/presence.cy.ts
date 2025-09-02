import { disablePopups} from '../../support/app.po'
import {login,switchLanguage} from '../../support/demo/demo.po'

describe('vms', () => {
   before(() => {
    cy.clearLocalStorage()
    cy.clearCookies()
    cy.visit('/')
    switchLanguage('en')
    disablePopups()
    login()
  })

  it('displays vessel presence', () => {
    cy.getBySel('activity-layer-panel-presence', {timeout: 10000}).should('be.visible').and('have.class', 'print-hidden')
    cy.getBySel('activity-layer-panel-presence')
    .find('.LayerPanel-module__V4tG3a__header')
    .find('button[role="switch"]')
    .should('be.visible').and('be.enabled').click()
    cy.getBySel('activity-layer-panel-presence').should('be.visible').and('not.have.class', 'print-hidden')

  })
})