export const FACTORY_ADDRESSES = {
  1: '0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95',
  3: '0x9c83dCE8CA20E9aAF9D3efc003b2ea62aBC08351',
  4: '0xf5D915570BC477f9B8D6C0E980aA81757A3AaC36',
  42: '0xD3E51Ef092B2845f10401a0159B2B96e8B6c3D30'
}

export const SUPPORTED_THEMES = {
  DARK: 'DARK',
  LIGHT: 'LIGHT'
}

export const SUPPORTED_WALLETS = {
  INJECTED: {
    id: 'Injected',
    name: 'Injected',
    iconName: 'arrow-right.svg',
    description: 'Injected web3 provider.',
    color: '#010101'
  },
  WALLET_CONNECT: {
    id: 'WalletConnect',
    name: 'Wallet Connect',
    iconName: 'walletConnectIcon.svg',
    description: 'Connect to Trust Wallet, Rainbow Wallet and more...',
    color: '#4196FC'
  },
  WALLET_LINK: {
    id: 'WalletLink',
    name: 'Coinbase Wallet',
    iconName: 'coinbaseWalletIcon.svg',
    description: 'Use Coinbase Wallet app on mobile device',
    color: '#315CF5'
  }
}

export const MOBILE_DEEP_LINKS = {
  COINBASE_LINK: {
    name: 'Open in Coinbase Wallet',
    iconName: 'coinbaseWalletIcon.svg',
    description: 'Open in Coinbase Wallet app.',
    href: 'https://go.cb-w.com/mtUDhEZPy1',
    color: '#315CF5'
  },
  TRUST_WALLET_LINK: {
    name: 'Open in Trust Wallet',
    iconName: 'trustWallet.png',
    description: 'iOS and Android app.',
    href: 'https://link.trustwallet.com/open_url?coin_id=60&url=https://uniswap.exchange/swap',
    color: '#1C74CC'
  }
}
