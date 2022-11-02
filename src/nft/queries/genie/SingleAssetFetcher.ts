import { CollectionInfoForAsset, GenieAsset } from '../../types'

export const fetchSingleAsset = async ({
  contractAddress,
  tokenId,
}: {
  contractAddress: string
  tokenId?: string
}): Promise<[GenieAsset, CollectionInfoForAsset]> => {
  const url = `${process.env.REACT_APP_GENIE_V3_API_URL}/assetDetails?address=${contractAddress}&tokenId=${tokenId}`
  const r = await fetch(url)
  const data = await r.json()
  console.log(data.asset[0].sellorders)
  return [data.asset[0], data.collection]
}
