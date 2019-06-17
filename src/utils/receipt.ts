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
  value: number
  currency: string
}

const totalLabels = ['total', 'totalt', 'betala', 'summa', 'due']

const currencyMap: { [key: string]: string } = {
  sek: 'SEK',
  kr: 'SEK',
  usd: 'USD',
  $: 'USD',
  eur: 'EUR',
  '€': 'EUR',
  dkk: 'DKK',
  nok: 'NOK',
}

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

  /*
  fs.writeFile(
    __dirname + '/japan-foto.json',
    JSON.stringify(visionData),
    () => {},
  )
  */

  return visionData
}

export const parseReceipt = async (visionObject: any) => {
  const textAnnotations = visionObject[0].textAnnotations
  const rawText = textAnnotations[0].description

  if (visionObject[0].error !== null) {
    return null
  }

  textAnnotations.shift()

  const getPrice = () => {
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
          console.log(textRectangle)
          textAnnotationCandidates.push(textAnnotation)
        }
      })

      const priceString = textAnnotationCandidates
        .map((textAnnoation) => textAnnoation.description)
        .join('')

      const currencyMatches = priceString
        .toLowerCase()
        .match(/(kr|sek|\€|eur|\$|usd|dkk|nok)/)
      const currency =
        currencyMatches !== null ? currencyMatches[0] : 'SEK (default)'

      const prices = priceString.match(/[0-9]+[\\.\\,][0-9][0-9]/g)

      if (prices != null) {
        const values: number[] = prices.map((price) =>
          parseFloat(price.replace(/\./, '.')),
        )

        priceCandidates.push({
          value: Math.max(...values),
          currency,
        })
      }
    })

    if (priceCandidates.length !== 0) {
      return priceCandidates.sort((a, b) => b.value - a.value)[0]
    }

    const priceStrings = rawText.match(/[0-9]+[\\.\\,][0-9][0-9]/g)
    const prices =
      priceStrings !== null
        ? priceStrings.map((price: string) =>
            parseFloat(price.replace(/\./, '.')),
          )
        : []

    const currencies = rawText
      .toLowerCase()
      .match(/(kr|sek|\€|eur|\$|usd|dkk|nok)/g)

    return {
      value: Math.max(...prices),
      currency: currencies !== null ? currencies[0] : null,
    }
  }
  const dates = rawText.match(
    /(([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))|([12]\d{3}\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01]))|([12]\d{3}\.(0[1-9]|1[0-2])\.(0[1-9]|[12]\d|3[01]))|((0[1-9]|[12]\d|3[01])-(0[1-9]|1[0-2])-[12]\d{3})|((0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/[12]\d{3})|((0[1-9]|[12]\d|3[01])\.(0[1-9]|1[0-2])\.[12]\d{3})|((0[1-9]|[12]\d|3[01])-(0[1-9]|1[0-2])-[12]\d)|((0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/[12]\d)|((0[1-9]|[12]\d|3[01])\.(0[1-9]|1[0-2])\.[12]\d))/g,
  )

  const getDate = () => {
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

  getDate()

  const urls = rawText.match(
    /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/g,
  )

  const price = getPrice()

  const metadata = urls !== null ? await getSiteMetadata(urls[0]) : null

  return {
    price: price !== null ? price.value : null,
    currency: price !== null ? currencyMap[price.currency] || 'SEK' : null,
    date: getDate(),
    vendor:
      metadata !== null
        ? {
            title: metadata.title,
            provider: metadata.provider,
            icon: metadata.icon,
            url: metadata.url,
          }
        : null,
  }
}
