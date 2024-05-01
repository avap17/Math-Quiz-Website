describe('template spec', () => {
  it('passes', () => {
    cy.visit('https://example.cypress.io')
  })
})

//comment

ddescribe('Test url', () => {
  it('passes', () => {
    cy.visit('http://localhost:3000')
  })
})

describe('Test 2', () => {
  it('Future tests', () => {
    //cy.visit('https://example.cypress.io')
    //cy.visit add url here
    //cy.contains('type').click()
    //cy.url().should('include', '/commands/actions')
  })
})