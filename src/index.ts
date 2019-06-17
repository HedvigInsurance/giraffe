import * as dotenv from 'dotenv'
dotenv.config()

import { ApolloServer } from 'apollo-server-koa'
import * as Koa from 'koa'
import * as compress from 'koa-compress'

import { execute, GraphQLError, subscribe } from 'graphql'
import { createServer } from 'http'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import * as config from './config'
import { getWebContext, getWebSocketContext } from './context'
import { loggingMiddleware } from './middlewares/logger'
import { makeSchema } from './schema'
import { factory } from './utils/log'

import * as Sentry from '@sentry/node'
import { getInnerErrorsFromCombinedError } from './utils/graphql-error'

import { getSiteMetadata } from './utils/site-metadata'

Sentry.init({
  dsn: config.SENTRY_DSN,
  enabled: Boolean(config.SENTRY_DSN),
  environment: config.SENTRY_ENV,
})

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

const totalLabels = ['total', 'totalt', 'betala', 'summa', 'due']

const parseReceipt = async (visionObject: any) => {
  const textAnnotations = visionObject[0].textAnnotations
  const rawText = textAnnotations[0].description

  if (visionObject[0].error !== null) {
    console.log(visionObject[0].error.message)
    return null
  }

  textAnnotations.shift()

  const getPrice = () => {
    const totalRectangles: Rectangle[] = []

    // Create rectangles of each "Total"-label
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
    /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/g,
  )

  const urls = rawText.match(
    /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/g,
  )

  const price = getPrice()

  const metadata = urls.length > 0 ? await getSiteMetadata(urls[0]) : null

  return {
    price: price !== null ? price.value : null,
    currency: price !== null ? price.currency : null,
    date: dates.length > 0 ? dates[0] : null,
    vendor: {
      title: metadata.title,
      provider: metadata.provider,
      icon: metadata.icon,
      url: metadata.url,
    },
  }
}
const fs = require('fs')

const getReceiptData = async () => {
  const results = JSON.parse(
    fs.readFileSync(__dirname + '/mac-dk-receipt.json').toString(),
  )

  const receipData = await parseReceipt(results)
  console.log(receipData)
}

getReceiptData()

/*
const vision = require('@google-cloud/vision')
const client = new vision.ImageAnnotatorClient()
client
  .documentTextDetection('https://i.imgur.com/mAuvj48.jpg')
  .then(async (results: any) => {
    fs.writeFile(
      __dirname + '/mac-dk-receipt.json',
      JSON.stringify(results),
      () => {},
    )
    const receipData = await parseReceipt(results)

    console.log(receipData)
  })
  .catch((error: any) => {
    console.error(error)
  })*/

const logger = factory.getLogger('index')

const handleError = (error: GraphQLError): void => {
  logger.error(
    'Uncaught error in GraphQL. Original error: ',
    error.originalError,
  )

  getInnerErrorsFromCombinedError(error).forEach((err) =>
    logger.error('Inner error: ', err),
  )
}
makeSchema().then((schema) => {
  const server = new ApolloServer({
    schema,
    context: getWebContext,
    playground: config.PLAYGROUND_ENABLED && {
      subscriptionEndpoint: '/subscriptions',
    },
    introspection: true,
    formatError: (error: GraphQLError) => {
      handleError(error)
      return error
    },
    engine: config.APOLLO_ENGINE_KEY
      ? {
          apiKey: config.APOLLO_ENGINE_KEY,
        }
      : undefined,
  })
  const app = new Koa()

  app.use(compress())
  app.use(loggingMiddleware)
  server.applyMiddleware({ app })

  const ws = createServer(app.callback())

  ws.listen(config.PORT, () => {
    logger.info(`Server listening at http://localhost:${config.PORT}`)
    new SubscriptionServer( // tslint:disable-line no-unused-expression
      {
        keepAlive: 10_000,
        execute,
        subscribe,
        schema,
        onConnect: getWebSocketContext,
        onOperation: (_msg: any, params: any) => {
          params.formatResponse = (response: any) => {
            if (response.errors) {
              response.errors.forEach(handleError)
            }
            return response
          }
          return params
        },
      },
      { server: ws, path: '/subscriptions' },
    )
  })
})
