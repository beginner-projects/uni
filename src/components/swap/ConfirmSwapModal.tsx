import { t, Trans } from '@lingui/macro'
import { sendAnalyticsEvent, Trace, useTrace } from '@uniswap/analytics'
import { InterfaceEventName, InterfaceModalName } from '@uniswap/analytics-events'
import { Trade } from '@uniswap/router-sdk'
import { Currency, Percent, TradeType } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { useMaxAmountIn } from 'hooks/useMaxAmountIn'
import { Allowance, AllowanceState } from 'hooks/usePermit2Allowance'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { Loader } from 'react-feather'
import { InterfaceTrade } from 'state/routing/types'
import invariant from 'tiny-invariant'
import { tradeMeaningfullyDiffers } from 'utils/tradeMeaningFullyDiffer'

import TransactionConfirmationModal, {
  ConfirmationModalContent,
  TransactionErrorContent,
} from '../TransactionConfirmationModal'
import { PendingModalContent } from './PendingModalContent'
import SwapModalFooter from './SwapModalFooter'
import SwapModalHeader from './SwapModalHeader'

enum SummaryModalState {
  REVIEWING,
  APPROVING_PERMIT2, // approving Permit2 contract
  APPROVING_TOKEN, // signing the token approval
  APPROVED,
  PENDING_CONFIRMATION, // waiting for the network confirmation
}

