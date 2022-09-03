/* eslint-disable */
import 'react-pro-sidebar/dist/css/styles.css';
import '@coreui/coreui/dist/css/coreui.css'

import { ArrowLeftCircle, ArrowRightCircle, BarChart2, ChevronDown, ChevronUp, Globe, Heart, PieChart, RefreshCcw, RefreshCw, Repeat, Search, ToggleLeft, ToggleRight, TrendingDown, TrendingUp, Twitter } from 'react-feather'
import Badge, { BadgeVariant } from 'components/Badge';
import { BurntKiba, abbreviateNumber } from 'components/BurntKiba';
import { Currency, CurrencyAmount, Token, WETH9 } from '@uniswap/sdk-core';
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink';
import { ExternalLink, StyledInternalLink, TYPE, } from 'theme';
import { Menu, MenuItem, ProSidebar, SidebarContent, SidebarFooter, SidebarHeader, SubMenu } from 'react-pro-sidebar';
import { RowBetween, RowFixed } from 'components/Row';
import {darken, lighten} from 'polished'
import styled, { keyframes, useTheme } from 'styled-components/macro'
import { useBscToken, useCurrency, useToken } from 'hooks/Tokens';
import { useHolderCount, useTokenHolderCount, useTokenInfo } from 'components/swap/ChartPage'

import { CTooltip } from '@coreui/react'
import Card from 'components/Card';
import Copy from '../AccountDetails/Copy'
import CurrencyLogo from 'components/CurrencyLogo';
import { FiatValue } from '../../components/CurrencyInputPanel/FiatValue'
import { Link } from 'react-router-dom';
import { LoadingSkeleton } from 'pages/Pool/styleds';
import { PairSearch } from 'pages/Charts/PairSearch';
import React from 'react';
import { SwapTokenForToken } from 'pages/Swap/SwapTokenForToken';
import { Trans } from '@lingui/macro'
import _ from 'lodash'
import { toChecksum } from 'state/logs/utils';
import { useKiba } from 'pages/Vote/VotePage';
import { useTokenBalance } from 'state/wallet/hooks';
import { useTotalSupply } from 'hooks/useTotalSupply';
import { useWeb3React } from '@web3-react/core';

const rotate360 = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`
const Spinner = styled.div`
  animation: ${rotate360} 1s cubic-bezier(0.83, 0, 0.17, 1) infinite;
  transform: translateZ(0);
  display:flex;
  justify-content:center;
  margin-top:15px;
  margin-bottom:15px;
  text-aligncenter;
  border-top: 1px solid transparent;
  border-right: 1px solid transparent;
  border-bottom: 1px solid transparent;
  border-left: 2px solid ${({ theme }) => theme.green1};
  background: transparent;
  width: 14px;
  height: 14px;
  border-radius: 50%;

  left: -3px;
  top: -3px;
`

const Wrapper = styled.div`
background: ${props => props.theme.chartSidebar};
color: ${props => props.theme.text1};

.pro-sidebar.collapsed .pro-menu > ul > .pro-menu-item.pro-sub-menu > .pro-inner-list-item {
    max-width:300px;
}
.pro-sidebar {
    color ${props => props.theme.text1};
}
.pro-sidebar .pro-menu .pro-menu-item.pro-sub-menu > .pro-inner-item > .pro-arrow-wrapper .pro-arrow {
    border-color ${props => props.theme.text1};
}
.pro-icon {
    color: ${props => props.theme.text1};
}
.pro-sidebar .pro-menu a:before {
    content: inherit;
}
.pro-sidebar .pro-menu .pro-menu-item > .pro-inner-item:focus {
    outline: none;
    color: ${props => props.theme.text2};
}
.pro-sidebar .pro-menu .prop-menu-item {
    line-height: 1.25rem;
    font-size: 13.25px;
}
.pro-sidebar > .pro-sidebar-inner > .pro-sidebar-layout .pro-sidebar-header {
    border-bottom:${props => props.theme.text1};
}
.pro-sidebar .pro-menu .pro-menu-item.pro-sub-menu .pro-inner-list-item {
    padding-left: 0;
    padding-top:0;
}
.pro-sidebar .pro-menu > ul > .pro-sub-menu > .pro-inner-list-item > div > ul {
    padding-top:15px;
    padding-bottom:15px;
    background: ${props => props.theme.chartSidebar};
    color: ${props => props.theme.text1};
}

