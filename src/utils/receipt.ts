import { getSiteMetadata } from './site-metadata'
const vision = require('@google-cloud/vision')
const client = new vision.ImageAnnotatorClient()

interface Rectangle {
  x: number
  y: number
  width: number
  height: number
}

interface TotalPrice {
  amount: number
  currency: Currency
}

enum Currency {
  SEK = 'SEK',
  EUR = 'EUR',
  USD = 'USD',
  DKK = 'DKK',
  NOK = 'NOK',
}

const currencyMap: { [key: string]: Currency } = {
  sek: Currency.SEK,
  kr: Currency.SEK,
  usd: Currency.USD,
  $: Currency.USD,
  eur: Currency.EUR,
  '€': Currency.EUR,
  dkk: Currency.DKK,
  nok: Currency.NOK,
}

const currencyRegex = new RegExp(
  `(${Object.keys(currencyMap)
    .map((key) => {
      return key.replace('$', '\\$')
    })
    .join('|')})`,
  'gi',
)

const totalLabels = ['total', 'totalt', 'betala', 'summa', 'due']

const getRectangle = (annotation: any): Rectangle => {
  const vertices = annotation.boundingPoly.vertices

  const x = vertices[0].x + Math.abs(vertices[0].x - vertices[1].x) / 2
  const y = vertices[0].y + Math.abs(vertices[1].y - vertices[2].y) / 2

  const width = Math.abs(vertices[0].x - vertices[1].x)
  const height = Math.abs(vertices[1].y - vertices[2].y)

  const rectangle: Rectangle = {
    x,
    y,
    width,
    height,
  }

  return rectangle
}

export const scanRecept = async (url: string) => {
  const visionData = await client.documentTextDetection(url)

  return visionData
}

export const parseReceipt = async (visionObject: any) => {
  const textAnnotations = visionObject[0].textAnnotations
  const rawText = textAnnotations[0].description

  if (visionObject[0].error !== null) {
    return null
  }

  textAnnotations.shift()

  const getTotal = () => {
    const totalRectangles: Rectangle[] = []

    textAnnotations.forEach((annotation: any) => {
      if (totalLabels.indexOf(annotation.description.toLowerCase()) >= 0) {
        const rectangle = getRectangle(annotation)
        totalRectangles.push(rectangle)
      }
    })

    const priceCandidates: TotalPrice[] = []

    totalRectangles.forEach((rect) => {
      const textAnnotationCandidates: any[] = []

      textAnnotations.forEach((textAnnotation: any) => {
        if (
          totalLabels.indexOf(textAnnotation.description.toLowerCase()) >= 0
        ) {
          return
        }

        const textRectangle = getRectangle(textAnnotation)

        if (textRectangle.y >= rect.y - 15 && textRectangle.y <= rect.y + 15) {
          textAnnotationCandidates.push(textAnnotation)
        }
      })

      const priceString = textAnnotationCandidates
        .map((textAnnoation) => textAnnoation.description)
        .join('')

      const currencyMatches = priceString.match(currencyRegex)
      const currency =
        currencyMap[
          currencyMatches !== null ? currencyMatches[0].toLowerCase() : 'sek'
        ]

      const priceMatches = priceString.match(/[0-9]+[\\.\\,][0-9][0-9]/g)

      if (priceMatches !== null) {
        const priceMatchValues: number[] = priceMatches.map((priceMatchValue) =>
          parseFloat(priceMatchValue.replace(/\./, '.')),
        )

        priceCandidates.push({
          amount: Math.max(...priceMatchValues),
          currency,
        })
      }
    })

    if (priceCandidates.length !== 0) {
      return priceCandidates.sort((a, b) => b.amount - a.amount)[0]
    }

    const priceStrings = rawText.match(/[0-9]+[\\.\\,][0-9][0-9]/g)
    const prices =
      priceStrings !== null
        ? priceStrings.map((price: string) =>
            parseFloat(price.replace(/\./, '.')),
          )
        : null

    const currencies = rawText.match(currencyRegex)

    return {
      amount: prices !== null ? Math.max(...prices) : null,
      currency:
        currencyMap[currencies !== null ? currencies[0].toLowerCase() : 'sek'],
    }
  }

  const getDate = () => {
    const dates = rawText.match(
      /(([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))|([12]\d{3}\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01]))|([12]\d{3}\.(0[1-9]|1[0-2])\.(0[1-9]|[12]\d|3[01]))|((0[1-9]|[12]\d|3[01])-(0[1-9]|1[0-2])-[12]\d{3})|((0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/[12]\d{3})|((0[1-9]|[12]\d|3[01])\.(0[1-9]|1[0-2])\.[12]\d{3})|((0[1-9]|[12]\d|3[01])-(0[1-9]|1[0-2])-[12]\d)|((0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/[12]\d)|((0[1-9]|[12]\d|3[01])\.(0[1-9]|1[0-2])\.[12]\d))/g,
    )

    if (dates !== null) {
      const rawDate = dates[0]
      const dateParseable = rawDate.match(
        /(([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))|([12]\d{3}\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01]))|([12]\d{3}\.(0[1-9]|1[0-2])\.(0[1-9]|[12]\d|3[01]))|((0[1-9]|[12]\d|3[01])-(0[1-9]|1[0-2])-[12]\d{3})|((0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/[12]\d{3})|((0[1-9]|[12]\d|3[01])\.(0[1-9]|1[0-2])\.[12]\d{3}))/g,
      )

      if (dateParseable) {
        return new Date(rawDate)
      }

      const rearrangedDate =
        '20' +
        rawDate.substring(6, 8) +
        '-' +
        rawDate.substring(3, 5) +
        '-' +
        rawDate.substring(0, 2)

      return new Date(rearrangedDate)
    }

    return null
  }

  const getVendor = async () => {
    const urls = rawText.match(
      /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/g,
    )

    const metadata = urls !== null ? await getSiteMetadata(urls[0]) : null

    const provider =
      metadata && metadata.provider
        ? metadata.provider.charAt(0).toUpperCase() +
          metadata.provider.substring(1)
        : null

    const matchedUrl =
      metadata && metadata.url
        ? metadata.url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i)
        : null
    const baseUrl = matchedUrl && matchedUrl[1].replace(/^www\./gi, '')

    const icon = (metadata && metadata.icon) || null

    return {
      name: provider,
      url: baseUrl,
      icon,
    }
  }

  const total = getTotal()
  const date = getDate()
  const vendor = await getVendor()

  return {
    total: total.amount,
    currency: total.currency,
    date,
    ocr: rawText,
    vendor,
  }
}
