import { JSBI, Pair, TokenAmount } from '@uniswap/sdk'
import React from 'react'
import { FixedSizeList } from 'react-window'
import { Text } from 'rebass'
import { ButtonPrimary } from '../Button'
import DoubleTokenLogo from '../DoubleLogo'
import { RowFixed } from '../Row'
import { MenuItem, PaddedColumn } from './styleds'

export function PairList({
  pairs,
  focusTokenAddress,
  pairBalances,
  onSelectPair,
  onAddLiquidity = onSelectPair
}: {
  pairs: Pair[]
  focusTokenAddress?: string
  pairBalances: { [pairAddress: string]: TokenAmount }
  onSelectPair: (pair: Pair) => void
  onAddLiquidity: (pair: Pair) => void
}) {
  if (pairs.length === 0) {
    return (
      <PaddedColumn justify="center">
        <Text>No Pools Found</Text>
      </PaddedColumn>
    )
  }

  return (
    <FixedSizeList itemSize={54} height={254} itemCount={pairs.length} width="100%">
      {({ index, style }) => {
        const pair = pairs[index]

        // reset ordering to help scan search results
        const tokenA = focusTokenAddress === pair.token1.address ? pair.token1 : pair.token0
        const tokenB = tokenA === pair.token0 ? pair.token1 : pair.token0

        const pairAddress = pair.liquidityToken.address
        const balance = pairBalances[pairAddress]?.toSignificant(6)
        const zeroBalance = pairBalances[pairAddress]?.raw && JSBI.equal(pairBalances[pairAddress].raw, JSBI.BigInt(0))

        const selectPair = () => onSelectPair(pair)
        const addLiquidity = () => onAddLiquidity(pair)

        return (
          <MenuItem style={style} onClick={selectPair}>
            <RowFixed>
              <DoubleTokenLogo a0={tokenA.address} a1={tokenB.address} size={24} margin={true} />
              <Text fontWeight={500} fontSize={16}>{`${tokenA.symbol}/${tokenB.symbol}`}</Text>
            </RowFixed>

            <ButtonPrimary padding={'6px 8px'} width={'fit-content'} borderRadius={'12px'} onClick={addLiquidity}>
              {balance ? (zeroBalance ? 'Join' : 'Add Liquidity') : 'Join'}
            </ButtonPrimary>
          </MenuItem>
        )
      }}
    </FixedSizeList>
  )
}
