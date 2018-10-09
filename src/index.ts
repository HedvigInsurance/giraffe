import * as dotenv from 'dotenv'
dotenv.config()

import { ApolloServer, AuthenticationError } from 'apollo-server-koa'
import * as Koa from 'koa'

import { execute, subscribe } from 'graphql'
import { createServer } from 'http'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import * as config from './config'
import { context } from './context'
import { loggingMiddleware } from './middlewares/logger'
import { makeSchema } from './schema'
import { factory } from './utils/log'

const logger = factory.getLogger('index')

makeSchema().then((schema) => {
  const server = new ApolloServer({
    schema,
    context,
    playground: config.PLAYGROUND_ENABLED && {
      subscriptionEndpoint: '/subscriptions',
    },
    introspection: true,
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
        onConnect: (connectionParams: any) => {
          const token = connectionParams.Authorization
          return {
            getToken: () => {
              if (!token) {
                throw new AuthenticationError('Must be logged in')
              }
              return token
            },
          }
        },
      },
      { server: ws, path: '/subscriptions' },
    )
  })
})
