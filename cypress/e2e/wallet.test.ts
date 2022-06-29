import { TEST_ADDRESS_NEVER_USE_SHORTENED } from '../support/ethereum'

describe('Wallet', () => {
  before(() => {
    cy.visit('/')
  })

  it('displays account details', () => {
    cy.get('[data-testid=web3-status-connected]').contains(TEST_ADDRESS_NEVER_USE_SHORTENED).click()
  })

  it('displays account view in wallet modal', () => {
    cy.get('[data-testid=web3-account-identifier-row]').contains(TEST_ADDRESS_NEVER_USE_SHORTENED)
  })

  it('changes back to the options grid', () => {
    cy.get('[data-testid=wallet-change]').click()
    cy.get('[data-testid=option-grid]').should('exist')
  })

  it('selects injected wallet option', () => {
    cy.contains('Injected').click()
    cy.get('[data-testid=web3-account-identifier-row]').contains(TEST_ADDRESS_NEVER_USE_SHORTENED)
  })

  it('shows connect buttons after disconnect', () => {
    cy.get('[data-testid=wallet-disconnect]').click()
    cy.get('[data-testid=option-grid]').should('exist')
  })
})
