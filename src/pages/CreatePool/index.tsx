import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'

import { ButtonPrimary } from '../../components/Button'
import { OutlineCard } from '../../components/Card'
import { AutoColumn } from '../../components/Column'
import CreateModal from '../../components/createPool/CreateModal'
//import PoolCard from '../../components/earn/PoolCard'
import { CardBGImage, CardNoise, CardSection, DataCard } from '../../components/earn/styled'
import Loader from '../../components/Loader'
import PoolPositionList from '../../components/PoolPositionList'
import { RowBetween } from '../../components/Row'
import { useModalIsOpen, useToggleCreateModal } from '../../state/application/hooks'
import { ApplicationModal } from '../../state/application/reducer'
import { useAllPoolsData } from '../../state/pool/hooks'
import { ThemedText } from '../../theme'

const PageWrapper = styled(AutoColumn)`
  padding: 68px 8px 0px;
  max-width: 640px;
  width: 100%;

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    padding: 48px 8px 0px;
  }

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    padding-top: 20px;
  }
`

const TopSection = styled(AutoColumn)`
  max-width: 720px;
  width: 100%;
`

const PoolSection = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  column-gap: 10px;
  row-gap: 15px;
  width: 100%;
  justify-self: center;
`

const DataRow = styled(RowBetween)`
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
flex-direction: column;
`};
`

export default function CreatePool() {
  const showDelegateModal = useModalIsOpen(ApplicationModal.CREATE)
  const toggleCreateModal = useToggleCreateModal()

  const { data: allPools, loading: loadingPools } = useAllPoolsData()

  return (
    <PageWrapper gap="lg" justify="center">
      <TopSection gap="md">
        <DataCard>
          <CardBGImage />
          <CardNoise />
          <CardSection>
            <AutoColumn gap="md">
              <RowBetween>
                <ThemedText.DeprecatedWhite fontWeight={600}>
                  <Trans>Rigoblock Pools</Trans>
                </ThemedText.DeprecatedWhite>
              </RowBetween>
              <RowBetween>
                <ThemedText.DeprecatedWhite fontSize={14}>
                  <Trans>Operate with confidence on DeFi with less transactions and network impact.</Trans>
                </ThemedText.DeprecatedWhite>
              </RowBetween>{' '}
            </AutoColumn>
          </CardSection>
          <CardBGImage />
          <CardNoise />
        </DataCard>
      </TopSection>

      <AutoColumn gap="lg" style={{ width: '100%', maxWidth: '720px' }}>
        <DataRow style={{ alignItems: 'baseline' }}>
          <ThemedText.DeprecatedMediumHeader style={{ marginTop: '0.5rem' }}>
            <Trans>Pools</Trans>
          </ThemedText.DeprecatedMediumHeader>
          <CreateModal isOpen={showDelegateModal} onDismiss={toggleCreateModal} title={<Trans>Create Pool</Trans>} />
          <ButtonPrimary style={{ width: 'fit-content' }} padding="8px" $borderRadius="8px" onClick={toggleCreateModal}>
            <Trans>Create Pool</Trans>
          </ButtonPrimary>
        </DataRow>

        <PoolSection>
          {loadingPools && allPools?.length === 0 ? (
            <Loader style={{ margin: 'auto' }} />
          ) : !loadingPools && allPools?.length > 0 ? (
            <PoolPositionList positions={allPools} />
          ) : allPools?.length === 0 ? (
            <OutlineCard>
              <Trans>No pool found</Trans>
            </OutlineCard>
          ) : null}
        </PoolSection>
      </AutoColumn>
    </PageWrapper>
  )
}