.pro-sidebar .pro-menu .pro-menu-item > .pro-inner-item:hover {
    color: ${props => lighten(0.1, props.theme.text1)};
    transition: ease in 0.1s;
}

.pro-sidebar .pro-menu.shaped .pro-menu-item > .pro-inner-item > .pro-icon-wrapper {
    background:transparent !important;
    background-color:transparent !important;
}
`


type ChartSidebarProps = {
    tokenCurrency?:Currency | null;
    token: {
        name: string
        symbol: string
        address: string
        decimals: string
    }
    holdings: {
        token: Token | any;
        tokenBalance: CurrencyAmount<Token> | undefined | number | any;
        tokenValue: CurrencyAmount<Token> | undefined | any;
        formattedUsdString?: (string | undefined)[]
        refetchUsdValue?: () => void
        pair?: string
    }
    tokenData: any
    chainId?: number
    onCollapse: (collapsed: boolean) => void
    collapsed: boolean;
    loading: boolean;
    screenerToken?: any
    tokenInfo?:any
}
const _ChartSidebar = React.memo(function (props: ChartSidebarProps) {
    const { token, holdings, tokenCurrency: _tokenCurrency, screenerToken, tokenData, chainId, collapsed, onCollapse, loading, tokenInfo } = props

    //state
    const [componentLoading, setComponentLoading] = React.useState(loading)
    const [statsOpen, setStatsOpen] = React.useState(true)
    const [quickNavOpen, setQuickNavOpen] = React.useState(false)
    const tokenCurrency =  _tokenCurrency ? _tokenCurrency :  token && token.decimals && token.address ? new Token(chainId ?? 1, token.address, +token.decimals, token.symbol, token.name) : {} as Token
    const [swapOpen, setSwapOpen] = React.useState(false)

    const toggleSwapOpen = (swapOpen: boolean) => {
        setSwapOpen(swapOpen)

        if (swapOpen) {
            setStatsOpen(false)
            setQuickNavOpen(false)
        }
    }
    // hooks
    const { account } = useWeb3React()
    const totalSupply = useTotalSupply(tokenCurrency)
    const deadKiba = useKiba('0x000000000000000000000000000000000000dead')
    const _bscToken = useBscToken(chainId == 56 ? token.address : undefined)
    const amountBurnt = useTokenBalance('0x000000000000000000000000000000000000dead', chainId == 56 ? _bscToken as Token : token as any ?? undefined)
    const holderCount = useTokenHolderCount(token.address, chainId)

    //create a custom function that will change menucollapse state from false to true and true to false
    const menuIconClick = () => {
        //condition checking to change state from true to false and vice versa
        collapsed ? onCollapse(false) : onCollapse(true);
    };

    // Memos
    const totalSupplyInt = React.useMemo(() => {
        if (tokenInfo && tokenInfo?.totalSupply && tokenInfo.totalSupply.valueOf() && _.isNumber(tokenInfo?.totalSupply))
            return parseFloat(tokenInfo?.totalSupply?.toFixed(0));
        if (totalSupply) {
            return parseFloat(totalSupply.toFixed(0))
        }
        return 0
    }, [tokenInfo?.totalSupply, totalSupply])

    const formattedPrice = React.useMemo(() => {
        //console.log(`trying to get price--`, tokenInfo?.price, tokenData?.priceUSD)
        if (tokenData && tokenData.priceUSD) {
            //console.info(`Using uniswap v2 price -- its always much more up - to - date`, tokenData)
            return `$${parseFloat(parseFloat(tokenData.priceUSD).toFixed(18)).toFixed(18)}`
        }
        if (tokenInfo && tokenInfo.price && tokenInfo.price.rate) {
            //console.info(`Fallback to etherapi price -- not as  up - to - date, but better than nothing`, tokenData)
            return `$${tokenInfo.price.rate.toFixed(18)}`
        }

        return `-`
    }, [tokenInfo?.price, token, tokenData])

    const totalLiquidity = React.useMemo(() => {
        return tokenData && tokenData?.totalLiquidityUSD ? Number(tokenData?.totalLiquidityUSD * 2) : undefined
    }, [tokenData])

    const transactionCount = React.useMemo(() => {
        return tokenData && tokenData?.txCount ? tokenData?.txCount : undefined
    }, [tokenData])

    const hasData = React.useMemo(() => !!tokenData && !!token && !!token.name && !!token.address && !!token.symbol, [tokenData, token])

    const marketCap = React.useMemo(() => {
        if (!totalSupplyInt || totalSupplyInt === 0) return ''
        const hasTokenData = !!tokenData?.priceUSD
        const hasTokenInfo = !!tokenInfo?.price && !!tokenInfo?.price?.rate
        if (!hasTokenInfo && !hasTokenData) return ''
        const price = tokenData && tokenData.priceUSD ? tokenData?.priceUSD : tokenInfo && tokenInfo.price ? tokenInfo.price.rate : '';
        if (price == '') return '';
        let excludingBurntValue = totalSupplyInt;
        if (amountBurnt) excludingBurntValue -= parseFloat(amountBurnt.toFixed(0))
        else if (!amountBurnt && token.name.toLowerCase().includes('kiba') && deadKiba)
            excludingBurntValue -= parseFloat(deadKiba.toFixed(0))

        return Number(parseFloat(price.toFixed(18)) * excludingBurntValue)
    }, [totalSupplyInt, tokenInfo?.price, tokenData?.priceUSD, amountBurnt])

    const theme = useTheme()
    const color = theme.chartSidebar

    const inputCurrencyAddress = React.useMemo(function () {
        return Boolean(!!holdings?.pair) ?
            holdings?.pair?.toLowerCase() === WETH9[1].address.toLowerCase()
                ? 'ETH' : toChecksum(holdings?.pair)
            : `ETH`
    }, [holdings.pair])

    const inputCurrency = useCurrency(inputCurrencyAddress ?? undefined)

    const onTradeClick = () => {
        setStatsOpen(false)
        setSwapOpen(true)
    }

    const SwapLink = React.useMemo(function () {
        return Boolean(token) ? (
            <TYPE.link title={`Swap ${token?.symbol} tokens`} style={{ fontFamily: 'Open Sans !important' }} onClick={onTradeClick}>
                Trade <ArrowRightCircle size={'14px'} />
            </TYPE.link>

        ) : null
    }, [token, inputCurrency])

    const onQuickNavOpenChange = (isOpen: boolean) => {
        setQuickNavOpen(isOpen)
        if (isOpen) {
            if (statsOpen) setStatsOpen(false)
            if (swapOpen) setSwapOpen(false)
        }
    }

    const onStatsOpenChange = (isOpen: boolean) => {
        setStatsOpen(isOpen)
        if (isOpen) {
            if (quickNavOpen) setQuickNavOpen(false)
            if (swapOpen) setSwapOpen(false)
        }
    }

    const formatPriceLabel = (key: string) => {
        switch (key) {
            case 'h24':
                return 'Price 24hr';
            case 'h6':
                return 'Price 6hr';
            case 'h1':
                return 'Price 1hr';
            case 'm5':
                return 'Price 5min';
            default:
                return key
        }
    }

    const [search, setSearch] = React.useState(false)
    const toggleSearchOff = () => {
        setSearch(false)
        if (!statsOpen) {
            onStatsOpenChange(true)
        }
    }
    const loadStart = () => setComponentLoading(true)
    const loadEnd = () => setComponentLoading(false)
    return (
        <Wrapper>
            <ProSidebar collapsed={collapsed}
                width={'100%'}
                onLoadStart={loadStart}
                onLoadCapture={loadEnd}
                style={{ 
                    fontSize: 12, 
                    marginRight: 15, 
                    borderRadius: 10, 
                    border: '.25px solid transparent' }}
            >
                <SidebarHeader style={{ fontSize: 12, background: color }}>
                    <div style={{ height: 0, marginBottom: 5, cursor: 'pointer', display: 'flex', justifyContent: "end", position: 'relative', right: '5' }} >
                        {collapsed && (
                            <ArrowRightCircle onClick={menuIconClick} />
                        )}

                        {!collapsed && (
                            <ArrowLeftCircle onClick={menuIconClick} />
                        )}
                    </div>
                    <Menu iconShape="round">

                        <SubMenu style={{ height: 'fit-content' }} open={search} onOpenChange={setSearch} icon={<Search style={{background:'transparent'}} />} title="Search tokens">
                             <PairSearch onPairSelect={toggleSearchOff} />
                        </SubMenu>

                    </Menu>

                </SidebarHeader>
                <SidebarContent style={{ background: color }}>
                    <Menu>
                        <SubMenu
                            style={{}}
                            open={statsOpen}
                            onOpenChange={onStatsOpenChange}
                            popperarrow
                            placeholder={'loader'}
                            icon={<PieChart style={{ background: 'transparent' }} />}
                            title={`${token?.name ? token?.name : ''} Stats`}>
                            {Boolean(hasData && !loading) &&
                                <>
                                    <Menu style={{ background: color, paddingLeft: 0 }} iconShape="round"   >
                                        <SidebarHeader>
                                            <MenuItem>{token?.name} Info</MenuItem>
                                            {token && token.address && tokenCurrency && (<MenuItem>
                                                <RowBetween>
                                                    <ExternalLink href={getExplorerLink(chainId as number, token.address ? token.address : tokenData?.id ? tokenData?.id : tokenCurrency?.wrapped?.address, ExplorerDataType.TOKEN)}>

                                                        <RowFixed>
                                                            <CurrencyLogo currency={tokenCurrency as Currency} size={'20px'} style={{ marginRight: '0.5rem' }} />
                                                            <TYPE.main>{token?.symbol} ↗</TYPE.main>

                                                        </RowFixed>
                                                    </ExternalLink>

                                                    {token.address && (
                                                        <RowFixed>
                                                            <Copy toCopy={token.address}>
                                                                <span style={{ marginLeft: '4px' }}>
                                                                    <TYPE.small>Copy Address</TYPE.small>
                                                                </span>
                                                            </Copy>
                                                        </RowFixed>
                                                    )}

                                                </RowBetween>

                                            </MenuItem>)}
                                        </SidebarHeader>

                                        {!!tokenData && !!tokenData?.priceUSD && _.isNumber(tokenData?.priceUSD) && <> <MenuItem>
                                            <TYPE.subHeader>Price</TYPE.subHeader>
                                            <TYPE.black style={{ display: 'flex', alignItems: 'center' }}>{formattedPrice}</TYPE.black>
                                        </MenuItem>
                                            {!!marketCap &&
                                                <MenuItem>
                                                    <TYPE.subHeader>Market Cap (includes burnt)</TYPE.subHeader>
                                                    <TYPE.black>${abbreviateNumber(marketCap)}</TYPE.black>
                                                </MenuItem>}
                                            <MenuItem>
                                                <TYPE.subHeader>Diluted Market Cap</TYPE.subHeader>
                                                <TYPE.black>${abbreviateNumber(Number(parseFloat(tokenData?.priceUSD?.toFixed(18)) * totalSupplyInt))}</TYPE.black>
                                            </MenuItem></>}

                                        {!tokenData?.priceUSD && !!tokenInfo && !!tokenInfo.price && !!tokenInfo?.price?.rate && _.isNumber(tokenInfo.price.rate) && <>
                                            <MenuItem>
                                                <TYPE.subHeader>Price</TYPE.subHeader>
                                                <TYPE.black style={{ display: 'flex', alignItems: 'center' }}>{formattedPrice}</TYPE.black>
                                            </MenuItem>
                                            {!!marketCap &&
                                                <MenuItem>
                                                    <TYPE.subHeader>Market Cap (includes burnt)</TYPE.subHeader>
                                                    <TYPE.black>${abbreviateNumber(marketCap)}</TYPE.black>
                                                </MenuItem>}
                                            <MenuItem>
                                                <TYPE.subHeader>Diluted Market Cap</TYPE.subHeader>
                                                <TYPE.black>${abbreviateNumber(Number(parseFloat(tokenInfo?.price?.rate?.toFixed(18)) * totalSupplyInt))}</TYPE.black>
                                            </MenuItem>
                                        </>
                                        }
                                        {totalLiquidity && <MenuItem>
                                            <TYPE.subHeader>Total Liquidity</TYPE.subHeader>
                                            <TYPE.black>${abbreviateNumber(totalLiquidity)}</TYPE.black>
                                        </MenuItem>}
                                        {token?.symbol?.toLowerCase().includes('kiba') && <MenuItem>
                                            <TYPE.subHeader>Total Burnt</TYPE.subHeader>
                                            <BurntKiba style={{ display: 'flex', justifyContent: 'start !important' }} />
                                        </MenuItem>}
                                        {!!totalSupplyInt && totalSupplyInt > 0 && <MenuItem>
                                            <TYPE.subHeader>Total Supply</TYPE.subHeader>
                                            <TYPE.black>{totalSupplyInt.toLocaleString()}</TYPE.black>
                                        </MenuItem>}
                                        {transactionCount && <MenuItem>
                                            <TYPE.subHeader>Total Transactions</TYPE.subHeader>
                                            <TYPE.black>{transactionCount.toLocaleString()}</TYPE.black>
                                        </MenuItem>}
                                        {holderCount && holderCount?.holdersCount && <MenuItem>
                                            <TYPE.subHeader># Holders</TYPE.subHeader>
                                            <TYPE.black style={{ display: 'flex', alignItems: 'center' }}>{parseFloat(holderCount?.holdersCount).toLocaleString()}</TYPE.black>
                                        </MenuItem>}

                                        {!tokenInfo || !tokenInfo?.price && tokenData?.oneDayVolumeUSD && <MenuItem>
                                            <TYPE.subHeader>24hr Volume</TYPE.subHeader>
                                            <TYPE.main>${chainId !== 56 ?
                                                parseFloat(parseFloat(tokenData?.oneDayVolumeUSD).toFixed(2)).toLocaleString()
                                                : (parseFloat(parseFloat(tokenData?.oneDayVolumeUSD).toFixed(2))).toLocaleString()}</TYPE.main>
                                        </MenuItem>}

                                        {tokenInfo && tokenInfo.price && tokenInfo.price.volume24h && <MenuItem>
                                            <TYPE.subHeader>24hr Volume</TYPE.subHeader>
                                            <TYPE.main>
                                                ${
                                                    parseFloat(parseFloat(tokenInfo.price.volume24h.toString()).toFixed(2)).toLocaleString()
                                                }
                                            </TYPE.main>
                                        </MenuItem>}

                                        {Boolean(!!holdings) && Boolean(holdings.tokenBalance) && (
                                            <Menu iconShape={'circle'} >
                                                <SidebarHeader style={{ display: 'flex', flexFlow: 'row wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <MenuItem  ><span>Connected Wallet Holdings</span>  </MenuItem>
                                                    {Boolean(SwapLink) && <MenuItem style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                                        {SwapLink}
                                                    </MenuItem>}
                                                </SidebarHeader>

                                                <SidebarContent>
                                                    <MenuItem>
                                                        <TYPE.subHeader>Current {holdings.token.symbol} Balance</TYPE.subHeader>
                                                        <TYPE.black> {Number(holdings.tokenBalance?.toFixed(2)).toLocaleString()} Tokens&nbsp;
                                                            {Boolean(holdings?.tokenValue) && <span>(<FiatValue style={{ display: 'inline-block' }} fiatValue={holdings?.tokenValue ?? undefined} /> USD)</span>}</TYPE.black>
                                                    </MenuItem>
                                                    {Boolean(parseFloat(holdings?.tokenBalance?.toFixed(2)) > 0) &&
                                                        Boolean(holdings?.formattedUsdString?.length) &&
                                                        (<MenuItem>
                                                            <TYPE.subHeader>Current {holdings.token.symbol} Value</TYPE.subHeader>
                                                            <TYPE.black>
                                                                <CurrentHoldingsComponent symbol={holdings.token.symbol} refetch={holdings?.refetchUsdValue} priceArray={holdings?.formattedUsdString} />
                                                            </TYPE.black>
                                                        </MenuItem>)
                                                    }

                                                </SidebarContent>
                                            </Menu>
                                        )}
                                    </Menu>
                                </>
                            }
                            {Boolean(loading) && (
                                <Menu style={{ background: color, paddingLeft: 0 }} iconShape="round"   >

                                    <SidebarContent>
                                        <LoadingSkeleton borderRadius={50} count={7} />
                                    </SidebarContent>
                                </Menu>
                            )}

                        </SubMenu>
                    </Menu>

                </SidebarContent>
                <SidebarContent>
                    <Menu style={{ background: color }} >
                        <SubMenu style={{ background: color }} onOpenChange={toggleSwapOpen} open={swapOpen} icon={<Repeat style={{background:'transparent'}} />} title={"Swap " + token?.name}>
                            <Card style={{ padding: '1rem' }}>
                                <SwapTokenForToken
                                    fontSize={12}
                                    allowSwappingOtherCurrencies={![inputCurrency, tokenCurrency].every(currency => Boolean(currency) && Boolean(currency?.decimals || false) && (currency?.decimals || 0) > 0)}
                                    outputCurrency={inputCurrency}
                                    inputCurrency={tokenCurrency}
                                />
                            </Card>
                        </SubMenu>
                    </Menu>
                </SidebarContent>
                <SidebarFooter style={{ background:color }} >
                    <Menu iconShape="circle">
                        <SubMenu style={{ background: color }} title="Quick Nav" icon={<Heart style={{ background: 'transparent' }} />} open={quickNavOpen} onOpenChange={onQuickNavOpenChange}>
                            {quickNavOpen && <>
                                <MenuItem><StyledInternalLink to="/dashboard">Dashboard</StyledInternalLink></MenuItem>
                                <MenuItem><StyledInternalLink to="/swap">Swap</StyledInternalLink></MenuItem>
                                {!!account && <MenuItem><StyledInternalLink to={`/details/${account}`}>View Your Transactions</StyledInternalLink></MenuItem>}
                                <MenuItem><StyledInternalLink to="/fomo">Kiba Fomo</StyledInternalLink></MenuItem>
                                <MenuItem><StyledInternalLink to="/honeypot-checker">Honeypot Checker</StyledInternalLink></MenuItem>
                            </>}

                            {!quickNavOpen && <MenuItem><TYPE.small>Expand the sidebar to use this feature</TYPE.small></MenuItem>}

                        </SubMenu>
                    </Menu>
                </SidebarFooter>
            </ProSidebar>
        </Wrapper>
    )
}, _.isEqual)
_ChartSidebar.displayName = 'chart.sidebar'
export const ChartSidebar = _ChartSidebar

type HoldingsProps = {
    priceArray?: (string | undefined)[]
    refetch?: () => void
    symbol: string
}

const hoverStyle = ` 
display:flex;justify-content:space-between; gap: 10px; align-items:center;
&:hover {
    color: #fff;
    transition: ease all 0.12s;
}
>*:hover {
    color: #fff;
    transition: ease all 0.12s;
}`

const SmallTypeHover = styled.div`
   ${hoverStyle}
