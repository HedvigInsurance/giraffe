// import { getUser } from '../api'
// import { esClient } from '../api/elasticsearch'
import { s3 } from '../api/s3'
import { AWS_S3_BUCKET } from '../config'
import { MutationToScanReceiptResolver } from '../typings/generated-graphql-types'
import * as receipt from '../utils/receipt'

const ONE_MINUTE = 60

export const scanReceipt: MutationToScanReceiptResolver = async (
  _root,
  { key },
  {},
) => {
  // const token = getToken()
  // const user = await getUser(token, headers)

  // TODO: getToken(), getUser()
  // Check that metadata userId == getUser().userId

  const signedUrl = s3.getSignedUrl('getObject', {
    Bucket: AWS_S3_BUCKET,
    Key: key,
    Expires: ONE_MINUTE,
  })

  const visionData = await receipt.scanRecept(signedUrl)

  const receiptData = await receipt.parseReceipt(visionData)

  return {
    ...receiptData,
  }
}
