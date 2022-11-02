import { NftMarketplace, OrderStatus, OrderType } from 'graphql/data/nft/__generated__/DetailsQuery.graphql'

import { GenieCollection } from '../common'

export interface ListingMarket {
  name: string
  fee: number
  icon: string
}
export interface ListingWarning {
  marketplace: ListingMarket
  message: string
}

export interface OldSellOrder {
  assetId: string
  ethPrice: number
  basePrice: number
  baseCurrency: string
  baseCurrencyDecimal: number
  orderCreatedDate: string
  orderClosingDate: string
  quantity: number
  timestamp: string
  marketplace: string
  marketplaceUrl: string
  orderHash: string
  ammFeePercent?: number
  ethReserves?: number
  tokenReserves?: number
}

export interface SellOrder {
  address: string
  createdAt: number
  endAt: number
  id: string
  maker: string
  marketplace: NftMarketplace
  marketplaceUrl: string
  orderHash: string
  price: {
    currency: string
    value: number
  }
  quantity: number
  startAt: number
  status: OrderStatus
  tokenId: string
  type: OrderType
  protocolParameters: string
}

export interface Listing {
  price?: number
  marketplace: ListingMarket
  overrideFloorPrice?: boolean
}

export interface WalletAsset {
  id?: string
  image_url: string
  image_preview_url: string
  name: string
  tokenId: string
  asset_contract: {
    address: string
    schema_name: 'ERC1155' | 'ERC721' | string
    asset_contract_type: string
    created_date: string
    name: string
    symbol: string
    description: string
    external_link: string
    image_url: string
    default_to_fiat: boolean
    only_proxied_transfers: boolean
    payout_address: string
  }
  collection: GenieCollection
  collectionIsVerified: boolean
  lastPrice: number
  floorPrice: number
  creatorPercentage: number
  listing_date: string
  date_acquired: string
  sellOrders: OldSellOrder[]
  floor_sell_order_price: number
  // Used for creating new listings
  expirationTime?: number
  marketAgnosticPrice?: number
  newListings?: Listing[]
  marketplaces?: ListingMarket[]
  listingWarnings?: ListingWarning[]
}

export interface WalletCollection {
  address: string
  name: string
  image: string
  floorPrice: number
  count: number
}

export enum ListingStatus {
  APPROVED = 'Approved',
  CONTINUE = 'Continue',
  DEFINED = 'Defined',
  FAILED = 'Failed',
  PAUSED = 'Paused',
  PENDING = 'Pending',
  REJECTED = 'Rejected',
  SIGNING = 'Signing',
}

export interface AssetRow {
  images: string[]
  name: string
  status: ListingStatus
  callback?: () => Promise<void>
}

export interface ListingRow extends AssetRow {
  asset: WalletAsset
  marketplace: ListingMarket
}

export interface CollectionRow extends AssetRow {
  collectionAddress: string
  marketplace: ListingMarket
}

// Creating this as an enum and not boolean as we will likely have a success screen state to show
export enum ProfilePageStateType {
  VIEWING,
  LISTING,
}

export enum ListingResponse {
  TRY_AGAIN,
  SUCCESS,
}
