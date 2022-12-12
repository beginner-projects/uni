import { getTestSelector } from '../utils'

const COLLECTION_ADDRESS = '0xbd3531da5cf5857e7cfaa92426877b022e612cf8'

describe('Testing nfts', () => {
  before(() => {
    cy.visit('/')
  })

  it('should load nft leaderboard', () => {
    cy.get(getTestSelector('nft-nav')).first().click()
    cy.get(getTestSelector('nft-nav')).first().should('exist')
    cy.get(getTestSelector('nft-nav')).first().click()
    cy.get(getTestSelector('nft-trending-collection')).should('have.length', 100)
  })

  it('should load bored ape collection page', () => {
    cy.visit(`/#/nfts/collection/${COLLECTION_ADDRESS}`)
    cy.get(getTestSelector('nft-collection-asset')).should('exist')
    cy.get(getTestSelector('nft-collection-filter-buy-now')).should('not.exist')
    cy.get(getTestSelector('nft-filter')).first().click()
    cy.get(getTestSelector('nft-collection-filter-buy-now')).should('exist')
  })

  it('should be able to open bag and open sweep', () => {
    cy.get(getTestSelector('nft-sweep-button')).first().click()
    cy.get(getTestSelector('nft-empty-bag')).should('exist')
    cy.get(getTestSelector('nft-sweep-slider')).should('exist')
  })

  it('should be able to navigate to activity', () => {
    cy.get(getTestSelector('nft-activity')).first().click()
    cy.get(getTestSelector('nft-activity-row')).should('exist')
  })

  it('should go to the details page', () => {
    cy.visit('/#/nfts/collection/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d')
    cy.get(getTestSelector('nft-details-link')).first().click()
    cy.wait(10000)
  })
})
