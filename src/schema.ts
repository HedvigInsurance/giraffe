import { ApolloLink, split } from 'apollo-link'
import { setContext } from 'apollo-link-context'
import { createHttpLink } from 'apollo-link-http'
import { createCacheLink } from 'apollo-link-redis-cache'
import { WebSocketLink } from 'apollo-link-ws'
import { gql, GraphQLUpload } from 'apollo-server-koa'
import { getMainDefinition } from 'apollo-utilities'
import { readFileSync } from 'fs'
import { GraphQLSchema } from 'graphql'
import { applyMiddleware } from 'graphql-middleware'
import { SubscriptionClient } from 'subscriptions-transport-ws'

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
import * as WebSocket from 'ws'
import * as config from './config'
import { Context } from './context'
import { sentryMiddleware } from './middlewares/sentry'
import { resolvers } from './resolvers'
import {
  crossSchemaExtensions,
  getCrossSchemaResolvers,
} from './resolvers/cross-schema'
import { factory } from './utils/log'

const logger = factory.getLogger('schemaLogger')

const typeDefs = gql(
  readFileSync(resolve(__dirname, './schema.graphqls'), 'utf8'),
)

const redis = config.REDIS_CLUSTER_MODE
  ? new Redis.Cluster([
      {
        host: config.REDIS_HOSTNAME,
        port: config.REDIS_PORT,
      },
    ])
  : new Redis({ host: config.REDIS_HOSTNAME, port: config.REDIS_PORT })

