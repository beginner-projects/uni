import { t, Trans } from '@lingui/macro'
//import Badge from 'components/Badge'
//import RangeBadge from 'components/Badge/RangeBadge'
//import Loader from 'components/Loader'
import Row, { RowBetween, RowFixed } from 'components/Row'
//import { useToken } from 'hooks/Tokens'
//import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components/macro'
import { MEDIA_WIDTHS, ThemedText } from 'theme'
import { PoolPositionDetails } from 'types/position'

const LinkRow = styled(Link)`
  align-items: center;
  display: flex;
  cursor: pointer;
  user-select: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: ${({ theme }) => theme.textPrimary};
  padding: 16px;
  text-decoration: none;
  font-weight: 500;

  & > div:not(:first-child) {
    text-align: center;
  }
  :hover {
    background-color: ${({ theme }) => theme.hoverDefault};
  }

  @media screen and (min-width: ${MEDIA_WIDTHS.deprecated_upToSmall}px) {
    /* flex-direction: row; */
  }

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    flex-direction: column;
    row-gap: 8px;
  `};
`

const PrimaryPositionIdData = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  > * {
    margin-right: 8px;
  }
`

const DataText = styled.div`
  font-weight: 600;
  font-size: 18px;

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    font-size: 18px;
  `};
`

const DataLineItem = styled.div`
  font-size: 14px;
`

const RangeLineItem = styled(DataLineItem)`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 4px;
  width: 100%;
`

const RangeText = styled.span`
  padding: 0.25rem 0.25rem;
  border-radius: 8px;
`

const ExtentsText = styled.span`
  color: ${({ theme }) => theme.textTertiary};
  font-size: 14px;
  margin-right: 4px;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    display: none;
  `};
`

const ActiveDot = styled.span<{ closed: boolean; outOfRange: boolean }>`
  background-color: ${({ theme, closed, outOfRange }) =>
    closed ? theme.textSecondary : outOfRange ? theme.accentWarning : theme.accentSuccess};
  border-radius: 50%;
  height: 8px;
  width: 8px;
  margin-left: 4px;
  margin-top: 1px;
`

interface PoolPositionListItemProps {
  positionDetails: PoolPositionDetails
  returnPage: string
}

export default function PoolPositionListItem({ positionDetails, returnPage }: PoolPositionListItemProps) {
  const { name, symbol, apr, irr, userHasStake } = positionDetails

  //const position = useMemo(() => {
  //  return new PoolPosition({ name, symbol, pool, id })
  //}, [name, symbol, pool, id])

  //const positionSummaryLink = '/smart-pool/' + positionDetails.pool '/' + positionDetails.id
  const positionSummaryLink = `/smart-pool/${positionDetails.address}/${returnPage}` ///${positionDetails.id}

  // TODO: change >staked< to something more sexy
  return (
    <LinkRow to={positionSummaryLink}>
      <RowBetween>
        <PrimaryPositionIdData>
          <Row gap="sm" justify="flex-end">
            <Row>
              <DataText>{name}</DataText>
            </Row>
            {userHasStake && (
              <>
                <ThemedText.Caption color="textSecondary">{t`active`}</ThemedText.Caption>
                <ActiveDot closed={false} outOfRange={false} />
              </>
            )}
          </Row>
        </PrimaryPositionIdData>
        {returnPage === 'mint' ? (
          <DataText>{symbol}</DataText>
        ) : (
          <RowFixed style={{ gap: '24px', marginRight: '8px' }}>
            <DataText>{(Number(irr) * 100).toFixed(1)}%</DataText>
            <DataText style={{ minWidth: '50px' }}>{(Number(apr) * 100).toFixed(1)}%</DataText>
          </RowFixed>
        )}
      </RowBetween>
      <RangeLineItem>
        <RangeText>
          <ExtentsText>
            <Trans>{positionDetails.address}</Trans>
          </ExtentsText>
        </RangeText>
      </RangeLineItem>
    </LinkRow>
  )
}
