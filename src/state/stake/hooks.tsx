import { Interface } from '@ethersproject/abi'
import StakingRewardsJSON from '@uniswap/liquidity-staker/build/StakingRewards.json'
import { ChainId, CurrencyAmount, Token } from '@uniswap/sdk-core'
import { Pair } from '@uniswap/v2-sdk'
import { useWeb3React } from '@web3-react/core'
import { GRG } from 'constants/tokens'
import useCurrentBlockTimestamp from 'hooks/useCurrentBlockTimestamp'
import JSBI from 'jsbi'
import {
  NEVER_RELOAD,
  useMultipleContractSingleData,
  useSingleCallResult,
  useSingleContractMultipleData,
} from 'lib/hooks/multicall'
import { useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { StakeStatus, useStakingContract, useStakingProxyContract } from 'state/governance/hooks'
import { usePoolExtendedContract } from 'state/pool/hooks'
import { calculateGasMargin } from 'utils/calculateGasMargin'

import { DAI, UNI, USDC_MAINNET, USDT, WBTC, WRAPPED_NATIVE_CURRENCY } from '../../constants/tokens'

const STAKING_REWARDS_INTERFACE = new Interface(StakingRewardsJSON.abi)

export const STAKING_GENESIS = 1600387200

const STAKING_REWARDS_INFO: {
  [chainId: number]: {
    tokens: [Token, Token]
    stakingRewardAddress: string
  }[]
} = {
  1: [
    {
      tokens: [WRAPPED_NATIVE_CURRENCY[ChainId.MAINNET] as Token, DAI],
      stakingRewardAddress: '0xa1484C3aa22a66C62b77E0AE78E15258bd0cB711',
    },
    {
      tokens: [WRAPPED_NATIVE_CURRENCY[ChainId.MAINNET] as Token, USDC_MAINNET],
      stakingRewardAddress: '0x7FBa4B8Dc5E7616e59622806932DBea72537A56b',
    },
    {
      tokens: [WRAPPED_NATIVE_CURRENCY[ChainId.MAINNET] as Token, USDT],
      stakingRewardAddress: '0x6C3e4cb2E96B01F4b866965A91ed4437839A121a',
    },
    {
      tokens: [WRAPPED_NATIVE_CURRENCY[ChainId.MAINNET] as Token, WBTC],
      stakingRewardAddress: '0xCA35e32e7926b96A9988f61d510E038108d8068e',
    },
  ],
}

interface StakingInfo {
  // the address of the reward contract
  stakingRewardAddress: string
  // the tokens involved in this pair
  tokens: [Token, Token]
  // the amount of token currently staked, or undefined if no account
  stakedAmount: CurrencyAmount<Token>
  // the amount of reward token earned by the active account, or undefined if no account
  earnedAmount: CurrencyAmount<Token>
  // the total amount of token staked in the contract
  totalStakedAmount: CurrencyAmount<Token>
  // the amount of token distributed per second to all LPs, constant
  totalRewardRate: CurrencyAmount<Token>
  // the current amount of token distributed to the active account per second.
  // equivalent to percent of total supply * reward rate
  rewardRate: CurrencyAmount<Token>
  // when the period ends
  periodFinish?: Date
  // if pool is active
  active: boolean
  // calculates a hypothetical amount of token distributed to the active account per second.
  getHypotheticalRewardRate: (
    stakedAmount: CurrencyAmount<Token>,
    totalStakedAmount: CurrencyAmount<Token>,
    totalRewardRate: CurrencyAmount<Token>
  ) => CurrencyAmount<Token>
}

// gets the staking info from the network for the active chain id
export function useStakingInfo(pairToFilterBy?: Pair | null): StakingInfo[] {
  const { chainId, account } = useWeb3React()

  // detect if staking is ended
  const currentBlockTimestamp = useCurrentBlockTimestamp()

  const info = useMemo(
    () =>
      chainId
        ? STAKING_REWARDS_INFO[chainId]?.filter((stakingRewardInfo) =>
            pairToFilterBy === undefined
              ? true
              : pairToFilterBy === null
              ? false
              : pairToFilterBy.involvesToken(stakingRewardInfo.tokens[0]) &&
                pairToFilterBy.involvesToken(stakingRewardInfo.tokens[1])
          ) ?? []
        : [],
    [chainId, pairToFilterBy]
  )

  const uni = chainId ? UNI[chainId] : undefined

  const rewardsAddresses = useMemo(() => info.map(({ stakingRewardAddress }) => stakingRewardAddress), [info])

  const accountArg = useMemo(() => [account ?? undefined], [account])

  // get all the info from the staking rewards contracts
  const balances = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'balanceOf', accountArg)
  const earnedAmounts = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'earned', accountArg)
  const totalSupplies = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'totalSupply')

  // tokens per second, constants
  const rewardRates = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'rewardRate',
    undefined,
    NEVER_RELOAD
  )
  const periodFinishes = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'periodFinish',
    undefined,
    NEVER_RELOAD
  )

  return useMemo(() => {
    if (!chainId || !uni) return []

    return rewardsAddresses.reduce<StakingInfo[]>((memo, rewardsAddress, index) => {
      // these two are dependent on account
      const balanceState = balances[index]
      const earnedAmountState = earnedAmounts[index]

      // these get fetched regardless of account
      const totalSupplyState = totalSupplies[index]
      const rewardRateState = rewardRates[index]
      const periodFinishState = periodFinishes[index]

      if (
        // these may be undefined if not logged in
        !balanceState?.loading &&
        !earnedAmountState?.loading &&
        // always need these
        totalSupplyState &&
        !totalSupplyState.loading &&
        rewardRateState &&
        !rewardRateState.loading &&
        periodFinishState &&
        !periodFinishState.loading
      ) {
        if (
          balanceState?.error ||
          earnedAmountState?.error ||
          totalSupplyState.error ||
          rewardRateState.error ||
          periodFinishState.error
        ) {
          console.error('Failed to load staking rewards info')
          return memo
        }

        // get the LP token
        const tokens = info[index].tokens
        const dummyPair = new Pair(
          CurrencyAmount.fromRawAmount(tokens[0], '0'),
          CurrencyAmount.fromRawAmount(tokens[1], '0')
        )

        // check for account, if no account set to 0

        const stakedAmount = CurrencyAmount.fromRawAmount(
          dummyPair.liquidityToken,
          JSBI.BigInt(balanceState?.result?.[0] ?? 0)
        )
        const totalStakedAmount = CurrencyAmount.fromRawAmount(
          dummyPair.liquidityToken,
          JSBI.BigInt(totalSupplyState.result?.[0])
        )
        const totalRewardRate = CurrencyAmount.fromRawAmount(uni, JSBI.BigInt(rewardRateState.result?.[0]))

        const getHypotheticalRewardRate = (
          stakedAmount: CurrencyAmount<Token>,
          totalStakedAmount: CurrencyAmount<Token>,
          totalRewardRate: CurrencyAmount<Token>
        ): CurrencyAmount<Token> => {
          return CurrencyAmount.fromRawAmount(
            uni,
            JSBI.greaterThan(totalStakedAmount.quotient, JSBI.BigInt(0))
              ? JSBI.divide(JSBI.multiply(totalRewardRate.quotient, stakedAmount.quotient), totalStakedAmount.quotient)
              : JSBI.BigInt(0)
          )
        }

        const individualRewardRate = getHypotheticalRewardRate(stakedAmount, totalStakedAmount, totalRewardRate)

        const periodFinishSeconds = periodFinishState.result?.[0]?.toNumber()
        const periodFinishMs = periodFinishSeconds * 1000

        // compare period end timestamp vs current block timestamp (in seconds)
        const active =
          periodFinishSeconds && currentBlockTimestamp ? periodFinishSeconds > currentBlockTimestamp.toNumber() : true

        memo.push({
          stakingRewardAddress: rewardsAddress,
          tokens: info[index].tokens,
          periodFinish: periodFinishMs > 0 ? new Date(periodFinishMs) : undefined,
          earnedAmount: CurrencyAmount.fromRawAmount(uni, JSBI.BigInt(earnedAmountState?.result?.[0] ?? 0)),
          rewardRate: individualRewardRate,
          totalRewardRate,
          stakedAmount,
          totalStakedAmount,
          getHypotheticalRewardRate,
          active,
        })
      }
      return memo
    }, [])
  }, [
    balances,
    chainId,
    currentBlockTimestamp,
    earnedAmounts,
    info,
    periodFinishes,
    rewardRates,
    rewardsAddresses,
    totalSupplies,
    uni,
  ])
}

