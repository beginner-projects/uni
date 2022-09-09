import graphql from 'babel-plugin-relay/macro'

import { TopTokensQuery$data } from './__generated__/TopTokensQuery.graphql'
export type { TopTokensQuery as TopTokenQueryType, TopTokensQuery$data } from './__generated__/TopTokensQuery.graphql'

export type TopTokensQuery$dataToken = TopTokensQuery$data['tokens'][number]

export enum TimePeriod {
  HOUR,
  DAY,
  WEEK,
  MONTH,
  YEAR,
  ALL,
}

export const query = graphql`
  query TopTokensQuery {
    tokens(first: 100, orderBy: totalValueLockedUSD, orderDirection: desc, subgraphError: allow) {
      id
      name
      symbol
      totalValueLockedUSD
      volumeUSD
    }
  }
`
