import { t } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import Row from 'components/Row'
import { isSupportedChainId } from 'lib/hooks/routing/clientSideSmartOrderRouter'
import { Settings } from 'react-feather'
import { useModalIsOpen, useToggleSettingsMenu } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'
import { useUserSlippageTolerance } from 'state/user/hooks'
import { SlippageTolerance } from 'state/user/types'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import validateUserSlippageTolerance, { SlippageValidationResponse } from 'utils/validateUserSlippageTolerance'

const Icon = styled(Settings)`
  height: 20px;
  width: 20px;
  > * {
    stroke: ${({ theme }) => theme.textSecondary};
  }
`

const Button = styled.button<{ isActive: boolean }>`
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  cursor: pointer;
  outline: none;

  :not([disabled]):hover {
    opacity: 0.7;
  }

  ${({ isActive }) => isActive && `opacity: 0.7`}
`

const IconContainer = styled(Row)`
  padding: 6px 12px;
  border-radius: 16px;
`

const IconContainerWithSlippage = styled(IconContainer)<{ displayWarning?: boolean }>`
  div {
    color: ${({ theme, displayWarning }) => (displayWarning ? theme.accentWarning : theme.textSecondary)};
  }

  background-color: ${({ theme, displayWarning }) =>
    displayWarning ? theme.accentWarningSoft : theme.backgroundModule};
`

const ButtonIcon = () => {
  const [userSlippageTolerance] = useUserSlippageTolerance()

  if (userSlippageTolerance === SlippageTolerance.Auto) {
    return (
      <IconContainer>
        <Icon />
      </IconContainer>
    )
  }

  const isInvalidSlippage = validateUserSlippageTolerance(userSlippageTolerance) !== SlippageValidationResponse.Valid

  return (
    <IconContainerWithSlippage gap="sm" displayWarning={isInvalidSlippage}>
      <ThemedText.Caption>{userSlippageTolerance.toFixed(2)}% slippage</ThemedText.Caption>
      <Icon />
    </IconContainerWithSlippage>
  )
}

export default function MenuButton() {
  const { chainId } = useWeb3React()

  const toggleMenu = useToggleSettingsMenu()
  const isMenuOpen = useModalIsOpen(ApplicationModal.SETTINGS)

  return (
    <Button
      disabled={!isSupportedChainId(chainId)}
      onClick={toggleMenu}
      isActive={isMenuOpen}
      id="open-settings-dialog-button"
      data-testid="open-settings-dialog-button"
      aria-label={t`Transaction Settings`}
    >
      <ButtonIcon />
    </Button>
  )
}
