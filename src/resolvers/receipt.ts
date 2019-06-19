// import { getUser } from '../api'
import { esClient } from '../api/elasticsearch'
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

  console.log(receiptData)

  if (!receiptData) {
    return {}
  }

  if (receiptData.vendor.url !== null) {
    const res = await esClient.search({
      index: 'vendors',
      body: {
        query: {
          match: {
            url: receiptData.vendor.url,
          },
        },
      },
    })

    console.log(res)
  }

  // TODO: Check receiptData and make sure it is sufficient in order to save to ES and proceed with the scan

  await esClient.index({
    index: 'receipts',
    type: 'receipt',
    body: {
      ...receiptData,
      image: key,
    },
  })

  return {
    ...receiptData,
  }
}
