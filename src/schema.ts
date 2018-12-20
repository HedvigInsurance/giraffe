import { ApolloLink } from 'apollo-link'
import { createHttpLink } from 'apollo-link-http'
import { createCacheLink } from 'apollo-link-redis-cache'
import { gql, GraphQLUpload } from 'apollo-server-koa'
import { readFileSync } from 'fs'
import { applyMiddleware } from 'graphql-middleware'
import {
  FilterRootFields,
  introspectSchema,
  IResolvers,
  makeExecutableSchema,
  makeRemoteExecutableSchema,
  mergeSchemas,
  transformSchema,
} from 'graphql-tools'
import * as Redis from 'ioredis'
import fetch from 'node-fetch'
import { resolve } from 'path'
import * as config from './config'
import { Context } from './context'
import { sentryMiddleware } from './middlewares/sentry'
import { resolvers } from './resolvers'

const typeDefs = gql(
  readFileSync(resolve(__dirname, './schema.graphqls'), 'utf8'),
)

const redis = new Redis({
  host: config.REDIS_HOSTNAME,
  port: config.REDIS_PORT,
})

const makeSchema = async () => {
  const translationsLink = createHttpLink({
    uri: 'https://api-euwest.graphcms.com/v1/cjmawd9hw036a01cuzmjhplka/master',
    fetch: fetch as any,
  })

  const translationSchema = await introspectSchema(translationsLink)

  const cachedTranslationsLink = ApolloLink.from([
    createCacheLink(redis),
    translationsLink,
  ])

  const executableTranslationsSchema = makeRemoteExecutableSchema({
    schema: translationSchema,
    link: cachedTranslationsLink,
  })

  const allowedRootFields = ['languages', 'marketingStories']

  const transformedTranslationSchema = transformSchema(
    executableTranslationsSchema,
    [
      new FilterRootFields(
        (_, name) =>
          !!allowedRootFields.find((allowedName) => name === allowedName),
      ),
    ],
  )

  const localSchema = makeExecutableSchema<Context>({
    typeDefs,
    resolvers: {
      Upload: GraphQLUpload,
      ...(resolvers as IResolvers<any, Context>),
    },
  })

  const schema = mergeSchemas({
    schemas: [transformedTranslationSchema, localSchema],
  })

  return applyMiddleware(schema, sentryMiddleware)
}

export { makeSchema }
