import { t } from '@lingui/macro'
import { formatNumber, NumberType } from '@uniswap/conedison/format'
import { useWeb3React } from '@web3-react/core'
import { ButtonLight } from 'components/Button'
import Column from 'components/Column'
import QueryTokenLogo from 'components/Logo/QueryTokenLogo'
import Row from 'components/Row'
import { formatDelta } from 'components/Tokens/TokenDetails/PriceChart'
import { PortfolioBalancesQuery, usePortfolioBalancesQuery } from 'graphql/data/__generated__/types-and-hooks'
import { CHAIN_NAME_TO_CHAIN_ID, getTokenDetailsURL } from 'graphql/data/util'
import useSelectChain from 'hooks/useSelectChain'
import { useAtomValue } from 'jotai/utils'
import { EmptyWalletContent } from 'nft/components/profile/view/EmptyWalletContent'
import { useCallback, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import styled from 'styled-components/macro'
import { EllipsisStyle, ThemedText } from 'theme'

import { useToggleWalletDrawer } from '..'
import { PortfolioArrow } from '../AuthenticatedHeader'
import { hideSmallBalancesAtom } from '../SmallBalanceToggle'
import { HiddenTokensRow } from './HiddenTokensRow'
import { EmptyWalletContainer } from './NFTs'
import PortfolioRow, { PortfolioSkeleton, PortfolioTabWrapper } from './PortfolioRow'

const HIDE_SMALL_USD_BALANCES_THRESHOLD = 1

const HiddenTokensContainer = styled(Column)<{ numItems: number; $expanded: boolean }>`
  height: ${({ numItems, $expanded }) => ($expanded ? numItems * 68 + 'px' : 0)};
  transition: ${({ theme }) => `height ${theme.transition.duration.medium} ease-in-out`};
  overflow: hidden;
`

function meetsThreshold(tokenBalance: TokenBalance, hideSmallBalances: boolean) {
  return !hideSmallBalances || (tokenBalance.denominatedValue?.value ?? 0) > HIDE_SMALL_USD_BALANCES_THRESHOLD
}

export default function Tokens({ account }: { account: string }) {
  const hideSmallBalances = useAtomValue(hideSmallBalancesAtom)
  const [showHiddenTokens, setShowHiddenTokens] = useState(false)

  const { data, loading } = usePortfolioBalancesQuery({
    variables: { ownerAddress: account },
  })
  const toggleWalletDrawer = useToggleWalletDrawer()

  const visibleTokens = useMemo(() => {
    return !hideSmallBalances
      ? data?.portfolios?.[0].tokenBalances ?? []
      : data?.portfolios?.[0].tokenBalances?.filter((tokenBalance) =>
          meetsThreshold(tokenBalance, hideSmallBalances)
        ) ?? []
  }, [data?.portfolios, hideSmallBalances])

  const hiddenTokens = useMemo(() => {
    return !hideSmallBalances
      ? []
      : data?.portfolios?.[0].tokenBalances?.filter(
          (tokenBalance) => !meetsThreshold(tokenBalance, hideSmallBalances)
        ) ?? []
  }, [data?.portfolios, hideSmallBalances])

  if (!data && loading) {
    return <PortfolioSkeleton />
  }

  if (data?.portfolios?.[0].tokenBalances?.length === 0) {
    return (
      <EmptyWalletContainer>
        <EmptyWalletContent type="token" onNavigateClick={toggleWalletDrawer} />
      </EmptyWalletContainer>
    )
  }

  return (
    <PortfolioTabWrapper>
      {visibleTokens.map(
        (tokenBalance) =>
          tokenBalance.token &&
          meetsThreshold(tokenBalance, hideSmallBalances) && (
            <TokenRow key={tokenBalance.id} {...tokenBalance} token={tokenBalance.token} />
          )
      )}
      {hiddenTokens.length > 0 && (
        <>
          <HiddenTokensRow
            numHidden={hiddenTokens.length}
            isExpanded={showHiddenTokens}
            onPress={() => {
              setShowHiddenTokens((showHiddenTokens) => !showHiddenTokens)
            }}
          />
          <HiddenTokensContainer numItems={hiddenTokens.length} $expanded={showHiddenTokens}>
            {hiddenTokens.map(
              (tokenBalance) =>
                tokenBalance.token && <TokenRow key={tokenBalance.id} {...tokenBalance} token={tokenBalance.token} />
            )}
          </HiddenTokensContainer>
        </>
      )}
    </PortfolioTabWrapper>
  )
}

const TokenBalanceText = styled(ThemedText.BodySecondary)`
  ${EllipsisStyle}
`

type TokenBalance = NonNullable<
  NonNullable<NonNullable<PortfolioBalancesQuery['portfolios']>[number]>['tokenBalances']
>[number]

type PortfolioToken = NonNullable<TokenBalance['token']>

function TokenRow({ token, quantity, denominatedValue }: TokenBalance & { token: PortfolioToken }) {
  const [showSwap, setShowSwap] = useState(false)
  const percentChange = token.market?.pricePercentChange?.value ?? 0

  const navigate = useNavigate()
  const toggleWalletDrawer = useToggleWalletDrawer()
  const navigateToTokenDetails = useCallback(async () => {
    navigate(getTokenDetailsURL(token))
    toggleWalletDrawer()
  }, [navigate, token, toggleWalletDrawer])

  return (
    <PortfolioRow
      setIsHover={setShowSwap}
      left={<QueryTokenLogo token={token} size="40px" />}
      title={<ThemedText.SubHeader fontWeight={500}>{token?.name}</ThemedText.SubHeader>}
      descriptor={
        <TokenBalanceText>
          {formatNumber(quantity, NumberType.TokenNonTx)} {token?.symbol}
        </TokenBalanceText>
      }
      onClick={navigateToTokenDetails}
      right={
        showSwap ? (
          <MiniSwapButton token={token} />
        ) : (
          denominatedValue && (
            <>
              <ThemedText.SubHeader fontWeight={500}>
                {formatNumber(denominatedValue?.value, NumberType.PortfolioBalance)}
              </ThemedText.SubHeader>
              <Row justify="flex-end">
                <PortfolioArrow change={percentChange} size={20} strokeWidth={1.75} />
                <ThemedText.BodySecondary>{formatDelta(percentChange)}</ThemedText.BodySecondary>
              </Row>
            </>
          )
        )
      }
    />
  )
}

function MiniSwapButton({ token }: { token: PortfolioToken }) {
  const navigate = useNavigate()
  const toggleWalletDrawer = useToggleWalletDrawer()
  const selectChain = useSelectChain()
  const { chainId } = useWeb3React()
  const { pathname, search } = useLocation()

  const navigateToSwap = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation()
      const targetChainId = CHAIN_NAME_TO_CHAIN_ID[token.chain]
      if (targetChainId !== chainId) {
        await selectChain(targetChainId)
      }
      toggleWalletDrawer()
      if (pathname.startsWith('/swap') && search.includes('?inputCurrency=' + token.address)) {
        // hard-refresh the page to reset the swap state, since we're already at the destination and navigating won't update the state
        navigate(0)
      } else {
        navigate(
          {
            pathname: '/swap',
            search: token.address ? '?inputCurrency=' + token.address : '',
          },
          {
            replace: pathname.startsWith('/swap'),
          }
        )
      }
    },
    [chainId, navigate, pathname, search, selectChain, toggleWalletDrawer, token.address, token.chain]
  )

  return (
    <ButtonLight onClick={navigateToSwap} width="fit-content" padding="8px" $borderRadius="12px">
      <ThemedText.Link>{t`Swap`}</ThemedText.Link>
    </ButtonLight>
  )
}
