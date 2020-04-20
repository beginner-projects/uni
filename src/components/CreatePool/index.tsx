import React, { useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { Token, JSBI } from '@uniswap/sdk'

import Row from '../Row'
import TokenLogo from '../TokenLogo'
import SearchModal from '../SearchModal'
import AddLiquidity from '../../pages/Supply/AddLiquidity'
import { Text } from 'rebass'
import { Plus } from 'react-feather'
import { BlueCard } from '../Card'
import { TYPE, Link } from '../../theme'
import { AutoColumn, ColumnCenter } from '../Column'
import { ButtonPrimary, ButtonDropwdown, ButtonDropwdownLight } from '../Button'

import { useToken } from '../../contexts/Tokens'
import { usePair } from '../../contexts/Pairs'

const Fields = {
  TOKEN0: 0,
  TOKEN1: 1
}

function CreatePool({ history }) {
  const [showSearch, setShowSearch] = useState<boolean>(false)
  const [activeField, setActiveField] = useState<number>(Fields.TOKEN0)

  const [token0Address, setToken0Address] = useState<string>()
  const [token1Address, setToken1Address] = useState<string>()

  const token0: Token = useToken(token0Address)
  const token1: Token = useToken(token1Address)

  const [step, setStep] = useState<number>(1)

  const pair = usePair(token0, token1)
  const pairExists = // used to detect new exchange
    pair && JSBI.notEqual(pair.reserve0.raw, JSBI.BigInt(0)) && JSBI.notEqual(pair.reserve1.raw, JSBI.BigInt(0))

  useEffect(() => {
    if (token0Address && !token1Address) {
      setStep(2)
    }
    if (token0Address && token1Address && pair && !pairExists) {
      setStep(3)
    }
  }, [pair, pairExists, token0Address, token1Address])

  if (step === 3 && !pairExists) {
    return <AddLiquidity token0={token0Address} token1={token1Address} step={true} />
  } else
    return (
      <AutoColumn gap="20px">
        <BlueCard>
          <AutoColumn gap="10px">
            <TYPE.blue>{'Step ' + step + '.'} </TYPE.blue>

            {step === 1 && (
              <TYPE.blue fontWeight={400}>To create a pool you’ll need at least one unique token address. </TYPE.blue>
            )}
            {step === 1 && (
              <TYPE.blue fontWeight={400}>
                When you have it, click select token and paste it into the search field.
              </TYPE.blue>
            )}
            {step === 2 && <TYPE.blue fontWeight={400}>Select or add your 2nd token to continue.</TYPE.blue>}
          </AutoColumn>
        </BlueCard>
        <AutoColumn gap="24px">
          {!token0Address ? (
            <ButtonDropwdown
              onClick={() => {
                setShowSearch(true)
                setActiveField(Fields.TOKEN0)
              }}
            >
              <Text fontSize={20}>Select first token</Text>
            </ButtonDropwdown>
          ) : (
            <ButtonDropwdownLight
              onClick={() => {
                setShowSearch(true)
                setActiveField(Fields.TOKEN0)
              }}
            >
              <Row>
                <TokenLogo address={token0Address} />
                <Text fontWeight={500} fontSize={20} marginLeft={'12px'}>
                  {token0?.symbol}
                </Text>
              </Row>
            </ButtonDropwdownLight>
          )}
          <ColumnCenter>
            <Plus size="16" color="#888D9B" />
          </ColumnCenter>
          {!token1Address ? (
            <ButtonDropwdown
              onClick={() => {
                setShowSearch(true)
                setActiveField(Fields.TOKEN1)
              }}
              disabled={step !== 2}
            >
              <Text fontSize={20}>Select second token</Text>
            </ButtonDropwdown>
          ) : (
            <ButtonDropwdownLight
              onClick={() => {
                setShowSearch(true)
                setActiveField(Fields.TOKEN1)
              }}
            >
              <Row>
                <TokenLogo address={token1Address} />
                <Text fontWeight={500} fontSize={20} marginLeft={'12px'}>
                  {token1?.symbol}
                </Text>
              </Row>
            </ButtonDropwdownLight>
          )}

          {pairExists ? (
            <TYPE.body>
              Pool already exists! Join the pool{' '}
              <Link onClick={() => history.push('/add/' + token0Address + '-' + token1Address)}>here.</Link>
            </TYPE.body>
          ) : (
            <ButtonPrimary disabled={step !== 3}>
              <Text fontWeight={500} fontSize={20}>
                Create Pool
              </Text>
            </ButtonPrimary>
          )}
        </AutoColumn>
        <SearchModal
          isOpen={showSearch}
          filterType="tokens"
          onTokenSelect={address => {
            activeField === Fields.TOKEN0 ? setToken0Address(address) : setToken1Address(address)
          }}
          onDismiss={() => {
            setShowSearch(false)
          }}
          hiddenToken={activeField === Fields.TOKEN0 ? token1Address : token0Address}
        />
      </AutoColumn>
    )
}

export default withRouter(CreatePool)
