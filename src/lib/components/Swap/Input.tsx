import { Trans } from '@lingui/macro'
import { useUSDCValue } from 'hooks/useUSDCPrice'
import { useSwapAmount, useSwapCurrency, useSwapInfo } from 'lib/hooks/swap'
import { usePrefetchCurrencyColor } from 'lib/hooks/useCurrencyColor'
import { Field } from 'lib/state/swap'
import styled, { ThemedText } from 'lib/theme'
import { useCallback } from 'react'
import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'

import Column from '../Column'
import Row from '../Row'
import TokenImg from '../TokenImg'
import TokenInput from './TokenInput'

const InputColumn = styled(Column)<{ approved?: boolean }>`
  margin: 0.75em;
  position: relative;

  ${TokenImg} {
    filter: ${({ approved }) => (approved ? undefined : 'saturate(0) opacity(0.4)')};
    transition: filter 0.25s;
  }
`

interface InputProps {
  disabled?: boolean
}

export default function Input({ disabled }: InputProps) {
  const {
    currencyBalances: { [Field.INPUT]: balance },
    currencyAmounts: { [Field.INPUT]: inputCurrencyAmount },
  } = useSwapInfo()
  const inputUSDC = useUSDCValue(inputCurrencyAmount)

  const [typedInputAmount, updateTypedInputAmount] = useSwapAmount(Field.INPUT)
  const [inputCurrency, updateInputCurrency] = useSwapCurrency(Field.INPUT)

  // extract eagerly in case of reversal
  usePrefetchCurrencyColor(inputCurrency)

  //TODO(ianlapham): mimic logic from app swap page
  const mockApproved = true

  const onMax = useCallback(() => {
    if (balance) {
      updateTypedInputAmount(balance.toExact())
    }
  }, [balance, updateTypedInputAmount])

  return (
    <InputColumn gap={0.5} approved={mockApproved}>
      <Row>
        <ThemedText.Subhead2 color="secondary">
          <Trans>Trading</Trans>
        </ThemedText.Subhead2>
      </Row>
      <TokenInput
        currency={inputCurrency}
        amount={(typedInputAmount !== undefined ? typedInputAmount : inputCurrencyAmount?.toSignificant(6)) ?? ''}
        disabled={disabled}
        onMax={onMax}
        onChangeInput={updateTypedInputAmount}
        onChangeCurrency={updateInputCurrency}
      >
        <ThemedText.Body2 color="secondary">
          <Row>
            {inputUSDC ? `~ $${inputUSDC.toFixed(2)}` : '-'}
            {balance && (
              <ThemedText.Body2 color={inputCurrencyAmount?.greaterThan(balance) ? 'error' : undefined}>
                Balance: <span style={{ userSelect: 'text' }}>{formatCurrencyAmount(balance, 4)}</span>
              </ThemedText.Body2>
            )}
          </Row>
        </ThemedText.Body2>
      </TokenInput>
      <Row />
    </InputColumn>
  )
}
