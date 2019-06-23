import * as mime from 'mime'
import fetch from 'node-fetch'
import * as uuid from 'uuid'
import { getUser } from '../api'
import { esClient, ReceiptDto, VendorDto } from '../api/elasticsearch'
import { s3 } from '../api/s3'
import { AWS_S3_BUCKET } from '../config'
import {
  MutationToScanReceiptResolver,
  QueryToReceiptsResolver,
} from '../typings/generated-graphql-types'
import * as receipt from '../utils/receipt'

const UPLOAD_OPTIONS = { partSize: 10 * 1024 * 1024, queueSize: 1 }
const ONE_MINUTE = 60
const THIRTY_MINUTES = 60 * 30

export const receipts: QueryToReceiptsResolver = async (
  _root,
  _args,
  { getToken, headers },
) => {
  const token = getToken()
  const user = await getUser(token, headers)

  const search = await esClient.search({
    index: 'receipts',
    body: {
      query: {
        match: {
          memberId: user.memberId,
        },
      },
    },
  })

  const foundReceipts = await Promise.all(
    search.hits.hits.map(async (r) => {
      const receipt = r._source as ReceiptDto

      const image = s3.getSignedUrl('getObject', {
        Bucket: AWS_S3_BUCKET,
        Key: receipt.image,
        Expires: THIRTY_MINUTES,
      })

      const vendorSearch = receipt.vendor
        ? await esClient.get({
            index: 'vendors',
            type: 'vendor',
            id: receipt.vendor,
          })
        : null

      console.log(vendorSearch)

      const vendor =
        vendorSearch !== null && vendorSearch.found === true
          ? (vendorSearch._source as VendorDto)
          : undefined

      const vendorIconUrl =
        vendor &&
        s3.getSignedUrl('getObject', {
          Bucket: AWS_S3_BUCKET,
          Key: vendor.icon,
          Expires: THIRTY_MINUTES,
        })

      return {
        image,
        total: receipt.total,
        currency: receipt.currency,
        date: receipt.date,
        ocr: receipt.ocr,
        vendor: {
          name: vendor && vendor.name,
          url: vendor && vendor.url,
          icon: vendorIconUrl,
        },
      }
    }),
  )

  return foundReceipts
}

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

  const indexedVendor: any = await new Promise(async (resolve) => {
    if (receiptData.vendor.url === null) {
      resolve(undefined)
    }

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
      }

      const updated = new Date(foundVendor.updated)
      const twoWeeksAgo = new Date()
      twoWeeksAgo.setDate(new Date().getDate() - 0)

      return updated <= twoWeeksAgo
    }

    const imageDiffers = async (url1: string, url2: string) => {
      const buffer1 = await fetch(url1).then((response) => response.buffer())
      const buffer2 = await fetch(url2).then((response) => response.buffer())

      return buffer1.toString('base64') !== buffer2.toString('base64')
    }

    if (shouldIndexVendor() === false) {
      resolve({
        id: searchResonse.hits.hits[0]._id,
        icon: foundVendor.icon,
      })
    }

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
      : foundVendor !== null && foundVendor.icon

    const vendorIndexReponse = await esClient.index({
      index: 'vendors',
      ...(foundVendor !== null && { id: searchResonse.hits.hits[0]._id }),
      type: 'vendor',
      body: {
        name: receiptData.vendor.name,
        url: foundVendor.url,
        icon: iconKey,
        updated: new Date(),
      },
    })

    resolve({
      id: vendorIndexReponse._id,
      icon: iconKey,
    })
  })

  await esClient.index({
    index: 'receipts',
    type: 'receipt',
    body: {
      image: key,
      total: receiptData.total,
      currency: receiptData.currency,
      date: receiptData.date,
      ocr: receiptData.ocr,
      vendor: indexedVendor !== undefined ? indexedVendor.id : null,
    },
  })

  const iconUrl =
    indexedVendor !== undefined
      ? s3.getSignedUrl('getObject', {
          Bucket: AWS_S3_BUCKET,
          Key: indexedVendor.icon,
          Expires: THIRTY_MINUTES,
        })
      : null

  return {
    ...receiptData,
    vendor: {
      ...receiptData.vendor,
      icon: iconUrl,
    },
  }
}
