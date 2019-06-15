interface Rectangle {
  x: number
  y: number
  width: number
  height: number
}

interface PriceCandidate {
  value: number
  unit: string
}

interface ReceiptData {
  price: number
  currency: string
  date: string
  vendor: {
    name: string
  }
}

const totalLabels = ['total', 'totalt', 'betala']
// const currencyLabels = ['sek', 'kr', 'eur', '€', 'usd', '$']

const parseReceipt: (visionObject: any) => ReceiptData | null = (
  visionObject: any,
) => {
  const textAnnotations = visionObject[0].textAnnotations
  // const rawText = textAnnotations[0].description
  if (visionObject[0].error !== null) {
    console.log(visionObject[0].error.message)
    return null
  }

  textAnnotations.shift()

  const totalRectangles: Rectangle[] = []

  // Create rectangles of each "Total"
  textAnnotations.forEach((annotation: any) => {
    if (totalLabels.indexOf(annotation.description.toLowerCase()) >= 0) {
      const vertices = annotation.boundingPoly.vertices

      const x = vertices[0].x + Math.abs(vertices[0].x - vertices[1].x) / 2
      const y = vertices[0].y + Math.abs(vertices[1].y - vertices[2].y) / 2

      const width = Math.abs(vertices[0].x - vertices[1].x)
      const height = Math.abs(vertices[1].y - vertices[2].y)

      totalRectangles.push({
        x,
        y,
        width,
        height,
      })
    }
  })

  console.log(`"Total" rectangles`)
  console.log(totalRectangles)

  const priceCandidates: PriceCandidate[] = []

  totalRectangles.forEach((rect) => {
    const textAnnotationCandidates: any[] = []

    textAnnotations.forEach((textAnnotation: any) => {
      if (textAnnotation.description.toLowerCase() === 'total') {
        return
      }

      const vertices = textAnnotation.boundingPoly.vertices
      const y = vertices[0].y + Math.abs(vertices[1].y - vertices[2].y) / 2

      if (y >= rect.y - 15 && y <= rect.y + 15) {
        console.log('Close text')
        console.log(textAnnotation)
        textAnnotationCandidates.push(textAnnotation)
      }
    })

    const priceString = textAnnotationCandidates
      .map((textAnnoation) => textAnnoation.description)
      .join('')

    const unitMatches = priceString
      .toLowerCase()
      .match(/(kr|sek|\€|eur|\$|usd)/)
    const unit = unitMatches !== null ? unitMatches[0] : 'SEK (default)'

    const prices = priceString.match(/[0-9]+[\\.\\,][0-9][0-9]/g)

    if (prices != null) {
      const values: number[] = prices.map((price) =>
        parseFloat(price.replace(/\./, '.')),
      )

      priceCandidates.push({
        value: Math.max(...values),
        unit,
      })
    }
  })

  if (priceCandidates.length > 0) {
    const price = priceCandidates.sort((a, b) => b.value - a.value)[0]
    return {
      price: price.value,
      currency: price.unit,
      date: '',
      vendor: {
        name: '',
      },
    }
  }

  console.log(
    '😭 Could not find price based on "Total"-label. TODO: other algorithm',
  )

  return null
}
// TODO: Pure price algortithm
// TODO: Date
// TODO: Find URLs and get metadata

/*
const fs = require('fs')
const results = JSON.parse(
  fs.readFileSync(__dirname + '/receipt-dump-1.json').toString(),
)
*/
const vision = require('@google-cloud/vision')
const client = new vision.ImageAnnotatorClient()
client
  .documentTextDetection('https://i.imgur.com/ChVGX4n.jpg')
  .then(async (results: any) => {
    const receipData = parseReceipt(results)

    console.log(receipData)
  })
  .catch((error: any) => {
    console.error(error)
  })
