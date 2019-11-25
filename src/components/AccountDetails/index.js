import React from 'react'
import styled from 'styled-components'
import { useWeb3React } from '@web3-react/core'
import { isMobile } from 'react-device-detect'
import { transparentize } from 'polished'
import Copy from './Copy'
import Transaction from './Transaction'
import { SUPPORTED_WALLETS } from '../../constants'
import { ReactComponent as Close } from '../../assets/images/x.svg'
import { getEtherscanLink } from '../../utils'
import { Link } from '../../theme'

const OptionButton = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  justify-content: center;
  align-items: center;
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.royalBlue};
  color: ${({ theme }) => theme.royalBlue};
  padding: 8px 24px;

  &:hover {
    border: 1px solid ${({ theme }) => theme.malibuBlue};
    cursor: pointer;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 12px;
  `};
`

const HeaderRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  padding: 1.5rem 2rem;
  font-weight: 500;
  color: ${props => (props.color === 'blue' ? ({ theme }) => theme.royalBlue : 'inherit')};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
  `};
`

const UpperSection = styled.div`
  position: relative;
  background-color: ${({ theme }) => theme.concreteGray};

  h5 {
    margin: 0;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    font-weight: 400;
  }

  h5:last-child {
    margin-bottom: 0px;
  }

  h4 {
    margin-top: 0;
    font-weight: 500;
  }
`

const InfoCard = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.placeholderGray};
  border-radius: 20px;
  box-shadow: 0 4px 8px 0 ${({ theme }) => transparentize(0.95, theme.shadowColor)};
`

const AccountGroupingRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  color: ${({ theme }) => theme.royalBlue};

  div {
    ${({ theme }) => theme.flexRowNoWrap}
    align-items: center;
  }

  &:first-of-type {
    margin-bottom: 20px;
  }
`

const AccountSection = styled.div`
  background-color: ${({ theme }) => theme.concreteGray};
  padding: 0rem 2rem;
  ${({ theme }) => theme.mediaWidth.upToMedium`padding: 0rem 1rem 1rem 1rem;`};
`

const YourAccount = styled.div`
  h5 {
    margin: 0 0 1rem 0;
    font-weight: 400;
  }

  h4 {
    margin: 0;
    font-weight: 500;
  }
`

const GreenCircle = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  justify-content: center;
  align-items: center;

  &:first-child {
    height: 8px;
    width: 8px;
    margin-left: 12px;
    background-color: ${({ theme }) => theme.connectedGreen};
    border-radius: 50%;
  }
`

const GreenText = styled.div`
  color: ${({ theme }) => theme.connectedGreen};
`

const LowerSection = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  padding: 2rem;
  flex-grow: 1;
  overflow: auto;

  h5 {
    margin: 0;
    font-weight: 400;
    color: ${({ theme }) => theme.doveGray};
  }
`

const AccountControl = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  align-items: center;
  min-width: 0;

  font-weight: ${({ hasENS, isENS }) => (hasENS ? (isENS ? 500 : 400) : 500)};
  font-size: ${({ hasENS, isENS }) => (hasENS ? (isENS ? '1rem' : '0.8rem') : '1rem')};

  a:hover {
    text-decoration: underline;
  }

  a {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`

const ConnectButtonRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  justify-content: center;
  margin: 30px;
`

const StyledLink = styled(Link)`
  color: ${({ hasENS, isENS, theme }) => (hasENS ? (isENS ? theme.royalBlue : theme.doveGray) : theme.royalBlue)};
`

const CloseIcon = styled.div`
  position: absolute;
  right: 1rem;
  top: 14px;
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
`

const CloseColor = styled(Close)`
  path {
    stroke: ${({ theme }) => theme.chaliceGray};
  }
`

const TransactionListWrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
`

function renderTransactions(transactions, pending) {
  return (
    <TransactionListWrapper>
      {transactions.map((hash, i) => {
        return <Transaction key={i} hash={hash} pending={pending} />
      })}
    </TransactionListWrapper>
  )
}

export default function AccountDetails({
  toggleWalletModal,
  pendingTransactions,
  confirmedTransactions,
  ENSName,
  openOptions
}) {
  const { chainId, account, connector } = useWeb3React()

  function formatConnectorName() {
    let name = ''
    Object.keys(SUPPORTED_WALLETS).map(key => {
      if (SUPPORTED_WALLETS[key].connector === connector) {
        name = SUPPORTED_WALLETS[key].name
      }
      return true
    })
    return name
  }

  const UpperSectionCloseable = props => {
    return (
      <UpperSection>
        <CloseIcon onClick={toggleWalletModal}>
          <CloseColor alt={'close icon'} />
        </CloseIcon>
        {props.children}
      </UpperSection>
    )
  }

  return (
    <>
      <UpperSectionCloseable>
        <HeaderRow>Account</HeaderRow>
        <AccountSection>
          <YourAccount>
            <InfoCard>
              <AccountGroupingRow>
                {formatConnectorName()}
                <GreenText>
                  Connected
                  <GreenCircle>
                    <div />
                  </GreenCircle>
                </GreenText>
              </AccountGroupingRow>
              <AccountGroupingRow>
                {ENSName ? (
                  <AccountControl hasENS={!!ENSName} isENS={true}>
                    <StyledLink hasENS={!!ENSName} isENS={true} href={getEtherscanLink(chainId, ENSName, 'address')}>
                      {ENSName} ↗{' '}
                    </StyledLink>
                    <Copy toCopy={ENSName} />
                  </AccountControl>
                ) : (
                  <AccountControl hasENS={!!ENSName} isENS={false}>
                    <StyledLink hasENS={!!ENSName} isENS={false} href={getEtherscanLink(chainId, account, 'address')}>
                      {account} ↗{' '}
                    </StyledLink>
                    <Copy toCopy={account} />
                  </AccountControl>
                )}
              </AccountGroupingRow>
            </InfoCard>
          </YourAccount>
          {!isMobile && (
            <ConnectButtonRow>
              <OptionButton
                onClick={() => {
                  openOptions()
                }}
              >
                Connect to a different wallet
              </OptionButton>
            </ConnectButtonRow>
          )}
        </AccountSection>
      </UpperSectionCloseable>
      {!!pendingTransactions.length || !!confirmedTransactions.length ? (
        <LowerSection>
          <h5>Recent Transactions</h5>
          {renderTransactions(pendingTransactions, true)}
          {renderTransactions(confirmedTransactions, false)}
        </LowerSection>
      ) : (
        <LowerSection>
          <h5>Your transactions will appear here...</h5>
        </LowerSection>
      )}
    </>
  )
}
