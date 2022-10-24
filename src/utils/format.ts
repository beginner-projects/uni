import { Currency, CurrencyAmount, Percent, Price } from '@uniswap/sdk-core'

// Number formatting in our app should follow the guide in this doc:
// https://www.notion.so/uniswaplabs/Number-standards-fbb9f533f10e4e22820722c2f66d23c0

const FIVE_DECIMALS_MAX_TWO_DECIMALS_MIN = new Intl.NumberFormat('en-US', {
  notation: 'standard',
  maximumFractionDigits: 5,
  minimumFractionDigits: 2,
})

const THREE_DECIMALS = new Intl.NumberFormat('en-US', {
  notation: 'standard',
  maximumFractionDigits: 3,
  minimumFractionDigits: 3,
})

const THREE_DECIMALS_USD = new Intl.NumberFormat('en-US', {
  notation: 'standard',
  maximumFractionDigits: 3,
  minimumFractionDigits: 3,
  currency: 'USD',
  style: 'currency',
})

const TWO_DECIMALS = new Intl.NumberFormat('en-US', {
  notation: 'standard',
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
})

const TWO_DECIMALS_USD = new Intl.NumberFormat('en-US', {
  notation: 'standard',
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
  currency: 'USD',
  style: 'currency',
})

const SHORTHAND = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const SHORTHAND_USD = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  minimumFractionDigits: 2,
  currency: 'USD',
  style: 'currency',
})

const SCIENTIFIC = new Intl.NumberFormat('en-US', {
  notation: 'scientific',
  maximumSignificantDigits: 3,
})

const SCIENTIFIC_USD = new Intl.NumberFormat('en-US', {
  notation: 'scientific',
  maximumSignificantDigits: 3,
  currency: 'USD',
  style: 'currency',
})

const SIX_SIG_FIGS_TWO_DECIMALS = new Intl.NumberFormat('en-US', {
  notation: 'standard',
  maximumSignificantDigits: 6,
  minimumSignificantDigits: 3,
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
})

const THREE_SIG_FIGS_USD = new Intl.NumberFormat('en-US', {
  notation: 'standard',
  maximumSignificantDigits: 3,
  currency: 'USD',
  style: 'currency',
})

type Format = Intl.NumberFormat | string
type FormatterRule = { upperBound: number; formatter: Format }

// these formatter objects dictate which formatter rule to use based on the interval that
// the number falls into. for example, based on the rule set below, if your number
// falls between 1 and 1e6, you'd use TWO_DECIMALS as the formatter.
const tokenNonTxFormatters: FormatterRule[] = [
  { upperBound: 0.001, formatter: '<0.001' },
  { upperBound: 1, formatter: THREE_DECIMALS },
  { upperBound: 1e6, formatter: TWO_DECIMALS },
  { upperBound: 1e15, formatter: SHORTHAND },
  { upperBound: Infinity, formatter: SCIENTIFIC },
]

const tokenTxFormatters: FormatterRule[] = [
  { upperBound: 0.00001, formatter: '<0.00001' },
  { upperBound: 1, formatter: FIVE_DECIMALS_MAX_TWO_DECIMALS_MIN },
  { upperBound: 10000, formatter: SIX_SIG_FIGS_TWO_DECIMALS },
  { upperBound: Infinity, formatter: TWO_DECIMALS },
]

const fiatTokenDetailsFormatter: FormatterRule[] = [
  { upperBound: 0.000001, formatter: SCIENTIFIC_USD },
  { upperBound: 0.1, formatter: THREE_SIG_FIGS_USD },
  { upperBound: 1.05, formatter: THREE_DECIMALS_USD },
  { upperBound: 1e6, formatter: TWO_DECIMALS_USD },
  { upperBound: Infinity, formatter: SHORTHAND_USD },
]

const fiatTokenPricesFormatter: FormatterRule[] = [
  { upperBound: 0.000001, formatter: SCIENTIFIC_USD },
  { upperBound: 1, formatter: THREE_SIG_FIGS_USD },
  { upperBound: 1e6, formatter: TWO_DECIMALS_USD },
  { upperBound: Infinity, formatter: SHORTHAND_USD },
]

