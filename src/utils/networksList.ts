import { ChainId } from '@swapr/sdk'
import { NetworkOptions, NetworkOptionsPreset, NetworksList } from '../components/NetworkSwitcher'
import { NETWORK_DETAIL } from '../constants'

export const getNetworkInfo = (networkOptionsPreset: NetworkOptionsPreset[], chainId: ChainId) => {
  const network = networkOptionsPreset.find(net => {
    return net.chainId === chainId
  })
  return {
    name: NETWORK_DETAIL[chainId].chainName,
    isArbitrum: NETWORK_DETAIL[chainId].isArbitrum,
    partnerChainId: NETWORK_DETAIL[chainId].partnerChainId,
    rpcUrl: NETWORK_DETAIL[chainId].rpcUrls,
    iconUrls: NETWORK_DETAIL[chainId].iconUrls,
    nativeCurrency: {
      name: NETWORK_DETAIL[chainId].nativeCurrency.name,
      symbol: NETWORK_DETAIL[chainId].nativeCurrency.symbol,
      decimals: NETWORK_DETAIL[chainId].nativeCurrency.decimals
    },
    logoSrc: network?.logoSrc,
    tag: network?.tag
  }
}

export const getNetworkById = (chainId: ChainId, networkList: NetworksList[]) => {
  for (const { networks } of networkList) {
    for (const config of networks) {
      if (config.preset.chainId === chainId) return config
    }
  }
  return undefined
}

export const createNetworkOptions = ({
  selectedNetworkChainId,
  setChainId,
  activeChainId,
  networkPreset,
  isNetworkDisabled
}: {
  selectedNetworkChainId: ChainId
  setChainId: (chainId: ChainId) => void
  activeChainId: ChainId | undefined
  networkPreset: NetworkOptionsPreset
  isNetworkDisabled: (optionChainId: ChainId, selectedNetworkChainId: ChainId) => boolean
}): NetworkOptions => {
  const { chainId } = networkPreset
  return {
    preset: networkPreset,
    active: selectedNetworkChainId === activeChainId,
    disabled: isNetworkDisabled(networkPreset.chainId, selectedNetworkChainId),
    onClick: () => setChainId(chainId)
  }
}

export const createNetworksList = ({
  networkOptionsPreset,
  selectedNetworkChainId,
  setChainId,
  activeChainId,
  isNetworkDisabled,
  removeSpecifiedTag
}: {
  networkOptionsPreset: NetworkOptionsPreset[]
  selectedNetworkChainId: ChainId
  setChainId: (chainId: ChainId) => void
  activeChainId: ChainId | undefined
  isNetworkDisabled: (optionChainId: ChainId, selectedNetworkChainId: ChainId) => boolean
  removeSpecifiedTag?: string
}): NetworksList[] => {
  let networkPreset = networkOptionsPreset
  if (removeSpecifiedTag) {
    networkPreset = networkOptionsPreset.map(item => {
      if (item.tag === removeSpecifiedTag) {
        return { ...item, tag: '' }
      }
      return item
    })
  }
  return networkPreset.reduce<NetworksList[]>((taggedNetworkList, currentNet) => {
    const tag = currentNet.tag ? currentNet.tag : ''
    const networkPreset: NetworkOptionsPreset = currentNet
    const enhancedNetworkOptions = createNetworkOptions({
      selectedNetworkChainId,
      setChainId,
      activeChainId,
      networkPreset,
      isNetworkDisabled
    })

    // check if tag exist and if not create array
    const tagArrIndex = taggedNetworkList.findIndex(existingTagArr => existingTagArr.tag === tag)
    if (tagArrIndex > -1) {
      taggedNetworkList[tagArrIndex].networks.push(enhancedNetworkOptions)
    } else {
      taggedNetworkList.push({ tag, networks: [enhancedNetworkOptions] })
    }

    return taggedNetworkList
  }, [])
}
