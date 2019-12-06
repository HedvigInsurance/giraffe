import * as dotenv from 'dotenv'
dotenv.config()

import './utils/tracer'

import { ApolloServer } from 'apollo-server-koa'
import * as Koa from 'koa'
import * as proxy from 'koa-better-http-proxy'
import * as compress from 'koa-compress'
import * as route from 'koa-route'

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
Sentry.init({
  dsn: config.SENTRY_DSN,
  enabled: Boolean(config.SENTRY_DSN),
  environment: config.SENTRY_ENV,
})

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

makeSchema()
  .then((schema) => {
    logger.info('Schema initialized')
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

    logger.info('Created Apollo Server')

    const app = new Koa()

    logger.info('Created Koa server')

    app.use(compress())

    logger.info('Added compress middleware')
    app.use(loggingMiddleware)
    logger.info('Added logging middleware')
    server.applyMiddleware({ app })
    logger.info('Added Apollo Server Middleware')

    if (process.env.APP_CONTENT_SERVICE_PUBLIC_ENDPOINT) {
      app.use(
        route.get(
          '/app-content-service/*',
          // @ts-ignore - False positive
          proxy(process.env.APP_CONTENT_SERVICE_PUBLIC_ENDPOINT, {}),
        ),
      )
      logger.info('Added app-content-service proxy middleware')
    }

    logger.info('Creating http server')
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
  .catch((e) => logger.error('Unable to start service', e))