export function useFreeStakeBalance(): CurrencyAmount<Token> | undefined {
  const { account, chainId } = useWeb3React()
  const grg = useMemo(() => (chainId ? GRG[chainId] : undefined), [chainId])
  const stakingContract = useStakingContract()
  const { poolAddress: poolAddressFromUrl } = useParams<{ poolAddress?: string }>()
  // TODO: check if can improve as whenever there is an address in the url the pool's balance will be checked
  const freeStake = useSingleCallResult(stakingContract ?? undefined, 'getOwnerStakeByStatus', [
    poolAddressFromUrl ?? account,
    StakeStatus.UNDELEGATED,
  ])?.result?.[0]

  return freeStake && grg ? CurrencyAmount.fromRawAmount(grg, freeStake.currentEpochBalance) : undefined
}

interface UnclaimedRewardsData {
  yieldAmount: CurrencyAmount<Token>
  yieldPoolId: string
}

// TODO: check as from pool page we are passing [] if not pool operator, i.e. we want to skip the rpc call when normal user
export function useUnclaimedRewards(poolIds: string[]): UnclaimedRewardsData[] | undefined {
  const { account, chainId } = useWeb3React()
  const grg = useMemo(() => (chainId ? GRG[chainId] : undefined), [chainId])
  const stakingContract = useStakingContract()
  const { poolAddress: poolAddressFromUrl } = useParams<{ poolAddress?: string }>()
  //const members = Array(poolIds.length).fill(poolAddressFromUrl ?? account)
  const farmer = poolAddressFromUrl ?? account
  // TODO: check if can improve as whenever there is an address in the url the pool's balance will be checked
  //  we should check the logic of appending pool address as we should also append its pool id, but will result
  //  in a duplicate id, however the positive reward filter will return that id either for user or for pool, never both
  //  [poolIds, poolAddressFromUrl ? [...members, ...poolAddressFromUrl] : members]
  const inputs = useMemo(() => {
    return poolIds.map((poolId) => {
      return [poolId, farmer]
    })
  }, [farmer, poolIds])

  const unclaimedRewards = useSingleContractMultipleData(
    stakingContract ?? undefined,
    'computeRewardBalanceOfDelegator',
    inputs
  )

  return useMemo(() => {
    if (!unclaimedRewards || !grg) return undefined
    return unclaimedRewards
      .map((reward, i) => {
        const value = reward?.result?.[0]
        return {
          yieldAmount: CurrencyAmount.fromRawAmount(grg, value ?? JSBI.BigInt(0)),
          yieldPoolId: poolIds[i],
        }
      })
      .filter((p) => JSBI.greaterThan(p.yieldAmount.quotient, JSBI.BigInt(0)))
  }, [grg, unclaimedRewards, poolIds])
}

