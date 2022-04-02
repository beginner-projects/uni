import Badge from 'components/Badge'
import DarkCard from 'components/Card'
import { CardSection } from 'components/earn/styled'
import React from 'react'
import { useETHBalances } from 'state/wallet/hooks'
import { TYPE } from 'theme'

export const DonationTracker = ( ) => {
    const donationEthBalance = useETHBalances(['0x8ab5AdBa2209d8b31E104c508C7A3084FF6343Da'])?.['0x8ab5AdBa2209d8b31E104c508C7A3084FF6343Da']


    return (
        <DarkCard style={{ background: "#FFF", maxWidth: 600 }}>
            <CardSection>
                <TYPE.largeHeader>Donation Wallet</TYPE.largeHeader>
            </CardSection>

            <CardSection>
                <small>To donate, you an transfer to our donation wallet</small>
                <TYPE.main style={{overflow: 'hidden', textOverflow: 'ellipsis'}}>0x8ab5AdBa2209d8b31E104c508C7A3084FF6343Da</TYPE.main>
            </CardSection>

            <CardSection>
                <div className="d-flex">
                    <label>Current Balance</label> &nbsp;
                <Badge style={{background:'rgb(168,228,44)'}} color="#222">{donationEthBalance?.toFixed(2)} ETH</Badge>
                </div>
            </CardSection>
        </DarkCard>
    )
}