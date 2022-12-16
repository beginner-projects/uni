import TokenDetails from 'components/Tokens/TokenDetails'
import { TokenDetailsPageSkeleton } from 'components/Tokens/TokenDetails/Skeleton'
import { NATIVE_CHAIN_ID, nativeOnChain } from 'constants/tokens'
import { useTokenQueryQuery } from 'graphql/data/__generated__/types-and-hooks'
import { TokenPriceQuery, tokenPriceQuery } from 'graphql/data/TokenPrice'
import { CHAIN_NAME_TO_CHAIN_ID, TimePeriod, toHistoryDuration, validateUrlChainParam } from 'graphql/data/util'
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { useCallback, useMemo } from 'react'
import { useQueryLoader } from 'react-relay'
import { useParams } from 'react-router-dom'

export const pageTimePeriodAtom = atomWithStorage<TimePeriod>('tokenDetailsTimePeriod', TimePeriod.DAY)

export default function TokenDetailsPage() {
  const { tokenAddress, chainName } = useParams<{ tokenAddress?: string; chainName?: string }>()
  const chain = validateUrlChainParam(chainName)
  const pageChainId = CHAIN_NAME_TO_CHAIN_ID[chain]
  const isNative = tokenAddress === NATIVE_CHAIN_ID
  const [timePeriod, setTimePeriod] = useAtom(pageTimePeriodAtom)
  const [contract, duration] = useMemo(
    () => [
      { address: isNative ? nativeOnChain(pageChainId).wrapped.address : tokenAddress ?? '', chain },
      toHistoryDuration(timePeriod),
    ],
    [chain, isNative, pageChainId, timePeriod, tokenAddress]
  )

  const { data, loading } = useTokenQueryQuery({
    variables: {
      contract,
    },
  })

  const [priceQueryReference, loadPriceQuery] = useQueryLoader<TokenPriceQuery>(tokenPriceQuery)

  const refetchTokenPrices = useCallback(
    (t: TimePeriod) => {
      loadPriceQuery({ contract, duration: toHistoryDuration(t) })
      setTimePeriod(t)
    },
    [contract, loadPriceQuery, setTimePeriod]
  )

  return loading || !data ? (
    <TokenDetailsPageSkeleton />
  ) : (
    <TokenDetails
      urlAddress={tokenAddress}
      chain={chain}
      tokenQuery={data}
      priceQueryReference={priceQueryReference}
      refetchTokenPrices={refetchTokenPrices}
    />
  )
}