`

const BadgeHover = styled(Badge)`

&:hover {
    color:${props => darken(0.08, props.theme.text1)};
}`

const RefreshCcwHover = styled(RefreshCcw)`
color: ${props => props.theme.text1};
cursor:pointer;
    &:hover{
        color:${props => darken(0.1, props.theme.text1)};
        transition: all ease 0.01s;
    }
`

const CurrentHoldingsComponent = (props: HoldingsProps) => {
    const { priceArray, refetch, symbol } = props
    const [showUsd, setShowUsd] = React.useState(true)

    const toggleShowUsd = () => setShowUsd(!showUsd)

    const hasPriceArray = Boolean(priceArray && priceArray?.length)

    if (!hasPriceArray) return null
    const Toggle = showUsd ? ToggleLeft : ToggleRight
    const priceToRender = hasPriceArray ? (showUsd ? priceArray?.[0] : priceArray?.[1]) : null

    const refetchClick = React.useCallback(() => {
        refetch && refetch()
    }, [refetch])
    return (
        <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'auto auto', alignItems: 'center', marginTop: 5 }}>
            <BadgeHover style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer'
            }}
                onClick={toggleShowUsd}
                variant={BadgeVariant.POSITIVE_OUTLINE}>
                {showUsd ? <span>${priceToRender}</span> : <span>{priceToRender}</span>}
                <SmallTypeHover>
                    <TYPE.small style={{ fontSize: 9 }}>
                        {showUsd ? 'USD' : 'ETH'}
                    </TYPE.small>
                    <Toggle size={'11px'} />
                </SmallTypeHover>
            </BadgeHover>
            <span title={`Refresh ${symbol} holdings`}><RefreshCcwHover onClick={refetchClick} /></span>
        </div>
    )
}