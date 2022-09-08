import { FeatureFlag } from '../../src/featureFlags/flags/featureFlags'
import { getTestSelector, selectFeatureFlag } from '../utils'

describe('Wallet Dropdown', () => {
  before(() => {
    cy.visit('/')
    selectFeatureFlag([FeatureFlag.navBar])
  })

  it('should change the theme', () => {
    cy.get(getTestSelector('navbar-wallet-dropdown')).click()
    cy.get(getTestSelector('wallet-select-theme')).click()
    cy.get(getTestSelector('wallet-select-theme')).contains('Light theme').should('exist')
  })

  it('should select a language', () => {
    cy.get(getTestSelector('wallet-select-language')).click()
    cy.get(getTestSelector('wallet-language-item')).contains('Afrikaans').click({ force: true })
    cy.get(getTestSelector('wallet-header')).should('contain', 'Taal')
    cy.get(getTestSelector('wallet-language-item')).contains('English').click({ force: true })
    cy.get(getTestSelector('wallet-header')).should('contain', 'Language')
    cy.get(getTestSelector('wallet-back')).click()
  })

  it('should open the wallet connect modal from the drop down', () => {
    cy.get(getTestSelector('wallet-connect-wallet')).click()
    cy.get(getTestSelector('wallet-modal')).should('exist')
    cy.get(getTestSelector('wallet-modal-close')).click()
  })

  it('should open the wallet connect modal from the navbar', () => {
    cy.get(getTestSelector('navbar-connect-wallet')).click()
    cy.get(getTestSelector('wallet-modal')).should('exist')
    cy.get(getTestSelector('wallet-modal-close')).click()
  })
})
