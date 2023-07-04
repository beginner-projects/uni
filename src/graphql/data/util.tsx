import { QueryResult } from '@apollo/client'
import { Currency, Token } from '@uniswap/sdk-core'
import { SupportedChainId } from 'constants/chains'
import { NATIVE_CHAIN_ID, nativeOnChain, WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'
import ms from 'ms.macro'
import { useEffect } from 'react'
import { getNativeTokenDBAddress } from 'utils/nativeTokens'

import { Chain, ContractInput, HistoryDuration, TokenStandard } from './__generated__/types-and-hooks'

export enum PollingInterval {
  Slow = ms`5m`,
  Normal = ms`1m`,
  Fast = ms`12s`, // 12 seconds, block times for mainnet
  LightningMcQueen = ms`3s`, // 3 seconds, approx block times for polygon
}

// Polls a query only when the current component is mounted, as useQuery's pollInterval prop will continue to poll after unmount
export function usePollQueryWhileMounted<T, K>(queryResult: QueryResult<T, K>, interval: PollingInterval) {
  const { startPolling, stopPolling } = queryResult

  useEffect(() => {
    startPolling(interval)
    return stopPolling
  }, [interval, startPolling, stopPolling])

  return queryResult
}

export enum TimePeriod {
  HOUR,
  DAY,
  WEEK,
  MONTH,
  YEAR,
}

export function toHistoryDuration(timePeriod: TimePeriod): HistoryDuration {
  switch (timePeriod) {
    case TimePeriod.HOUR:
      return HistoryDuration.Hour
    case TimePeriod.DAY:
      return HistoryDuration.Day
    case TimePeriod.WEEK:
      return HistoryDuration.Week
    case TimePeriod.MONTH:
      return HistoryDuration.Month
    case TimePeriod.YEAR:
      return HistoryDuration.Year
  }
}

export type PricePoint = { timestamp: number; value: number }

export function isPricePoint(p: PricePoint | null): p is PricePoint {
  return p !== null
}

const UX_SUPPORTED_GQL_CHAINS = [
  Chain.Ethereum,
  Chain.EthereumGoerli,
  Chain.EthereumSepolia,
  Chain.Polygon,
  Chain.Celo,
  Chain.Optimism,
  Chain.Arbitrum,
  Chain.Bnb,
] as const
type InterfaceGqlChain = typeof UX_SUPPORTED_GQL_CHAINS[number]

export const CHAIN_ID_TO_BACKEND_NAME: { [key: number]: InterfaceGqlChain } = {
  [SupportedChainId.MAINNET]: Chain.Ethereum,
  [SupportedChainId.GOERLI]: Chain.EthereumGoerli,
  [SupportedChainId.SEPOLIA]: Chain.EthereumSepolia,
  [SupportedChainId.POLYGON]: Chain.Polygon,
  [SupportedChainId.POLYGON_MUMBAI]: Chain.Polygon,
  [SupportedChainId.CELO]: Chain.Celo,
  [SupportedChainId.CELO_ALFAJORES]: Chain.Celo,
  [SupportedChainId.ARBITRUM_ONE]: Chain.Arbitrum,
  [SupportedChainId.ARBITRUM_GOERLI]: Chain.Arbitrum,
  [SupportedChainId.OPTIMISM]: Chain.Optimism,
  [SupportedChainId.OPTIMISM_GOERLI]: Chain.Optimism,
  [SupportedChainId.BNB]: Chain.Bnb,
}

export function chainIdToBackendName(chainId: number | undefined) {
  return chainId && CHAIN_ID_TO_BACKEND_NAME[chainId]
    ? CHAIN_ID_TO_BACKEND_NAME[chainId]
    : CHAIN_ID_TO_BACKEND_NAME[SupportedChainId.MAINNET]
}

const GQL_CHAINS: number[] = [
  SupportedChainId.MAINNET,
  SupportedChainId.OPTIMISM,
  SupportedChainId.POLYGON,
  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.CELO,
]

export function isGqlSupportedChain(chainId: number | undefined): chainId is SupportedChainId {
  return !!chainId && GQL_CHAINS.includes(chainId)
}
export function toContractInput(currency: Currency): ContractInput {
  const chain = chainIdToBackendName(currency.chainId)
  return { chain, address: currency.isToken ? currency.address : getNativeTokenDBAddress(chain) }
}

export function gqlToCurrency(token: {
  address?: string
  chain: Chain
  standard?: TokenStandard
  decimals?: number
  name?: string
  symbol?: string
}): Currency | undefined {
  const chainId = fromGraphQLChain(token.chain)
  if (!chainId) return undefined
  if (token.standard === TokenStandard.Native || !token.address) return nativeOnChain(chainId)
  else return new Token(chainId, token.address, token.decimals ?? 18, token.name, token.symbol)
}

const URL_CHAIN_PARAM_TO_BACKEND: { [key: string]: Chain } = {
  ethereum: Chain.Ethereum,
  polygon: Chain.Polygon,
  celo: Chain.Celo,
  arbitrum: Chain.Arbitrum,
  optimism: Chain.Optimism,
  bnb: Chain.Bnb,
}

export function validateUrlChainParam(chainName: string | undefined) {
  return chainName && URL_CHAIN_PARAM_TO_BACKEND[chainName] ? URL_CHAIN_PARAM_TO_BACKEND[chainName] : Chain.Ethereum
}

const CHAIN_NAME_TO_CHAIN_ID: { [key in InterfaceGqlChain]: SupportedChainId } = {
  [Chain.Ethereum]: SupportedChainId.MAINNET,
  [Chain.EthereumGoerli]: SupportedChainId.GOERLI,
  [Chain.EthereumSepolia]: SupportedChainId.SEPOLIA,
  [Chain.Polygon]: SupportedChainId.POLYGON,
  [Chain.Celo]: SupportedChainId.CELO,
  [Chain.Optimism]: SupportedChainId.OPTIMISM,
  [Chain.Arbitrum]: SupportedChainId.ARBITRUM_ONE,
  [Chain.Bnb]: SupportedChainId.BNB,
}

export function isSupportedGQLChain(chain: Chain): chain is InterfaceGqlChain {
  return (UX_SUPPORTED_GQL_CHAINS as ReadonlyArray<Chain>).includes(chain)
}

export function fromGraphQLChain(chain: Chain): SupportedChainId | undefined {
  return isSupportedGQLChain(chain) ? CHAIN_NAME_TO_CHAIN_ID[chain] : undefined
}

export const BACKEND_CHAIN_NAMES: Chain[] = [Chain.Ethereum, Chain.Polygon, Chain.Optimism, Chain.Arbitrum, Chain.Celo]

export function getTokenDetailsURL({
  address,
  chain,
  inputAddress,
}: {
  address?: string | null
  chain: Chain
  inputAddress?: string | null
}) {
  const chainName = chain.toLowerCase()
  const tokenAddress = address ?? NATIVE_CHAIN_ID
  const inputAddressSuffix = inputAddress ? `?inputCurrency=${inputAddress}` : ''
  return `/tokens/${chainName}/${tokenAddress}${inputAddressSuffix}`
}

export function unwrapToken<
  T extends {
    address?: string | null
  } | null
>(chainId: number, token: T): T {
  if (!token?.address) return token

  const address = token.address.toLowerCase()
  const nativeAddress = WRAPPED_NATIVE_CURRENCY[chainId]?.address.toLowerCase()
  if (address !== nativeAddress) return token

  const nativeToken = nativeOnChain(chainId)
  return {
    ...token,
    ...nativeToken,
    address: NATIVE_CHAIN_ID,
    extensions: undefined, // prevents marking cross-chain wrapped tokens as native
  }
}
