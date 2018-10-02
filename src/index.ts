require('dotenv').config() // tslint:disable-line no-var-requires

import { ApolloServer } from 'apollo-server-koa'
import * as Koa from 'koa'

import * as config from './config'
import { context } from './context'
import { logger } from './middlewares/logger'
import { schema } from './schema'

const server = new ApolloServer({
  schema,
  context,
  playground: true,
})

const app = new Koa()

app.use(logger)
server.applyMiddleware({ app })

app.listen(
  { port: config.PORT },
  () => console.log(`Server listening at http://localhost:${config.PORT}`), // tslint:disable-line no-console
)
