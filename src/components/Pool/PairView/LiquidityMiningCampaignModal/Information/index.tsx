import BigNumber from 'bignumber.js'
import { DateTime } from 'luxon'
import React, { useEffect, useState } from 'react'
import { Box, Flex } from 'rebass'
import styled from 'styled-components'
import Countdown from '../../../../Countdown'
import DataRow from '../DataRow'

const Divider = styled.div`
  height: 100%;
  width: 1px;
  background: ${props => props.theme.bg5};
`

interface LiquidityMiningInformationProps {
  startsAt?: string
  endsAt?: string
  timelock: boolean
  apy: BigNumber
}

export default function LiquidityMiningInformation({
  startsAt,
  endsAt,
  timelock,
  apy
}: LiquidityMiningInformationProps) {
  const [started, setStarted] = useState(false)

  useEffect(() => {
    setStarted(!!(startsAt && parseInt(startsAt) < Math.floor(Date.now() / 1000)))
  }, [endsAt, startsAt])

  return (
    <Flex justifyContent="stretch" width="100%">
      <Flex flexDirection="column" flex="1">
        <DataRow title="APY" value={`${apy.decimalPlaces(2).toString()}%`} />
        {started && <DataRow title="Time left" value={<Countdown to={endsAt ? parseInt(endsAt) : 0} />} />}
      </Flex>
      <Box mx="18px">
        <Divider />
      </Box>
      <Flex flexDirection="column" flex="1">
        <DataRow
          title="Starts at"
          value={DateTime.fromSeconds(startsAt ? parseInt(startsAt) : 0).toFormat('dd-MM-yyyy hh:mm')}
        />
        <DataRow
          title="Ends at"
          value={DateTime.fromSeconds(endsAt ? parseInt(endsAt) : 0).toFormat('dd-MM-yyyy hh:mm')}
        />
        <DataRow title="Timelock" value={timelock ? 'ON' : 'OFF'} />
      </Flex>
    </Flex>
  )
}
