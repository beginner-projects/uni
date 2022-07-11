import { CurrencyAmount } from '@uniswap/sdk-core'
import { ChainId } from 'src/constants/chains'
import { DAI } from 'src/constants/tokens'
import { NativeCurrency } from 'src/features/tokenLists/NativeCurrency'
import {
  getSwapWarnings,
  PartialDerivedSwapInfo,
  SwapWarningLabel,
} from 'src/features/transactions/swap/validate'
import { CurrencyField } from 'src/features/transactions/transactionState/transactionState'

const ETH = NativeCurrency.onChain(ChainId.Mainnet)

const partialSwapState: PartialDerivedSwapInfo = {
  currencyAmounts: {
    [CurrencyField.INPUT]: CurrencyAmount.fromRawAmount(ETH, '10000'),
    [CurrencyField.OUTPUT]: undefined,
  },
  currencyBalances: {
    [CurrencyField.INPUT]: CurrencyAmount.fromRawAmount(ETH, '20000'),
    [CurrencyField.OUTPUT]: undefined,
  },
  currencies: {
    [CurrencyField.INPUT]: ETH,
    [CurrencyField.OUTPUT]: undefined,
  },
  exactCurrencyField: CurrencyField.INPUT,
}

const insufficientBalanceState: PartialDerivedSwapInfo = {
  currencyAmounts: {
    [CurrencyField.INPUT]: CurrencyAmount.fromRawAmount(ETH, '10000'),
    [CurrencyField.OUTPUT]: CurrencyAmount.fromRawAmount(DAI, '200000'),
  },
  currencyBalances: {
    [CurrencyField.INPUT]: CurrencyAmount.fromRawAmount(ETH, '1000'),
    [CurrencyField.OUTPUT]: CurrencyAmount.fromRawAmount(DAI, '0'),
  },
  currencies: {
    [CurrencyField.INPUT]: ETH,
    [CurrencyField.OUTPUT]: DAI,
  },
  exactCurrencyField: CurrencyField.INPUT,
}

describe(getSwapWarnings, () => {
  it('catches incomplete form errors', async () => {
    const warnings = getSwapWarnings(partialSwapState)
    expect(warnings.length).toBe(1)
    expect(warnings[0].name).toEqual(SwapWarningLabel.FormIncomplete)
  })

  it('catches insufficient balance errors', () => {
    const warnings = getSwapWarnings(insufficientBalanceState)
    expect(warnings.length).toBe(1)
    expect(warnings[0].name).toEqual(SwapWarningLabel.InsufficientFunds)
  })

  it('catches multiple errors', () => {
    const incompleteAndInsufficientBalanceState = {
      ...partialSwapState,
      currencyAmounts: {
        ...partialSwapState.currencyAmounts,
        [CurrencyField.INPUT]: CurrencyAmount.fromRawAmount(ETH, '30000'),
      },
    }

    const warnings = getSwapWarnings(incompleteAndInsufficientBalanceState)
    expect(warnings.length).toBe(2)
  })
})
