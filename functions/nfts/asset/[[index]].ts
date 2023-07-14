/* eslint-disable import/no-unused-modules */
import { PagesFunction } from '@cloudflare/workers-types'

import { MetaTagInjector } from '../../components/metaTagInjector'
import getAsset from '../../utils/getAsset'

export const onRequest: PagesFunction = async ({ params, request, next }) => {
  const { index } = params
  const collectionAddress = String(index[0])
  const tokenId = String(index[1])
  const assetPromise = getAsset(collectionAddress, tokenId, request.url)
  const resPromise = next()
  try {
    const [data, res] = await Promise.all([assetPromise, resPromise])
    if (!data) {
      return resPromise
    }
    return new HTMLRewriter().on('head', new MetaTagInjector(data)).transform(res)
  } catch (e) {
    return resPromise
  }
}
