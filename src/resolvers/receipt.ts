// import { getUser } from '../api'
import * as mime from 'mime'
import fetch from 'node-fetch'
import * as uuid from 'uuid'
import { esClient } from '../api/elasticsearch'
import { s3 } from '../api/s3'
import { AWS_S3_BUCKET } from '../config'
import { MutationToScanReceiptResolver } from '../typings/generated-graphql-types'
import * as receipt from '../utils/receipt'

const UPLOAD_OPTIONS = { partSize: 10 * 1024 * 1024, queueSize: 1 }
const ONE_MINUTE = 60

const uploadVendorIcon = (vendorIconUrl: string) =>
  new Promise(async (resolve) => {
    if (!vendorIconUrl) {
      return resolve(undefined)
    }

    const iconResponse = await fetch(vendorIconUrl)

    if (iconResponse.body === null) {
      return resolve(undefined)
    }

    const contentLength = iconResponse.headers.get('content-length')
    const contentType = iconResponse.headers.get('content-type')

    const iconKey = contentType
      ? `${uuid()}-vendor-icon.${mime.getExtension(contentType)}`
      : `${uuid()}-vendor-icon`

    const params = {
      Bucket: AWS_S3_BUCKET,
      Key: iconKey,
      Body: iconResponse.body,
      ContentType: iconResponse.headers.get('content-type') || undefined,
      ContentLength: contentLength ? parseInt(contentLength, 10) : undefined,
    }

    s3.upload(params, UPLOAD_OPTIONS, (err) => {
      if (err) {
        resolve(undefined)
      } else {
        resolve(iconKey)
      }
    })
  })

export const scanReceipt: MutationToScanReceiptResolver = async (
  _root,
  { key },
  {},
) => {
  // const token = getToken()
  // const user = await getUser(token, headers)

  // TODO: getToken(), getUser()
  // Check that metadata userId == getUser().userId

  // TODO: Check receiptData and make sure it is sufficient in order to save to ES and proceed with the scan

  const signedUrl = s3.getSignedUrl('getObject', {
    Bucket: AWS_S3_BUCKET,
    Key: key,
    Expires: ONE_MINUTE,
  })

  const visionData = await receipt.scanRecept(signedUrl)
  const receiptData = await receipt.parseReceipt(visionData)

  if (!receiptData) {
    // TODO
    return {}
  }

  if (receiptData.vendor.url !== null) {
    const searchResonse = await esClient.search({
      index: 'vendors',
      body: {
        query: {
          match: {
            url: receiptData.vendor.url,
          },
        },
      },
    })

    const foundVendor =
      searchResonse.hits.total > 0
        ? (searchResonse.hits.hits[0]._source as any)
        : null

    const shouldIndexVendor = () => {
      if (foundVendor === null) {
        return true
      } else {
        const updated = new Date(foundVendor.updated)
        const twoWeeksAgo = new Date()
        twoWeeksAgo.setDate(new Date().getDate() - 0)
        return updated <= twoWeeksAgo
      }
    }

    const imageDiffers = async (url1: string, url2: string) => {
      const buffer1 = await fetch(url1).then((response) => response.buffer())
      const buffer2 = await fetch(url2).then((response) => response.buffer())
      return buffer1.toString('base64') !== buffer2.toString('base64')
    }

    if (shouldIndexVendor()) {
      const vendorIconUrl =
        foundVendor !== null && foundVendor.icon !== null
          ? s3.getSignedUrl('getObject', {
              Bucket: AWS_S3_BUCKET,
              Key: foundVendor.icon,
              Expires: ONE_MINUTE,
            })
          : null

      const shouldUploadIcon =
        vendorIconUrl !== null && receiptData.vendor.icon !== null
          ? await imageDiffers(vendorIconUrl, receiptData.vendor.icon)
          : true

      const iconKey = shouldUploadIcon
        ? await uploadVendorIcon(receiptData.vendor.icon)
        : foundVendor.icon

      await esClient.index({
        index: 'vendors',
        ...(foundVendor !== null && { id: searchResonse.hits.hits[0]._id }),
        type: 'vendor',
        body: {
          name: receiptData.vendor.name,
          url: foundVendor.url,
          icon: iconKey || null,
          updated: new Date(),
        },
      })
    }
  }

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