export default function ConfirmSwapModal({
  trade,
  originalTrade,
  onAcceptChanges,
  allowedSlippage,
  allowance,
  onConfirm,
  onDismiss,
  swapErrorMessage,
  isOpen,
  attemptingTxn,
  txHash,
  swapQuoteReceivedDate,
  fiatValueInput,
  fiatValueOutput,
}: {
  isOpen: boolean
  trade: InterfaceTrade<Currency, Currency, TradeType> | undefined
  originalTrade: Trade<Currency, Currency, TradeType> | undefined
  attemptingTxn: boolean
  txHash: string | undefined
  allowedSlippage: Percent
  allowance: Allowance
  onAcceptChanges: () => void
  onConfirm: () => void
  swapErrorMessage: ReactNode | undefined
  onDismiss: () => void
  swapQuoteReceivedDate: Date | undefined
  fiatValueInput: { data?: number; isLoading: boolean }
  fiatValueOutput: { data?: number; isLoading: boolean }
}) {
  // shouldLogModalCloseEvent lets the child SwapModalHeader component know when modal has been closed
  // and an event triggered by modal closing should be logged.
  const [shouldLogModalCloseEvent, setShouldLogModalCloseEvent] = useState(false)
  const showAcceptChanges = useMemo(
    () => Boolean(trade && originalTrade && tradeMeaningfullyDiffers(trade, originalTrade)),
    [originalTrade, trade]
  )

  const [confirmModalState, setConfirmModalState] = useState<SummaryModalState>(SummaryModalState.REVIEWING)

  const { chainId } = useWeb3React()
  const trace = useTrace()
  const maximumAmountIn = useMaxAmountIn(trade, allowedSlippage)

  useEffect(() => {
    if (confirmModalState === SummaryModalState.APPROVED && allowance.state === AllowanceState.ALLOWED) {
      onConfirm()
      setConfirmModalState(SummaryModalState.PENDING_CONFIRMATION)
    }
  }, [allowance.state, confirmModalState, onConfirm])

  const updateAllowance = useCallback(async () => {
    invariant(allowance.state === AllowanceState.REQUIRED)
    setConfirmModalState(
      allowance.needsPermit2Approval ? SummaryModalState.APPROVING_PERMIT2 : SummaryModalState.APPROVING_TOKEN
    )
    try {
      await allowance.approveAndPermit(function onApprovalRequestedCallback() {
        setConfirmModalState(SummaryModalState.APPROVING_TOKEN)
      })
      sendAnalyticsEvent(InterfaceEventName.APPROVE_TOKEN_TXN_SUBMITTED, {
        chain_id: chainId,
        token_symbol: maximumAmountIn?.currency.symbol,
        token_address: maximumAmountIn?.currency.address,
        ...trace,
      })
    } catch (e) {
      console.error(e)
      // todo: set error state, render error content in modal
      return false
    }
    // setConfirmModalState(SummaryModalState.PENDING_CONFIRMATION)
    return true
  }, [allowance, chainId, maximumAmountIn?.currency.address, maximumAmountIn?.currency.symbol, trace])

  const onModalDismiss = useCallback(() => {
    if (isOpen) setShouldLogModalCloseEvent(true)
    onDismiss()
  }, [isOpen, onDismiss])

  const modalHeader = useCallback(() => {
    if (confirmModalState === SummaryModalState.REVIEWING) {
      return <SwapModalHeader trade={trade} allowedSlippage={allowedSlippage} />
    }
    return null
  }, [allowedSlippage, confirmModalState, trade])

  const modalBottom = useCallback(() => {
    if (confirmModalState === SummaryModalState.APPROVING_PERMIT2) {
      return (
        <PendingModalContent
          title={t`Approve permit`}
          subtitle={t`Proceed in wallet`}
          label={t`Why are permits required?`}
          tooltipText={t`todo`}
          logo={<CurrencyLogo currency={trade?.inputAmount?.currency} size="48px" />}
        />
      )
    }
    if (confirmModalState === SummaryModalState.APPROVING_TOKEN) {
      return (
        <PendingModalContent
          title={t`Approve ${trade?.inputAmount?.currency?.symbol}`}
          subtitle={t`Proceed in wallet`}
          label={t`Why are approvals required?`}
          tooltipText={t`todo`}
          logo={<CurrencyLogo currency={trade?.inputAmount?.currency} size="48px" />}
        />
      )
    }
    if (confirmModalState === SummaryModalState.PENDING_CONFIRMATION) {
      return (
        <PendingModalContent
          title={t`Confirm Swap`}
          subtitle={t`Proceed in your wallet`}
          label={t`Why do I need to confirm?`}
          logo={<Loader size={48} />}
        />
      )
    }
    return (
      <SwapModalFooter
        onConfirm={async () => {
          if (allowance.state === AllowanceState.REQUIRED) {
            const allowanceResult: boolean = await updateAllowance()
            if (!allowanceResult) {
              setConfirmModalState(SummaryModalState.REVIEWING)
              return // allowance didn't work, what to do?
            }
          }
          setConfirmModalState(SummaryModalState.APPROVED)
        }}
        trade={trade}
        hash={txHash}
        allowedSlippage={allowedSlippage}
        disabledConfirm={showAcceptChanges}
        swapErrorMessage={swapErrorMessage}
        swapQuoteReceivedDate={swapQuoteReceivedDate}
        fiatValueInput={fiatValueInput}
        fiatValueOutput={fiatValueOutput}
        shouldLogModalCloseEvent={shouldLogModalCloseEvent}
        setShouldLogModalCloseEvent={setShouldLogModalCloseEvent}
        showAcceptChanges={showAcceptChanges}
        onAcceptChanges={onAcceptChanges}
      />
    )
  }, [
    confirmModalState,
    trade,
    txHash,
    allowedSlippage,
    showAcceptChanges,
    swapErrorMessage,
    swapQuoteReceivedDate,
    fiatValueInput,
    fiatValueOutput,
    shouldLogModalCloseEvent,
    onAcceptChanges,
    allowance.state,
    updateAllowance,
  ])

  // text to show while loading
  const pendingText = (
    <Trans>
      Swapping {trade?.inputAmount?.toSignificant(6)} {trade?.inputAmount?.currency?.symbol} for{' '}
      {trade?.outputAmount?.toSignificant(6)} {trade?.outputAmount?.currency?.symbol}
    </Trans>
  )

  const confirmationContent = useCallback(
    () =>
      swapErrorMessage ? (
        <TransactionErrorContent onDismiss={onModalDismiss} message={swapErrorMessage} />
      ) : (
        <ConfirmationModalContent
          title={<Trans>Review Swap</Trans>}
          onDismiss={onModalDismiss}
          topContent={modalHeader}
          bottomContent={modalBottom}
        />
      ),
    [onModalDismiss, modalBottom, modalHeader, swapErrorMessage]
  )

  return (
    <Trace modal={InterfaceModalName.CONFIRM_SWAP}>
      <TransactionConfirmationModal
        isOpen={isOpen}
        onDismiss={onModalDismiss}
        attemptingTxn={attemptingTxn}
        hash={txHash}
        content={confirmationContent}
        pendingText={pendingText}
        currencyToAdd={trade?.outputAmount.currency}
      />
    </Trace>
  )
}
