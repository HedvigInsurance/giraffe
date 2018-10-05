import * as dotenv from 'dotenv'
dotenv.config()

import { ApolloServer, AuthenticationError } from 'apollo-server-koa'
import * as Koa from 'koa'

import { execute, subscribe } from 'graphql'
import { createServer } from 'http'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import * as config from './config'
import { context } from './context'
import { logger } from './middlewares/logger'
import { makeSchema } from './schema'

makeSchema().then((schema) => {
  const server = new ApolloServer({
    schema,
    context,
    playground: config.PLAYGROUND_ENABLED && {
      subscriptionEndpoint: '/subscriptions',
    },
  })

  const app = new Koa()

  app.use(logger)
  server.applyMiddleware({ app })

  const ws = createServer(app.callback())

  ws.listen(config.PORT, () => {
    console.log(`Server listening at http://localhost:${config.PORT}`) // tslint:disable-line no-console
    new SubscriptionServer( // tslint:disable-line no-unused-expression
      {
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