interface UserStakeData {
  stake: CurrencyAmount<Token>
  hasStake: boolean
}

export function useUserStakeBalances(poolIds: string[]): UserStakeData[] | undefined {
  const { account, chainId } = useWeb3React()
  const grg = useMemo(() => (chainId ? GRG[chainId] : undefined), [chainId])
  const stakingContract = useStakingContract()

  const inputs = useMemo(() => {
    return poolIds.map((poolId) => {
      return [account, poolId]
    })
  }, [account, poolIds])

  const userStakeBalances = useSingleContractMultipleData(
    stakingContract ?? undefined,
    'getStakeDelegatedToPoolByOwner',
    inputs
  )

  return useMemo(() => {
    if (!userStakeBalances || !grg) return undefined
    return userStakeBalances.map((balance) => {
      const stake = balance?.result?.[0].nextEpochBalance
      const stakeAmount = CurrencyAmount.fromRawAmount(grg, stake ?? JSBI.BigInt(0))
      return {
        stake: stakeAmount,
        hasStake: JSBI.greaterThan(stakeAmount.quotient, JSBI.BigInt(0)),
      }
    })
  }, [grg, userStakeBalances])
}

export function useUnstakeCallback(): (amount: CurrencyAmount<Token>, isPool?: boolean) => undefined | Promise<string> {
  const { account, chainId, provider } = useWeb3React()
  const stakingContract = useStakingContract()
  const { poolAddress: poolAddressFromUrl } = useParams<{ poolAddress?: string }>()
  const poolContract = usePoolExtendedContract(poolAddressFromUrl ?? undefined)

  return useCallback(
    (amount: CurrencyAmount<Token>, isPool?: boolean) => {
      if (!provider || !chainId || !account) return undefined
      if (!stakingContract) throw new Error('No Staking Proxy Contract!')
      if (isPool && !poolContract) throw new Error('No Pool Contract!')
      if (!isPool) {
        return stakingContract.estimateGas.unstake(amount.quotient.toString(), {}).then((estimatedGasLimit) => {
          return stakingContract.unstake(amount.quotient.toString(), {
            value: null,
            gasLimit: calculateGasMargin(estimatedGasLimit),
          })
        })
      } else {
        return poolContract?.estimateGas.unstake(amount.quotient.toString(), {}).then((estimatedGasLimit) => {
          return poolContract?.unstake(amount.quotient.toString(), {
            value: null,
            gasLimit: calculateGasMargin(estimatedGasLimit),
          })
        })
      }
    },
    [account, chainId, provider, poolContract, stakingContract]
  )
}

