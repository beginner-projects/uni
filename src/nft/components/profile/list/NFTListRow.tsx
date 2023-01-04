import { Column } from 'nft/components/Flex'
import { RowsCollpsedIcon, RowsExpandedIcon, VerifiedIcon } from 'nft/components/icons'
import { useSellAsset } from 'nft/hooks'
import { ListingMarket, WalletAsset } from 'nft/types'
import { Dispatch, useEffect, useState } from 'react'
import styled, { css } from 'styled-components/macro'
import { BREAKPOINTS, ThemedText } from 'theme'

import { MarketplaceRow } from './MarketplaceRow'
import { SetPriceMethod } from './NFTListingsGrid'

const NFTListRowWrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin: 24px 0px;
  align-items: center;
`

const NFTInfoWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  min-width: 0px;
  flex: 2;
  margin-bottom: auto;

  @media screen and (min-width: ${BREAKPOINTS.md}px) {
    flex: 1.5;
  }
`

const ExpandMarketIconWrapper = styled.div`
  cursor: pointer;
  margin-right: 8px;
`

const NFTImageWrapper = styled.div`
  position: relative;
  cursor: pointer;
  height: 48px;
  margin-right: 8px;
`

const NFTImage = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 8px;
`

const RemoveIconWrap = styled.div<{ hovered: boolean }>`
  position: absolute;
  left: 50%;
  top: 30px;
  transform: translateX(-50%);
  width: 32px;
  visibility: ${({ hovered }) => (hovered ? 'visible' : 'hidden')};
`

const RemoveIcon = styled.img`
  width: 32px;
  height: 32px;
`

const HideTextOverflow = css`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const TokenName = styled.div`
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  ${HideTextOverflow}
`

const CollectionName = styled(ThemedText.BodySmall)`
  color: ${({ theme }) => theme.textSecondary};
  line-height: 20px;
  ${HideTextOverflow};
`

interface NFTListRowProps {
  asset: WalletAsset
  globalPriceMethod?: SetPriceMethod
  setGlobalPrice: Dispatch<number | undefined>
  globalPrice?: number
  selectedMarkets: ListingMarket[]
}

/**
 * NFTListRow is the outermost row wrapper for an NFT Listing, which shows either the composite of multiple marketplaces listings
 * or can be expanded to show listings per marketplace
 */
export const NFTListRow = ({
  asset,
  globalPriceMethod,
  globalPrice,
  setGlobalPrice,
  selectedMarkets,
}: NFTListRowProps) => {
  const [expandMarketplaceRows, setExpandMarketplaceRows] = useState(false)
  const removeAsset = useSellAsset((state) => state.removeSellAsset)
  const [localMarkets, setLocalMarkets] = useState([])
  const [hovered, setHovered] = useState(false)
  const handleHover = () => setHovered(!hovered)

  useEffect(() => {
    setLocalMarkets(JSON.parse(JSON.stringify(selectedMarkets)))
    selectedMarkets.length < 2 && setExpandMarketplaceRows(false)
  }, [selectedMarkets])

  return (
    <NFTListRowWrapper>
      <NFTInfoWrapper>
        {localMarkets.length > 1 && (
          <ExpandMarketIconWrapper onClick={() => setExpandMarketplaceRows(!expandMarketplaceRows)}>
            {expandMarketplaceRows ? <RowsExpandedIcon /> : <RowsCollpsedIcon />}
          </ExpandMarketIconWrapper>
        )}
        <NFTImageWrapper
          onMouseEnter={handleHover}
          onMouseLeave={handleHover}
          onClick={() => {
            removeAsset(asset)
          }}
        >
          <RemoveIconWrap hovered={hovered}>
            <RemoveIcon src="/nft/svgs/minusCircle.svg" alt="Remove item" />
          </RemoveIconWrap>
          <NFTImage alt={asset.name} src={asset.imageUrl || '/nft/svgs/image-placeholder.svg'} />
        </NFTImageWrapper>
        <Column gap="4" marginRight="8" minWidth="0">
          <TokenName>{asset.name ? asset.name : `#${asset.tokenId}`}</TokenName>
          <CollectionName>
            {asset.collection?.name}
            {asset.collectionIsVerified && <VerifiedIcon style={{ marginBottom: '-5px' }} />}
          </CollectionName>
        </Column>
      </NFTInfoWrapper>
      <Column flex={{ sm: '1', md: '3' }} gap="24">
        {expandMarketplaceRows ? (
          localMarkets.map((market, index) => {
            return (
              <MarketplaceRow
                globalPriceMethod={globalPriceMethod}
                globalPrice={globalPrice}
                setGlobalPrice={setGlobalPrice}
                selectedMarkets={[market]}
                removeMarket={() => localMarkets.splice(index, 1)}
                asset={asset}
                showMarketplaceLogo={true}
                key={index}
                expandMarketplaceRows={expandMarketplaceRows}
              />
            )
          })
        ) : (
          <MarketplaceRow
            globalPriceMethod={globalPriceMethod}
            globalPrice={globalPrice}
            setGlobalPrice={setGlobalPrice}
            selectedMarkets={localMarkets}
            asset={asset}
            showMarketplaceLogo={false}
          />
        )}
      </Column>
    </NFTListRowWrapper>
  )
}