const fiatGasPriceFormatter: FormatterRule[] = [
  { upperBound: 0.01, formatter: '<$0.01' },
  { upperBound: 1e6, formatter: TWO_DECIMALS_USD },
  { upperBound: Infinity, formatter: SHORTHAND_USD },
]

export enum NumberType {
  // used for token quantities in non-transaction contexts (e.g. portfolio balances)
  TokenNonTx = 'token-non-tx',

  // used for token quantities in transaction contexts (e.g. swap, send)
  TokenTx = 'token-tx',

  // fiat prices in any component that belongs in the Token Details flow
  FiatTokenDetails = 'fiat-token-details',

  // fiat prices everyone except Token Details flow
  FiatTokenPrice = 'fiat-token-price',

  // fiat price of token balances
  FiatTokenQuantity = 'fiat-token-quantity',

  // fiat gas prices
  FiatGasPrice = 'fiat-gas-price',
}

const TYPE_TO_FORMATTER_RULES = {
  [NumberType.TokenNonTx]: tokenNonTxFormatters,
  [NumberType.TokenTx]: tokenTxFormatters,
  // fiat token quantities follow same rules as gas prices
  [NumberType.FiatTokenQuantity]: fiatGasPriceFormatter,
  [NumberType.FiatTokenDetails]: fiatTokenDetailsFormatter,
  [NumberType.FiatTokenPrice]: fiatTokenPricesFormatter,
  [NumberType.FiatGasPrice]: fiatGasPriceFormatter,
}

function getFormatterRule(input: number, type: NumberType) {
  const rules = TYPE_TO_FORMATTER_RULES[type]
  for (let i = 0; i < rules.length; i++) {
    if (input < rules[i].upperBound) {
      return rules[i].formatter
    }
  }

  throw new Error(`formatter for type ${type} not configured correctly`)
}

export function formatNumber(input?: number | null, type: NumberType = NumberType.TokenNonTx) {
  if (input === null || input === undefined) {
    return '-'
  }

  const formatter = getFormatterRule(input, type)
  if (typeof formatter === 'string') return formatter
  return formatter.format(input)
}

export function formatCurrencyAmount(
  amount?: CurrencyAmount<Currency> | null,
  type: NumberType = NumberType.TokenNonTx
) {
  return formatNumber(amount ? parseFloat(amount.toSignificant()) : undefined, type)
}

export function formatPriceImpact(priceImpact: Percent | undefined) {
  if (!priceImpact) return '-'

  return `${priceImpact.multiply(-1).toFixed(3)}%`
}

export function formatPrice(
  price?: Price<Currency, Currency> | null,
  type: NumberType = NumberType.FiatTokenPrice
) {
  if (price === null || price === undefined) {
    return '-'
  }

  return formatNumber(parseFloat(price.toSignificant()), type)
}

/**
 * Very simple date formatter
 * Feel free to add more options / adapt to your needs.
 */
export function formatDate(date: Date) {
  return date.toLocaleString('en-US', {
    day: 'numeric', // numeric, 2-digit
    year: 'numeric', // numeric, 2-digit
    month: 'short', // numeric, 2-digit, long, short, narrow
    hour: 'numeric', // numeric, 2-digit
    minute: 'numeric', // numeric, 2-digit
  })
}

function formatNumberOrString(price: NullUndefined<number | string>, type: NumberType) {
  if (price === null || price === undefined) return '-'
  if (typeof price === 'string') return formatNumber(parseFloat(price), type)
  return formatNumber(price, type)
}

export function formatUSDPrice(
  price: NullUndefined<number | string>,
  type: NumberType = NumberType.FiatTokenPrice
) {
  return formatNumberOrString(price, type)
}

export function formatNFTFloorPrice(num: NullUndefined<number>) {
  if (!num) {
    return '-'
  }

  if (num === 0) {
    return '0'
  }

  if (num < 0.001) {
    return '<0.001'
  }

  if (num < 1) {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 3 }).format(num)
  }

  if (num < 1000000) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num)
  }

  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}
