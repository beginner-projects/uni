import { ArrowDownCircle, ChevronDown, ToggleLeft } from 'react-feather'
import Badge, { BadgeVariant } from 'components/Badge'
import { CHAIN_INFO, L2_CHAIN_IDS, SupportedChainId, SupportedL2ChainId } from '../../constants/chains'
import { ExternalLink, TYPE } from 'theme'
import styled, { css } from 'styled-components/macro'
import { useEffect, useRef, useState } from 'react'

import { Trans } from '@lingui/macro'
import { YellowCard } from 'components/Card'
import { switchToNetwork } from 'utils/switchToNetwork'
import { useActiveWeb3React } from 'hooks/web3'
import { useOnClickOutside } from 'hooks/useOnClickOutside'

const BaseWrapper = css`
  position: relative;
  margin-right: 8px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    justify-self: end;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 0 0.5rem 0 0;
    width: initial;
    text-overflow: ellipsis;
    flex-shrink: 1;
  `};
`
const L2Wrapper = styled.div`
  ${BaseWrapper}
`
const BaseMenuItem = css`
  align-items: center;
  background-color: transparent;
  border-radius: 12px;
  color: ${({ theme }) => theme.text2};
  cursor: pointer;
  display: flex;
  flex: 1;
  flex-direction: row;
  font-size: 16px;
  font-weight: 400;
  justify-content: space-between;
  :hover {
    color: ${({ theme }) => theme.text1};
    text-decoration: none;
  }
`
const DisabledMenuItem = styled.div`
  ${BaseMenuItem}
  align-items: center;
  background-color: ${({ theme }) => theme.bg2};
  cursor: auto;
  display: flex;
  font-size: 10px;
  font-style: italic;
  justify-content: center;
  :hover,
  :active,
  :focus {
    color: ${({ theme }) => theme.text2};
  }
`
const FallbackWrapper = styled(YellowCard)`
  ${BaseWrapper}
  width: auto;
  border-radius: 12px;
  padding: 8px 12px;
  width: 100%;
`
const Icon = styled.img`
  width: 16px;
  margin-right: 2px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
  margin-right: 4px;

  `};
`

const MenuFlyout = styled.span`
  background-color: ${({ theme }) => theme.bg1};
  border: 1px solid ${({ theme }) => theme.bg0};

  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  position: absolute;
  left: 0rem;
  top: 3rem;
  z-index: 100;
  width: 237px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
   
    bottom: unset;
    top: 4.5em
    right: 0;

  `};
  > {
    padding: 12px;
  }
  > :not(:first-child) {
    margin-top: 8px;
  }
  > :not(:last-child) {
    margin-bottom: 8px;
  }
`
const LinkOutCircle = styled(ArrowDownCircle)`
  transform: rotate(230deg);
  width: 16px;
  height: 16px;
  opacity: 0.6;
`
const MenuItem = styled(ExternalLink)`
  ${BaseMenuItem}
`
const ButtonMenuItem = styled.button`
  ${BaseMenuItem}
  border: none;
  box-shadow: none;
  color: ${({ theme }) => theme.text2};
  outline: none;
  padding: 0;
`
const NetworkInfo = styled.button<{ chainId: SupportedChainId }>`
  align-items: center;
  background: ${({ theme }) => theme.bg1};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.bg1};
  color: ${({ theme }) => theme.text1};
  display: flex;
  flex-direction: row;
  font-weight: 500;
  font-size: 12px;
  height: 100%;
  margin: 0;
  height: 38px;
  padding: 0.7rem;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    border: 1px solid ${({ theme }) => theme.bg3};
  }
`
const NetworkName = styled.div<{ chainId: SupportedChainId }>`
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  padding: 0 2px 0.5px 4px;
  margin: 0 2px;
  white-space: pre;
  ${({ theme }) => theme.mediaWidth.upToSmall`
   display: none;
  `};
`

export default function NetworkCard() {
  const { chainId, library } = useActiveWeb3React()
  const node = useRef<HTMLDivElement>(null)
  const open = useModalOpen(ApplicationModal.ARBITRUM_OPTIONS)
  const toggle = useToggleModal(ApplicationModal.ARBITRUM_OPTIONS)
  useOnClickOutside(node, open ? toggle : undefined)
  const info = CHAIN_INFO[chainId as SupportedL2ChainId]


  if (!chainId || !info || !library) {
    return null
  }

    const isArbitrum = [SupportedChainId.ARBITRUM_ONE, SupportedChainId.ARBITRUM_RINKEBY].includes(chainId)
    return (
      <L2Wrapper ref={node}>
        <NetworkInfo onClick={toggle} chainId={chainId}>
          <Icon src={info.logoUrl} />
          <NetworkName chainId={chainId}>{info.label}</NetworkName>
          <ChevronDown size={16} style={{ marginTop: '2px' }} strokeWidth={2.5} />
        </NetworkInfo>
        {open && (
          <MenuFlyout>
            { (
              <ButtonMenuItem onClick={() => {
                let chainIdToSwitch = SupportedChainId.MAINNET;
                if(chainId === 1) chainIdToSwitch = SupportedChainId.BINANCE;
                switchToNetwork({ library, chainId: chainIdToSwitch })
              }}>
                <div>
                    {chainId === 56 ? <TYPE.small>Switch to ETH </TYPE.small> : null} 
                    {chainId === 1 ? <TYPE.small>Switch to BSC </TYPE.small> : null}
                </div>
                <TYPE.small>
                { chainId === 56 ? <Badge variant={BadgeVariant.GREY}>MAINNET</Badge> : null}
                { chainId === 1 ? <Badge variant={BadgeVariant.WARNING}>BINANCE</Badge> : null}
                </TYPE.small> 
                <ToggleLeft opacity={0.6} size={16} />
              </ButtonMenuItem>
            )}
          </MenuFlyout>
        )}
      </L2Wrapper>
    )

  return <FallbackWrapper title={info.label}>{info.label}</FallbackWrapper>
}
