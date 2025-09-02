export const switchLanguage = (language: string) => {
  cy.window().then((win) => {
    win.localStorage.setItem('i18nextLng', 'en')
  })
  const currentLanguage = localStorage.getItem('i18nextLng')
  if (currentLanguage !== language) {
    localStorage.setItem('i18nextLng', language)
    cy.reload()
  }
}

export const login = () =>{
  cy.intercept('GET', 'https://gateway.api.dev.globalfishingwatch.org/v3/auth/**').as('getAuthTokens')
  cy.getBySel('sidebar-login-icon').click()
  cy.get('#email').should('be.visible').and('be.enabled').type(Cypress.env('CYPRESS_USERNAME'))
  cy.get('#password').should('be.visible').and('be.enabled').type(Cypress.env('CYPRESS_PASSWORD'))
  cy.get('#login > .btn').should('be.visible').and('be.enabled').click()
  cy.wait('@getAuthTokens')
}
