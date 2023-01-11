import { getTestSelector, getTestSelectorStartsWith } from '../utils'

describe('Testing tokens on uniswap page', () => {
  before(() => {
    cy.visit('/')
  })

  it('should load token leaderboard', () => {
    cy.visit('/tokens/ethereum')
    cy.get(getTestSelectorStartsWith('token-table')).its('length').should('be.eq', 100)
    // check sorted svg icon is present in volume cell, since tokens are sorted by volume by default
    cy.get(getTestSelector('header-row')).find(getTestSelector('volume-cell')).find('svg').should('exist')
    cy.get(getTestSelector('token-table-row-Ether')).find(getTestSelector('name-cell')).should('include.text', 'Ether')
    cy.get(getTestSelector('token-table-row-Ether')).find(getTestSelector('volume-cell')).should('include.text', '$')
    cy.get(getTestSelector('token-table-row-Ether')).find(getTestSelector('price-cell')).should('include.text', '$')
    cy.get(getTestSelector('token-table-row-Ether')).find(getTestSelector('tvl-cell')).should('include.text', '$')
    cy.get(getTestSelector('token-table-row-Ether'))
      .find(getTestSelector('percent-change-cell'))
      .should('include.text', '%')
    cy.get(getTestSelector('header-row')).find(getTestSelector('price-cell')).click()
    cy.get(getTestSelector('header-row')).find(getTestSelector('price-cell')).find('svg').should('exist')
  })

  it('should update when time window toggled', () => {
    cy.visit('/tokens/ethereum')
    cy.get(getTestSelector('time-selector')).should('contain', '1D')
    cy.get(getTestSelector('token-table-row-Ether'))
      .find(getTestSelector('volume-cell'))
      .then(function ($elem) {
        cy.wrap($elem.text()).as('dailyEthVol')
      })
    cy.get(getTestSelector('time-selector')).click()
    cy.get(getTestSelector('1Y')).click()
    cy.get(getTestSelector('token-table-row-Ether'))
      .find(getTestSelector('volume-cell'))
      .then(function ($elem) {
        cy.wrap($elem.text()).as('yearlyEthVol')
      })
    expect(cy.get('@dailyEthVol')).to.not.equal(cy.get('@yearlyEthVol'))
  })

  it('should navigate to token detail page when row clicked', () => {
    cy.visit('/tokens/ethereum')
    cy.get(getTestSelector('token-table-row-Ether')).click()
    cy.get(getTestSelector('token-details-about-section')).should('exist')
    cy.get(getTestSelector('token-details-stats')).should('exist')
    cy.get(getTestSelector('token-info-container')).should('exist')
    cy.get(getTestSelector('chart-container')).should('exist')
    cy.contains('UNI is the governance token for Uniswap').should('exist')
    cy.contains('Etherscan').should('exist')
  })

  it('should update when global network changed', () => {
    cy.visit('/tokens/ethereum')
    cy.get(getTestSelector('tokens-network-filter-selected')).should('contain', 'Ethereum')
    cy.get(getTestSelector('token-table-row-Ether')).should('exist')

    // note: cannot switch global chain via UI because we cannot approve the network switch
    // in metamask modal using plain cypress. this is a workaround.
    cy.visit('/tokens/polygon')
    cy.get(getTestSelector('tokens-network-filter-selected')).should('contain', 'Polygon')
    cy.get(getTestSelector('token-table-row-Polygon-Matic')).should('exist')
  })

  it('should update when token explore table network changed', () => {
    cy.visit('/tokens/ethereum')
    cy.get(getTestSelector('tokens-network-filter-selected')).click()
    cy.get(getTestSelector('tokens-network-filter-option-optimism')).click()
    cy.get(getTestSelector('tokens-network-filter-selected')).should('contain', 'Optimism')
    // global network and bg dont change
    // if you refresh explore network should persist
    cy.reload()
    cy.get(getTestSelector('tokens-network-filter-selected')).should('contain', 'Optimism')
  })
})
