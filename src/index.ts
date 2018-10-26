import * as dotenv from 'dotenv'
dotenv.config()

import { ApolloServer } from 'apollo-server-koa'
import * as Koa from 'koa'

import { execute, GraphQLError, subscribe } from 'graphql'
import { createServer } from 'http'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import * as config from './config'
import { getWebContext, getWebSocketContext } from './context'
import { loggingMiddleware } from './middlewares/logger'
import { makeSchema } from './schema'
import { factory } from './utils/log'

const logger = factory.getLogger('index')

makeSchema().then((schema) => {
  const server = new ApolloServer({
    schema,
    context: getWebContext,
    playground: config.PLAYGROUND_ENABLED && {
      subscriptionEndpoint: '/subscriptions',
    },
    introspection: true,
    formatError: (error: GraphQLError) => {
      logger.error(
        'Uncaught error in GraphQL. Original error: ',
        error.originalError,
      )
      const unsafelyCastedError = error.originalError as any
      if (
        unsafelyCastedError &&
        unsafelyCastedError.errors &&
        Array.isArray(unsafelyCastedError.errors)
      ) {
        unsafelyCastedError.errors.forEach((err: Error) =>
          logger.error('Inner error: ', err),
        )
      }
      return error
    },
    engine: config.APOLLO_ENGINE_KEY
      ? {
          apiKey: config.APOLLO_ENGINE_KEY,
        }
      : undefined,
  })

  const app = new Koa()

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
      },
      { server: ws, path: '/subscriptions' },
    )
  })
})
