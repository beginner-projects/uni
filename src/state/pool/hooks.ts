import { Interface } from '@ethersproject/abi'
import { isAddress } from '@ethersproject/address'
import { Contract } from '@ethersproject/contracts'
import type { TransactionResponse } from '@ethersproject/providers'
import { parseBytes32String } from '@ethersproject/strings'
import { useWeb3React } from '@web3-react/core'
import POOL_EXTENDED_ABI from 'abis/pool-extended.json'
import RB_POOL_FACTORY_ABI from 'abis/rb-pool-factory.json'
import RB_REGISTRY_ABI from 'abis/rb-registry.json'
import { RB_FACTORY_ADDRESSES, RB_REGISTRY_ADDRESSES } from 'constants/addresses'
import { useContract } from 'hooks/useContract'
import { useSingleCallResult /*, useSingleContractMultipleData*/ } from 'lib/hooks/multicall'
import { useCallback, useMemo } from 'react'
import { useAppSelector } from 'state/hooks'
import { calculateGasMargin } from 'utils/calculateGasMargin'

import { SupportedChainId } from '../../constants/chains'
import { AppState } from '../index'
import { useLogs } from '../logs/hooks'
import { useTransactionAdder } from '../transactions/hooks'
import { TransactionType } from '../transactions/types'

const RegistryInterface = new Interface(RB_REGISTRY_ABI)

// TODO: create pool state in ../index and create pool reducer if we want to store pool data in state
// actually we do want to store them in state as we want to query pool address and name from state
//  check variable renaming to avoid confusion with liquidity pools
export function usePoolState(): AppState['swap'] {
  return useAppSelector((state) => state.swap)
}

export function useRegistryContract(): Contract | null {
  return useContract(RB_REGISTRY_ADDRESSES, RB_REGISTRY_ABI, true)
}

function usePoolFactoryContract(): Contract | null {
  return useContract(RB_FACTORY_ADDRESSES, RB_POOL_FACTORY_ABI, true)
}

export function usePoolExtendedContract(poolAddress: string | undefined): Contract | null {
  return useContract(poolAddress, POOL_EXTENDED_ABI, true)
}

export interface PoolRegisteredLog {
  group: string
  pool: string
  name: string
  symbol: string
  id: string
}

export interface PoolData {
  name: string
  symbol: string
  decimals: number
  owner: string
  baseToken: string
}

// TODO: we must send array of pool addresses and query owners in a multicall, otherwise events query make 1 call per created pool
export function usePoolOperator(poolAddress: string | undefined): string | undefined {
  const contract = usePoolExtendedContract(poolAddress)
  const { result } = useSingleCallResult(contract, 'getPool')

  return result?.[3]?.toString()
}

/**
 * Need pool events to get list of pools by owner.
 */
export function useFormattedPoolCreatedLogs(
  contract: Contract | null,
  operator?: string | undefined,
  fromBlock?: number,
  toBlock?: number
): PoolRegisteredLog[] | undefined {
  // create filters for ProposalCreated events
  const filter = useMemo(() => {
    const filter = contract?.filters?.Registered()
    if (!filter) return undefined
    return {
      ...filter,
      fromBlock,
      toBlock,
    }
  }, [contract, fromBlock, toBlock])

  const useLogsResult = useLogs(filter)

  return useMemo(() => {
    return (
      useLogsResult?.logs
        ?.map((log) => {
          const parsed = RegistryInterface.parseLog(log).args
          return parsed
        })
        //.filter((p) => p.governorIndex === governorIndex)?.find((p) => p.id === id)
        //?.filter((parsed) => indices.flat().some((i) => i === parsed.id.toNumber()))
        // TODO: filter by pool operator, if cannot do efficient hook must query all "Pool Initialized"
        // events, filtered by group, then map those owned, but must add pools that changed ownership
        //.filter((parsed) => usePoolOperator(parsed.address) === operator)
        ?.map((parsed) => {
          // TODO: can simply pass the array from above
          const group = parsed.group
          const pool = parsed.pool
          const name = parseBytes32String(parsed.name)
          const symbol = parseBytes32String(parsed.symbol)
          const id = parsed.id //.toString()

          return { group, pool, name, symbol, id }
        })
        .reverse()
    )
  }, [useLogsResult])
}

export function useAllPoolsData(): { data: PoolRegisteredLog[]; loading: boolean } {
  const { account, chainId } = useWeb3React()
  const registry = useRegistryContract()

  // get metadata from past events
  let registryStartBlock

  if (chainId === SupportedChainId.MAINNET) {
    registryStartBlock = 15834693
  } else if (chainId === SupportedChainId.GOERLI) {
    registryStartBlock = 7807806
  } else if (chainId === SupportedChainId.ARBITRUM_ONE) {
    registryStartBlock = 35439804
  } else if (chainId === SupportedChainId.OPTIMISM) {
    registryStartBlock = 34629059
  } else if (chainId === SupportedChainId.POLYGON) {
    registryStartBlock = 35228892
  }

  // we want to be able to filter by account
  const formattedLogsV1: PoolRegisteredLog[] | undefined = useFormattedPoolCreatedLogs(
    registry,
    account,
    registryStartBlock
  )

  // early return until events are fetched
  return useMemo(() => {
    const formattedLogs = [...(formattedLogsV1 ?? [])]

    if (registry && !formattedLogs) {
      return { data: [], loading: true }
    }

    return { data: formattedLogs, loading: false }
  }, [formattedLogsV1, registry])
}

export function useCreateCallback(): (
  name: string | undefined,
  symbol: string | undefined,
  baseCurrency: string | undefined
) => undefined | Promise<string> {
  const { account, chainId, provider } = useWeb3React()
  const addTransaction = useTransactionAdder()
  const factoryContract = usePoolFactoryContract()

  return useCallback(
    (name: string | undefined, symbol: string | undefined, baseCurrency: string | undefined) => {
      //if (!provider || !chainId || !account || name === '' || symbol === '' || !isAddress(baseCurrency ?? ''))
      if (!provider || !chainId || !account || !name || !symbol || !isAddress(baseCurrency ?? '')) return undefined
      if (!factoryContract) throw new Error('No Factory Contract!')
      // TODO: check correctness of asserting is address before returning on no address
      if (!baseCurrency) return
      return factoryContract.estimateGas.createPool(name, symbol, baseCurrency, {}).then((estimatedGasLimit) => {
        return factoryContract
          .createPool(name, symbol, baseCurrency, { value: null, gasLimit: calculateGasMargin(estimatedGasLimit) })
          .then((response: TransactionResponse) => {
            addTransaction(response, {
              // TODO: define correct transaction type
              type: TransactionType.DELEGATE,
              delegatee: baseCurrency,
            })
            return response.hash
          })
      })
    },
    [account, addTransaction, chainId, provider, factoryContract]
  )
}
