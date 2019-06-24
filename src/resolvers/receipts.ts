import * as mime from 'mime'
import fetch from 'node-fetch'
import * as uuid from 'uuid'
import { getUser } from '../api'
import { esClient, ReceiptDto, VendorDto } from '../api/elasticsearch'
import { s3 } from '../api/s3'
import { AWS_S3_BUCKET } from '../config'
import {
  MutationToCreateReceiptResolver,
  MutationToScanReceiptResolver,
  QueryToReceiptsResolver,
} from '../typings/generated-graphql-types'
import * as receiptUtils from '../utils/receipt'

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
  new Promise<string>(async (resolve) => {
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

const indexVendor = (vendor: VendorDto) =>
  new Promise<{ id: string; icon?: string }>(async (resolve) => {
    if (!vendor.url) {
      resolve(undefined)
    }

    const searchResonse = await esClient.search({
      index: 'vendors',
      body: {
        query: {
          match: {
            url: vendor.url,
          },
        },
      },
    })

    const foundVendor =
      searchResonse.hits.total > 0
        ? (searchResonse.hits.hits[0]._source as VendorDto)
        : undefined

    const shouldIndexVendor = () => {
      if (!foundVendor) {
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

    if (shouldIndexVendor() === false && foundVendor) {
      resolve({
        id: searchResonse.hits.hits[0]._id,
        icon: foundVendor.icon,
      })
    }

    const vendorIconUrl =
      foundVendor && foundVendor.icon !== null
        ? s3.getSignedUrl('getObject', {
            Bucket: AWS_S3_BUCKET,
            Key: foundVendor.icon,
            Expires: ONE_MINUTE,
          })
        : undefined

    const shouldUploadIcon =
      vendorIconUrl && vendor.icon
        ? await imageDiffers(vendorIconUrl, vendor.icon)
        : true

    const iconKey =
      shouldUploadIcon && vendor.icon
        ? await uploadVendorIcon(vendor.icon)
        : foundVendor && foundVendor.icon

    const vendorIndexReponse = await esClient.index({
      index: 'vendors',
      ...(foundVendor && { id: searchResonse.hits.hits[0]._id }),
      type: 'vendor',
      body: {
        name: vendor.name || (foundVendor && foundVendor.name) || null,
        url: vendor.url,
        icon: iconKey || null,
        updated: vendor.updated,
      },
    })

    resolve({
      id: vendorIndexReponse._id,
      icon: iconKey,
    })
  })

export const scanReceipt: MutationToScanReceiptResolver = async (
  _root,
  { key },
  {},
) => {
  // const token = getToken()
  // const user = await getUser(token, headers) ...

  const signedUrl = s3.getSignedUrl('getObject', {
    Bucket: AWS_S3_BUCKET,
    Key: key,
    Expires: ONE_MINUTE,
  })

  const visionData = await receiptUtils.scanRecept(signedUrl)
  const receiptData = await receiptUtils.parseReceipt(visionData)

  if (!receiptData) {
    return {}
  }

  const indexedVendor = await indexVendor({
    ...receiptData.vendor,
    updated: new Date(),
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

export const createReceipt: MutationToCreateReceiptResolver = async (
  _root,
  { input },
  {},
) => {
  // const token = getToken()
  // const user = await getUser(token, headers) ...

  const { image, total, currency, date, ocr, url } = input

  const indexedVendor = url
    ? await indexVendor({
        ...(await receiptUtils.getVendor(url)),
        updated: new Date(),
      })
    : undefined

  const response = await esClient.index({
    index: 'receipts',
    type: 'receipt',
    body: {
      image,
      total,
      currency,
      date,
      ocr,
      vendor: indexedVendor !== undefined ? indexedVendor.id : null,
    },
  })

  return response.result === 'created'
}
