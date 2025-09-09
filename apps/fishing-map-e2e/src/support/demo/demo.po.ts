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

export const login = () => {
  cy.intercept('GET', 'https://gateway.api.dev.globalfishingwatch.org/v3/auth/**').as(
    'getAuthTokens'
  )
  cy.getBySel('sidebar-login-icon').click()
  cy.get('#email').should('be.visible').and('be.enabled').type(Cypress.env('CYPRESS_USERNAME'))
  cy.get('#password').should('be.visible').and('be.enabled').type(Cypress.env('CYPRESS_PASSWORD'))
  cy.get('#login > .btn').should('be.visible').and('be.enabled').click()
  cy.wait('@getAuthTokens')
}

export const percySnapshot = (timeout: number, name: string) => {
  cy.wait(timeout)
  cy.percySnapshot(name)
}

export const clickCanvasMap = (
  percentageDistanceFromLeft: number,
  percentageDistanceFromTop: number
) => {
  cy.get('canvas').then(($canvas) => {
    const width = $canvas[0].width
    const height = $canvas[0].height
    const x = width * (percentageDistanceFromLeft / 100)
    const y = height * (percentageDistanceFromTop / 100)
    cy.wrap($canvas).click(x, y, { force: true })
  })
}

export const clickMultipleTimes = (selector: string, times: number) => {
  for (let i = 0; i < times; i++) {
    cy.get(selector).click()
  }
}