export function useHarvestCallback(): (poolIds: string[], isPool?: boolean) => undefined | Promise<string> {
  const { account, chainId, provider } = useWeb3React()
  const stakingContract = useStakingContract()
  const stakingProxy = useStakingProxyContract()
  const { poolAddress: poolAddressFromUrl } = useParams<{ poolAddress?: string }>()
  const poolContract = usePoolExtendedContract(poolAddressFromUrl ?? undefined)
  // TODO: encode transaction and batch execute for user

  return useCallback(
    (poolIds: string[], isPool?: boolean) => {
      if (!provider || !chainId || !account) return undefined
      if (!stakingContract || !stakingProxy) throw new Error('No Staking Proxy Contract!')
      if (isPool && !poolContract) throw new Error('No Pool Contract!')
      const harvestCalls: string[] = []
      // when withdrawing pool rewards we will pass an array of only 1 pool ids
      // TODO: we encode pool calls but do not use them as we want to use direct method instead of multicall.
      //  Check if should remove encoding call for pool.
      for (const poolId of poolIds) {
        const harvestCall = !isPool
          ? stakingContract.interface.encodeFunctionData('withdrawDelegatorRewards', [poolId])
          : poolContract?.interface.encodeFunctionData('withdrawDelegatorRewards')
        if (harvestCall) harvestCalls.push(harvestCall)
      }
      if (!isPool) {
        return stakingProxy.estimateGas.batchExecute(harvestCalls, {}).then((estimatedGasLimit) => {
          return stakingProxy.batchExecute(harvestCalls, {
            value: null,
            gasLimit: calculateGasMargin(estimatedGasLimit),
          })
        })
      } else {
        return poolContract?.estimateGas.withdrawDelegatorRewards({}).then((estimatedGasLimit) => {
          return poolContract?.withdrawDelegatorRewards({
            value: null,
            gasLimit: calculateGasMargin(estimatedGasLimit),
          })
        })
      }
    },
    [account, chainId, provider, poolContract, stakingContract, stakingProxy]
  )
}