const makeSchema = async () => {
  logger.info('Initializing schema')
  const translationsLink = createHttpLink({
    uri: 'https://api-eu-central-1.graphcms.com/v2/cjmawd9hw036a01cuzmjhplka/master',
    fetch: fetch as any,
  })

  logger.info('Introspecting graphcms schema')
  const translationSchema = await introspectSchema(translationsLink)
  logger.info('Graphcms schema introspected')

  const cachedTranslationsLink = ApolloLink.from([
    // @ts-ignore - false negative
    createCacheLink(redis),
    translationsLink,
  ])

  const executableTranslationsSchema = makeRemoteExecutableSchema({
    schema: translationSchema,
    link: cachedTranslationsLink,
  })

  const allowedRootFields = [
    'languages',
    'marketingStories',
    'coreMLModels',
    'keyGearItemCoverages',
    'importantMessages',
    'appMarketingImages',
  ]

  const transformedTranslationSchema = transformSchema(
    executableTranslationsSchema,
    [
      new FilterRootFields(
        (_, name) =>
          !!allowedRootFields.find((allowedName) => name === allowedName),
      ),
    ],
  )

  const authorizationContextLink = setContext((_, previousContext) => ({
    headers: {
      authorization: `Bearer ${previousContext.graphqlContext &&
        previousContext.graphqlContext.getToken &&
        previousContext.graphqlContext.getToken()}`,
      ...(previousContext.graphqlContext &&
        previousContext.graphqlContext.headers),
    },
  }))

  const optionalAuthorizationContextLink = setContext((_, previousContext) => {
    try {
      return {
        headers: {
          authorization: `Bearer ${previousContext.graphqlContext &&
            previousContext.graphqlContext.getToken &&
            previousContext.graphqlContext.getToken()}`,
          ...(previousContext.graphqlContext &&
            previousContext.graphqlContext.headers),
        },
      }
    } catch (e) {
      return {
        ...(previousContext.graphqlContext &&
          previousContext.graphqlContext.headers),
      }
    }
  })

  const introspectRemoteSchema = async (
    name: string,
    source: { url?: string, authorized?: boolean, link?: ApolloLink }
  ): Promise<GraphQLSchema | undefined> => {
    const actuallyInstrospect = async (): Promise<GraphQLSchema> => {
      const baseLink = source.authorized === true ? authorizationContextLink : optionalAuthorizationContextLink
      const link = source.link || baseLink.concat(
        createHttpLink({
          uri: source.url!,
          fetch: fetch as any,
          credentials: 'include',
        })
      )
      logger.info(`Introspecting GraphQL schema for: ${name}`)
      const schema = makeRemoteExecutableSchema({
        schema: await introspectSchema(link),
        link: link,
      })
      logger.info(`Introspecting GraphQL schema for: ${name} - Success!`)
      return schema
    }

    switch (config.GRAPHQL_SCHEMA_INTROSPECTION_MODE) {
      case "none": return undefined
      case "fault-tolerant": {
        try {
          return await actuallyInstrospect()
        } catch (e) {
          logger.error(`Introspection failed (Ignoring) for: ${name}`, e)
          return undefined
        }
      }
    }
    return await actuallyInstrospect()
  }

  const localSchema = makeExecutableSchema<Context>({
    typeDefs,
    // @ts-ignore - This type is incorrect
    resolvers: {
      Upload: GraphQLUpload,
      ...(resolvers as IResolvers<any, Context>),
    },
  })
  const contentServiceSchema = introspectRemoteSchema(
    "content-service",
    {
      url: process.env.CONTENT_SERVICE_GRAPHQL_ENDPOINT,
      authorized: false
    }
  )
  const remoteSchemas = await Promise.all([
    contentServiceSchema,
    introspectRemoteSchema(
      "api-gateway",
      {
        url: process.env.API_GATEWAY_GRAPHQL_ENDPOINT,
        authorized: true
      }
    ),
    introspectRemoteSchema(
      "payment-service",
      {
        url: process.env.PAYMENT_SERVICE_GRAPHQL_ENDPOINT,
        authorized: true
      }
    ),
    introspectRemoteSchema(
      "product-pricing",
      {
        url: process.env.PRODUCT_PRICING_SERVICE_GRAPHQL_ENDPOINT,
        authorized: true
      }
    ),
    introspectRemoteSchema(
      "account-service",
      {
        url: process.env.ACCOUNT_SERVICE_GRAPHQL_ENDPOINT,
        authorized: true
      }
    ),
    introspectRemoteSchema(
      "underwriter",
      {
        url: process.env.UNDERWRITER_GRAPHQL_ENDPOINT,
        authorized: false
      }
    ),
    introspectRemoteSchema(
      "content-service",
      {
        url: process.env.CONTENT_SERVICE_GRAPHQL_ENDPOINT,
        authorized: false
      }
    ),
    introspectRemoteSchema(
      "embark",
      {
        url: process.env.EMBARK_GRAPHQL_ENDPOINT,
        authorized: true
      }
    ),
    introspectRemoteSchema(
      "key-gear",
      {
        url: process.env.KEY_GEAR_GRAPHQL_ENDPOINT,
        authorized: true
      }
    ),
    introspectRemoteSchema(
      "lookup-service",
      {
        link: split(
          ({ query }) => {
            const definition = getMainDefinition(query)
            return (
              definition.kind === 'OperationDefinition' &&
              definition.operation === 'subscription'
            )
          },
          new WebSocketLink(
            new SubscriptionClient(
              process.env.LOOKUP_SERVICE_GRAPHQL_WS_ENDPOINT || '',
              {
                reconnect: true,
              },
              WebSocket,
            )
          ),
          createHttpLink({
            uri: process.env.LOOKUP_SERVICE_GRAPHQL_ENDPOINT,
            fetch: fetch as any,
          }),
        )
      }
    )
  ])

  const extensions: string | undefined = config.GRAPHQL_SCHEMA_INTROSPECTION_MODE !== "none"
    ? crossSchemaExtensions
    : undefined
  const extensionResolvers: IResolvers | undefined = config.GRAPHQL_SCHEMA_INTROSPECTION_MODE !== "none"
    ? getCrossSchemaResolvers(transformedTranslationSchema, (await contentServiceSchema)!)
    : undefined

  logger.info('Merging schemas')
  const schema = mergeSchemas({
    schemas: [
      transformedTranslationSchema,
      localSchema,
      ...remoteSchemas,
      extensions,
    ].filter(Boolean) as GraphQLSchema[],
    resolvers: extensionResolvers,
  })
  logger.info('Schemas merged')

  return {
    schema: applyMiddleware(schema, sentryMiddleware),
    graphCMSSchema: executableTranslationsSchema,
  }
}

export { makeSchema }
