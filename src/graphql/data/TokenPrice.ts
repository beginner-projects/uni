import graphql from 'babel-plugin-relay/macro'
import { useEffect, useMemo, useState } from 'react'
import { fetchQuery } from 'react-relay'

import { Chain, TokenPriceQuery } from './__generated__/TokenPriceQuery.graphql'
import environment from './RelayEnvironment'
import { TimePeriod } from './util'

const tokenPriceQuery = graphql`
  query TokenPriceQuery($contract: ContractInput!) {
    tokens(contracts: [$contract]) {
      market(currency: USD) {
        priceHistory1H: priceHistory(duration: HOUR) {
          timestamp
          value
        }
        priceHistory1D: priceHistory(duration: DAY) {
          timestamp
          value
        }
        priceHistory1W: priceHistory(duration: WEEK) {
          timestamp
          value
        }
        priceHistory1M: priceHistory(duration: MONTH) {
          timestamp
          value
        }
        priceHistory1Y: priceHistory(duration: YEAR) {
          timestamp
          value
        }
      }
    }
  }
`

export type PricePoint = { timestamp: number; value: number }
export type PriceDurations = Partial<Record<TimePeriod, PricePoint[]>>

export function isPricePoint(p: { timestamp: number; value: number | null } | null): p is PricePoint {
  return Boolean(p && p.value)
}

/*
export function filterPrices(prices: NonNullable<NonNullable<TokenQueryData>['market']>['priceHistory'] | undefined) {
  return prices?.filter((p): p is PricePoint => Boolean(p && p.value))
}
*/

export function useTokenPriceQuery(address: string, chain: Chain): PriceDurations {
  const contract = useMemo(() => ({ address: address.toLowerCase(), chain }), [address, chain])
  const [prices, setPrices] = useState<PriceDurations>({})

  useEffect(() => {
    const subscription = fetchQuery<TokenPriceQuery>(environment, tokenPriceQuery, { contract }).subscribe({
      next: (response: TokenPriceQuery['response']) => {
        const priceData = response.tokens?.[0]?.market
        const prices = {
          [TimePeriod.HOUR]: priceData?.priceHistory1H?.filter(isPricePoint),
          [TimePeriod.DAY]: priceData?.priceHistory1D?.filter(isPricePoint),
          [TimePeriod.WEEK]: priceData?.priceHistory1W?.filter(isPricePoint),
          [TimePeriod.MONTH]: priceData?.priceHistory1M?.filter(isPricePoint),
          [TimePeriod.YEAR]: priceData?.priceHistory1Y?.filter(isPricePoint),
        }
        setPrices(prices)
      },
    })
    return () => {
      setPrices({})
      subscription.unsubscribe()
    }
  }, [contract])

  return prices
}
