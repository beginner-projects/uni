import React, { Component, createContext, useState, useContext, useCallback, useEffect } from 'react'
import { useWeb3Context } from 'web3-react'
import merge from 'lodash.merge'

import { getEtherBalance, getTokenBalance, getTokenAllowance, isAddress } from '../utils'
import { useBlockEffect } from '../hooks'
import { useBlockNumber } from './Application'
import { useTokenDetails } from './Static'

// define constants
const BALANCE = 'balance'

const ALLOWANCE = 'allowance'

// node creation
function createAddressValueNode(name, value, blockNumber) {
  return { [name]: value, blockNumber }
}

// tree creation
function createAddressBalanceTree(address, tokenAddress, value, blockNumber) {
  return { [address]: { [tokenAddress]: createAddressValueNode(BALANCE, value, blockNumber) } }
}

function createAddressAllowanceTree(address, tokenAddress, spenderAddress, value, blockNumber) {
  return {
    [address]: { [tokenAddress]: { [spenderAddress]: createAddressValueNode(ALLOWANCE, value, blockNumber) } }
  }
}

// create contexts
const AddressBalanceContext = createContext()

const AddressAllowanceContext = createContext()

// define providers
class AddressBalanceContextProvider extends Component {
  constructor(props) {
    super(props)

    this.getValue = (address, tokenAddress) => {
      return this.state[BALANCE][address] && this.state[BALANCE][address][tokenAddress]
        ? this.state[BALANCE][address][tokenAddress]
        : createAddressValueNode(BALANCE)
    }

    this.updateValue = (address, tokenAddress, value, blockNumber) => {
      this.setState(state => ({
        [BALANCE]: merge(state[BALANCE], createAddressBalanceTree(address, tokenAddress, value, blockNumber))
      }))
    }

    this.clearValue = (address, tokenAddress) => {
      this.updateValue(address, tokenAddress)
    }

    this.clearValues = () => {
      this.setState({ [BALANCE]: {} })
    }

    this.state = {
      [BALANCE]: {},
      getValue: this.getValue,
      updateValue: this.updateValue,
      clearValue: this.clearValue,
      clearValues: this.clearValues
    }
  }

  render() {
    return <AddressBalanceContext.Provider value={this.state}>{this.props.children}</AddressBalanceContext.Provider>
  }
}

class AddressAllowanceContextProvider extends Component {
  constructor(props) {
    super(props)

    this.getValue = (address, tokenAddress, spenderAddress) => {
      return this.state[ALLOWANCE][address] &&
        this.state[ALLOWANCE][address][tokenAddress] &&
        this.state[ALLOWANCE][address][tokenAddress][spenderAddress]
        ? this.state[ALLOWANCE][address][tokenAddress][spenderAddress]
        : createAddressValueNode(ALLOWANCE)
    }

    this.updateValue = (address, tokenAddress, spenderAddress, value, blockNumber) => {
      this.setState(state => ({
        [ALLOWANCE]: merge(
          state[ALLOWANCE],
          createAddressAllowanceTree(address, tokenAddress, spenderAddress, value, blockNumber)
        )
      }))
    }

    this.clearValue = (address, tokenAddress, spenderAddress) => {
      this.updateValue(address, tokenAddress, spenderAddress)
    }

    this.clearValues = () => {
      this.setState({ [ALLOWANCE]: {} })
    }

    this.state = {
      [ALLOWANCE]: {},
      getValue: this.getValue,
      updateValue: this.updateValue,
      clearValue: this.clearValue,
      clearValues: this.clearValues
    }
  }

  render() {
    return <AddressAllowanceContext.Provider value={this.state}>{this.props.children}</AddressAllowanceContext.Provider>
  }
}

export default function Provider({ children }) {
  return (
    <AddressBalanceContextProvider>
      <AddressAllowanceContextProvider>{children}</AddressAllowanceContextProvider>
    </AddressBalanceContextProvider>
  )
}

// define useContext wrappers
function useAddressBalanceContext() {
  return useContext(AddressBalanceContext)
}

function useAddressAllowanceContext() {
  return useContext(AddressAllowanceContext)
}

export function Updater() {
  const { networkId } = useWeb3Context()

  const { clearValues: clearValuesBalance } = useAddressBalanceContext()
  const { clearValues: clearValuesAllowance } = useAddressAllowanceContext()

  useEffect(() => {
    clearValuesBalance()
    clearValuesAllowance()
  }, [clearValuesBalance, clearValuesAllowance, networkId])

  return null
}

