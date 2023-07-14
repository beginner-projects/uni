import { ChainId } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { UniswapXOrderStatus } from 'lib/hooks/orders/types'
import { useCallback, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { useAppSelector } from 'state/hooks'

import { addSignature } from './reducer'
import { SignatureDetails, SignatureType, UniswapXOrderDetails } from './types'

export function usePendingOrders(): UniswapXOrderDetails[] {
  const { account } = useWeb3React()
  const signatures = useAppSelector((state) => state.signatures)

  return useMemo(() => {
    if (!account || !signatures[account]) return []
    return Object.values(signatures[account]).filter(isPendingOrder)
  }, [signatures, account])
}

export function useOrder(orderHash: string): UniswapXOrderDetails | undefined {
  const { account } = useWeb3React()
  const signatures = useAppSelector((state) => state.signatures)

  return useMemo(() => {
    if (!account || !signatures[account]) return undefined
    const order = signatures[account][orderHash]
    if (!order || order.type !== SignatureType.SIGN_UNISWAPX_ORDER) return undefined
    return order
  }, [account, signatures, orderHash])
}

export function useAddOrder() {
  const dispatch = useDispatch()

  return useCallback(
    (
      offerer: string,
      orderHash: string,
      chainId: ChainId,
      expiry: number,
      swapInfo: UniswapXOrderDetails['swapInfo']
    ) => {
      dispatch(
        addSignature({
          type: SignatureType.SIGN_UNISWAPX_ORDER,
          offerer,
          id: orderHash,
          chainId,
          expiry,
          orderHash,
          swapInfo,
          status: UniswapXOrderStatus.OPEN,
          addedTime: Date.now(),
        })
      )
    },
    [dispatch]
  )
}

export function isFinalizedOrder(orderStatus: UniswapXOrderStatus) {
  return orderStatus !== UniswapXOrderStatus.OPEN
}

export function isOnChainOrder(orderStatus: UniswapXOrderStatus) {
  return orderStatus === UniswapXOrderStatus.FILLED || orderStatus === UniswapXOrderStatus.CANCELLED
}

function isPendingOrder(signature: SignatureDetails): signature is UniswapXOrderDetails {
  return signature.type === SignatureType.SIGN_UNISWAPX_ORDER && signature.status === UniswapXOrderStatus.OPEN
}

export function useAllSignatures(): { [id: string]: SignatureDetails } {
  const { account } = useWeb3React()

  const signatures = useAppSelector((state) => state.signatures) ?? {}

  if (!account || !signatures[account]) return {}

  return signatures[account]
}
