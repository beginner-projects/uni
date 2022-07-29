/**
 * Event names that can occur in this application.
 *
 * Subject to change as new features are added and new events are defined
 * and logged.
 */
export enum EventName {
  CONNECT_WALLET_BUTTON_CLICKED = 'Connect Wallet Button Clicked',
  PAGE_VIEWED = 'Page Viewed',
  SWAP_AUTOROUTER_VISUALIZATION_EXPANDED = 'Swap Autorouter Visualization Expanded',
  SWAP_DETAILS_EXPANDED = 'Swap Details Expanded',
  SWAP_MAX_TOKEN_AMOUNT_SELECTED = 'Swap Max Token Amount Selected',
  SWAP_QUOTE_RECEIVED = 'Swap Quote Received',
  SWAP_SUBMITTED = 'Swap Submitted',
  SWAP_TOKENS_REVERSED = 'Swap Tokens Reversed',
  TOKEN_IMPORTED = 'Token Imported',
  TOKEN_SELECTED = 'Token Selected',
  TOKEN_SELECTOR_OPENED = 'Token Selector Opened',
  WALLET_CONNECT_TXN_COMPLETED = 'Wallet Connect Transaction Completed',
  WALLET_SELECTED = 'Wallet Selected',
  // alphabetize additional event names.
}

export enum CUSTOM_USER_PROPERTIES {
  ALL_WALLET_ADDRESSES_CONNECTED = 'all_wallet_addresses_connected',
  ALL_WALLET_CHAIN_IDS = 'all_wallet_chain_ids',
  BROWSER = 'browser',
  LIGHT_MODE = 'light_mode',
  SCREEN_RESOLUTION = 'screen_resolution',
  WALLET_ADDRESS = 'wallet_address',
  WALLET_NATIVE_CURRENCY_BALANCE_USD = 'wallet_native_currency_balance_usd',
  WALLET_CHAIN_IDS_PREFIX = 'wallet_chain_ids_',
  WALLET_FIRST_SEEN_DATE_PREFIX = 'first_seen_date_',
  WALLET_LAST_SEEN_DATE_PREFIX = 'last_seen_date_',
  WALLET_TOKENS_ADDRESSES = 'wallet_tokens_addresses',
  WALLET_TOKENS_BALANCES_AMOUNT = 'wallet_tokens_balances_amount',
  WALLET_TOKENS_SYMBOLS = 'wallet_tokens_symbols',
  WALLET_TYPE = 'wallet_type',
}

export enum WALLET_CONNECTION_RESULT {
  SUCCEEDED = 'Succeeded',
  FAILED = 'Failed',
}

export const NATIVE_CHAIN_ADDRESS = 'NATIVE'

/**
 * Known pages in the app. Highest order context.
 */
export const enum PageName {
  EXPLORE_PAGE = 'explore-page',
  POOL_PAGE = 'pool-page',
  SWAP_PAGE = 'swap-page',
  VOTE_PAGE = 'vote-page',
  // alphabetize additional page names.
}

/**
 * Sections. Disambiguates low-level elements that may share a name.
 * eg a `back` button in a modal will have the same `element`,
 * but a different `section`.
 */
export const enum SectionName {
  CURRENCY_INPUT_PANEL = 'swap-currency-input',
  CURRENCY_OUTPUT_PANEL = 'swap-currency-output',
  // alphabetize additional section names.
}

/** Known modals for analytics purposes. */
export const enum ModalName {
  CONFIRM_SWAP = 'confirm-swap-modal',
  TOKEN_SELECTOR = 'token-selector-modal',
  // alphabetize additional modal names.
}

/**
 * Known element names for analytics purposes.
 * Use to identify low-level components given a TraceContext
 */
export const enum ElementName {
  AUTOROUTER_VISUALIZATION_ROW = 'expandable-autorouter-visualization-row',
  COMMON_BASES_CURRENCY_BUTTON = 'common-bases-currency-button',
  CONFIRM_SWAP_BUTTON = 'confirm-swap-or-send',
  CONNECT_WALLET_BUTTON = 'connect-wallet-button',
  IMPORT_TOKEN_BUTTON = 'import-token-button',
  MAX_TOKEN_AMOUNT_BUTTON = 'max-token-amount-button',
  SWAP_BUTTON = 'swap-button',
  SWAP_DETAILS_DROPDOWN = 'swap-details-dropdown',
  SWAP_TOKENS_REVERSE_ARROW_BUTTON = 'swap-tokens-reverse-arrow-button',
  TOKEN_SELECTOR_ROW = 'token-selector-row',
  WALLET_TYPE_OPTION = 'wallet-type-option',
  // alphabetize additional element names.
}

/**
 * Known events that trigger callbacks.
 * @example
 *  <TraceEvent events={[Event.onClick]} element={name}>
 */
export enum Event {
  onClick = 'onClick',
  onKeyPress = 'onKeyPress',
  onSelect = 'onSelect',
  // alphabetize additional events.
}