// define custom hooks
export function useAddressBalance(address, tokenAddress, includeBlockNumber = false) {
  const { library } = useWeb3Context()

  const globalBlockNumber = useBlockNumber()

  const { getValue, updateValue, clearValue } = useAddressBalanceContext()
  const { [BALANCE]: balance, blockNumber: balanceBlockNumber } = getValue(address, tokenAddress)

  const fetchAndUpdateAddressBalance = useCallback(
    blockNumber => {
      if (isAddress(address) && (tokenAddress === 'ETH' || isAddress(tokenAddress))) {
        let stale = false

        ;(tokenAddress === 'ETH' ? getEtherBalance(address, library) : getTokenBalance(tokenAddress, address, library))
          .then(value => {
            if (!stale) {
              updateValue(address, tokenAddress, value, blockNumber || globalBlockNumber)
            }
          })
          .catch(error => {
            if (!stale) {
              clearValue(address, tokenAddress)
            }
          })

        return () => {
          stale = true
        }
      }
    },
    [address, tokenAddress, library, updateValue, clearValue, globalBlockNumber]
  )

  useEffect(fetchAndUpdateAddressBalance, [address, tokenAddress])
  useBlockEffect(fetchAndUpdateAddressBalance)

  return includeBlockNumber ? { balance, blockNumber: balanceBlockNumber } : balance
}

export function useAddressAllowance(address, tokenAddress, spenderAddress) {
  const { library } = useWeb3Context()

  const globalBlockNumber = useBlockNumber()

  const { getValue, updateValue, clearValue } = useAddressAllowanceContext()
  const { [ALLOWANCE]: allowance } = getValue(address, tokenAddress, spenderAddress)

  const fetchAndUpdateAddressAllowance = useCallback(
    blockNumber => {
      if (isAddress(address) && isAddress(tokenAddress) && isAddress(spenderAddress)) {
        let stale = false

        getTokenAllowance(address, tokenAddress, spenderAddress, library)
          .then(value => {
            if (!stale) {
              updateValue(address, tokenAddress, spenderAddress, value, blockNumber || globalBlockNumber)
            }
          })
          .catch(() => {
            if (!stale) {
              clearValue(address, tokenAddress, spenderAddress)
            }
          })

        return () => {
          stale = true
        }
      }
    },
    [address, tokenAddress, spenderAddress, library, updateValue, clearValue, globalBlockNumber]
  )

  useEffect(fetchAndUpdateAddressAllowance, [address, tokenAddress, spenderAddress])
  useBlockEffect(fetchAndUpdateAddressAllowance)

  return allowance
}

export function useExchangeReserves(tokenAddress) {
  const { exchangeAddress } = useTokenDetails(tokenAddress)

  const { balance: reserveETH, blockNumber: reserveETHBlockNumber } = useAddressBalance(exchangeAddress, 'ETH', true)
  const { balance: reserveToken, blockNumber: reserveTokenBlockNumber } = useAddressBalance(
    exchangeAddress,
    tokenAddress,
    true
  )

  const getSyncedReserves = useCallback(() => {
    if (reserveETH && reserveToken && reserveETHBlockNumber === reserveTokenBlockNumber) {
      return { reserveETH, reserveToken, blockNumber: reserveETHBlockNumber }
    } else {
      return { reserveETH: undefined, reserveToken: undefined }
    }
  }, [reserveETH, reserveETHBlockNumber, reserveToken, reserveTokenBlockNumber])

  const [syncedReserves, setSyncedReserves] = useState(getSyncedReserves())

  useEffect(() => {
    if (
      reserveETH &&
      reserveToken &&
      reserveETHBlockNumber === reserveTokenBlockNumber &&
      reserveETHBlockNumber !== syncedReserves.blockNumber
    ) {
      setSyncedReserves(getSyncedReserves())
    }
  }, [
    reserveETH,
    reserveToken,
    reserveETHBlockNumber,
    reserveTokenBlockNumber,
    setSyncedReserves,
    getSyncedReserves,
    syncedReserves.blockNumber
  ])

  return { reserveETH: syncedReserves.reserveETH, reserveToken: syncedReserves.reserveToken }
}
