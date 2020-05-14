import { Contract } from '@ethersproject/contracts'
import { Token, TokenAmount, Pair, Trade, ChainId, WETH, Route, TradeType, Percent } from '@uniswap/sdk'
import useSWR from 'swr'
import { useWeb3React } from '@web3-react/core'

import IUniswapV1Factory from '../constants/abis/v1_factory.json'
import { V1_FACTORY_ADDRESS } from '../constants'
import { useContract } from '../hooks'
import { SWRKeys } from '.'
import { useETHBalances, useTokenBalances } from '../state/wallet/hooks'

function getV1PairAddress(contract: Contract): (tokenAddress: string) => Promise<string> {
  return async (tokenAddress: string): Promise<string> => contract.getExchange(tokenAddress)
}

function useV1PairAddress(tokenAddress: string) {
  const { chainId } = useWeb3React()
  const contract = useContract(V1_FACTORY_ADDRESS, IUniswapV1Factory, false)
  const shouldFetch = chainId === ChainId.MAINNET && typeof tokenAddress === 'string' && !!contract

  const { data } = useSWR(shouldFetch ? [tokenAddress, SWRKeys.V1PairAddress] : null, getV1PairAddress(contract), {
    // don't need to update this data
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  })

  return data
}

function useMockV1Pair(token?: Token) {
  const isWETH = token?.equals(WETH[token?.chainId])

  // will only return an address on mainnet, and not for WETH
  const v1PairAddress = useV1PairAddress(isWETH ? undefined : token?.address)
  const tokenBalance = useTokenBalances(v1PairAddress, [token])[token?.address]
  const ETHBalance = useETHBalances([v1PairAddress])[v1PairAddress]

  return tokenBalance && ETHBalance
    ? new Pair(tokenBalance, new TokenAmount(WETH[token?.chainId], ETHBalance.toString()))
    : undefined
}

export function useV1TradeLinkIfBetter(trade: Trade, minimumDelta: Percent = new Percent('0')): string {
  const inputPair = useMockV1Pair(trade?.route?.input)
  const outputPair = useMockV1Pair(trade?.route?.output)

  const mainnet = trade?.route?.input?.chainId === ChainId.MAINNET
  const inputIsWETH = mainnet && trade?.route?.input?.equals(WETH[ChainId.MAINNET])
  const outputIsWETH = mainnet && trade?.route?.output?.equals(WETH[ChainId.MAINNET])
  const neitherWETH = mainnet && !!trade && !inputIsWETH && !outputIsWETH

  let pairs: Pair[]
  if (inputIsWETH && outputPair) {
    pairs = [outputPair]
  } else if (outputIsWETH && inputPair) {
    pairs = [inputPair]
  } else if (neitherWETH && inputPair && outputPair) {
    pairs = [inputPair, outputPair]
  }

  const route = pairs && new Route(pairs, trade.route.input)
  const v1Trade =
    route &&
    new Trade(
      route,
      trade.tradeType === TradeType.EXACT_INPUT ? trade.inputAmount : trade.outputAmount,
      trade.tradeType
    )

  const v1HasBetterRate = v1Trade?.slippage?.add(minimumDelta)?.lessThan(trade?.slippage)

  return v1HasBetterRate
    ? `https://v1.uniswap.exchange/swap?inputCurrency=${
        inputIsWETH ? 'ETH' : trade.route.input.address
      }&outputCurrency=${outputIsWETH ? 'ETH' : trade.route.output.address}`
    : undefined
}
