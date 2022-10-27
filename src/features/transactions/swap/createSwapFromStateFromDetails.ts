import { Currency, TradeType } from '@uniswap/sdk-core'
import { AssetType, CurrencyAsset } from 'src/entities/assets'
import {
  CurrencyField,
  TransactionState,
} from 'src/features/transactions/transactionState/transactionState'
import { TransactionDetails, TransactionType } from 'src/features/transactions/types'
import { currencyAddress, currencyIdToAddress } from 'src/utils/currencyId'
import { logger } from 'src/utils/logger'
import { tryParseRawAmount } from 'src/utils/tryParseAmount'

interface props {
  transactionDetails: TransactionDetails
  inputCurrency: NullUndefined<Currency>
  outputCurrency: NullUndefined<Currency>
}

/**
 * Used to synchronously create swap form state given a transaction and relevant currencies.
 */
export function createSwapFromStateFromDetails({
  transactionDetails,
  inputCurrency,
  outputCurrency,
}: props) {
  const txHash = transactionDetails?.hash
  const chainId = transactionDetails?.chainId

  if (!chainId || !txHash) return undefined

  try {
    const { typeInfo } = transactionDetails

    if (typeInfo.type !== TransactionType.Swap) {
      throw new Error(
        `Tx hash ${txHash} does not correspond to a swap tx. It is of type ${typeInfo.type}`
      )
    }

    const inputCurrencyAmountRaw =
      typeInfo.tradeType === TradeType.EXACT_INPUT
        ? typeInfo.inputCurrencyAmountRaw
        : typeInfo.expectedInputCurrencyAmountRaw
    const outputCurrencyAmountRaw =
      typeInfo.tradeType === TradeType.EXACT_OUTPUT
        ? typeInfo.outputCurrencyAmountRaw
        : typeInfo.expectedOutputCurrencyAmountRaw

    const inputAddress = currencyIdToAddress(typeInfo.inputCurrencyId)
    const outputAddress = currencyIdToAddress(typeInfo.outputCurrencyId)

    const inputAsset: CurrencyAsset = {
      address: inputAddress,
      chainId,
      type: AssetType.Currency,
    }

    const outputAsset: CurrencyAsset = {
      address: outputAddress,
      chainId,
      type: AssetType.Currency,
    }

    const exactCurrencyField =
      typeInfo.tradeType === TradeType.EXACT_INPUT ? CurrencyField.INPUT : CurrencyField.OUTPUT

    const exactAmount =
      exactCurrencyField === CurrencyField.INPUT
        ? tryParseRawAmount(inputCurrencyAmountRaw, inputCurrency)
        : tryParseRawAmount(outputCurrencyAmountRaw, outputCurrency)

    const swapFormState: TransactionState = {
      [CurrencyField.INPUT]: inputAsset,
      [CurrencyField.OUTPUT]: outputAsset,
      exactCurrencyField,
      exactAmountToken: exactAmount?.toExact() ?? '',
    }

    return swapFormState
  } catch (error: any) {
    logger.info('hooks', 'useRecreateSwapFormState', error?.message)
    return undefined
  }
}

/**
 * Used to synchronously create wrap form state given a transaction and relevant currencies.
 */
export function createWrapFormStateFromDetails({
  transactionDetails,
  inputCurrency,
  outputCurrency,
}: props) {
  const txHash = transactionDetails?.hash
  const chainId = transactionDetails?.chainId

  if (!chainId || !txHash || !inputCurrency || !outputCurrency) return undefined

  try {
    const { typeInfo } = transactionDetails

    if (typeInfo.type !== TransactionType.Wrap) {
      throw new Error(
        `Tx hash ${txHash} does not correspond to a wrap tx. It is of type ${typeInfo.type}`
      )
    }

    const currencyAmountRaw = typeInfo.currencyAmountRaw

    const inputAddress = currencyAddress(inputCurrency)
    const outputAddress = currencyAddress(outputCurrency)

    const inputAsset: CurrencyAsset = {
      address: inputAddress,
      chainId,
      type: AssetType.Currency,
    }

    const outputAsset: CurrencyAsset = {
      address: outputAddress,
      chainId,
      type: AssetType.Currency,
    }

    const exactAmount = tryParseRawAmount(currencyAmountRaw, inputCurrency)

    const swapFormState: TransactionState = {
      [CurrencyField.INPUT]: inputAsset,
      [CurrencyField.OUTPUT]: outputAsset,
      exactCurrencyField: CurrencyField.INPUT,
      exactAmountToken: exactAmount?.toExact() ?? '',
    }

    return swapFormState
  } catch (error: any) {
    logger.info('hooks', 'useCreateWrapFormState', error?.message)
    return undefined
  }
}
