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
  SchemaIdentifier,
  getCrossSchemaExtensions,
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
    identifier: SchemaIdentifier,
    source: { url?: string, authorized?: boolean, link?: ApolloLink }
  ): Promise<{ identifier: SchemaIdentifier, schema?: GraphQLSchema }> => {
    const actuallyInstrospect = async (): Promise<{ identifier: SchemaIdentifier, schema: GraphQLSchema }> => {
      const baseLink = source.authorized === true ? authorizationContextLink : optionalAuthorizationContextLink
      const link = source.link || baseLink.concat(
        createHttpLink({
          uri: source.url!,
          fetch: fetch as any,
          credentials: 'include',
        })
      )
      const schema = makeRemoteExecutableSchema({
        schema: await introspectSchema(link),
        link: link,
      })
      return { identifier, schema }
    }

    switch (config.GRAPHQL_SCHEMA_INTROSPECTION_MODE) {
      case "none": return { identifier }
      case "fault-tolerant": {
        try {
          return await actuallyInstrospect()
        } catch (e) {
          return { identifier }
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

  const graphCmsLink = ApolloLink.from([
    // @ts-ignore - false negative
    createCacheLink(redis),
    createHttpLink({
      uri: 'https://api-eu-central-1.graphcms.com/v2/cjmawd9hw036a01cuzmjhplka/master',
      fetch: fetch as any,
    })
  ])

  const allowedRootFields = [
    'languages',
    'marketingStories',
    'coreMLModels',
    'keyGearItemCoverages',
    'importantMessages',
    'appMarketingImages',
  ]

  const graphCmsSchema = await makeRemoteExecutableSchema({
    schema: await introspectSchema(graphCmsLink),
    link: graphCmsLink,
  })

  const remoteSchemas = await Promise.all([
    Promise.resolve(
      {
        identifier: SchemaIdentifier.GRAPH_CMS,
        schema: transformSchema(
          graphCmsSchema,
          [
            new FilterRootFields(
              (_, name) => !!allowedRootFields.find((allowedName) => name === allowedName)
            ),
          ],
        )
      }
    ),
    introspectRemoteSchema(
      SchemaIdentifier.API_GATEWAY,
      {
        url: process.env.API_GATEWAY_GRAPHQL_ENDPOINT,
        authorized: true
      }
    ),
    introspectRemoteSchema(
      SchemaIdentifier.PAYMENT_SERVICE,
      {
        url: process.env.PAYMENT_SERVICE_GRAPHQL_ENDPOINT,
        authorized: true
      }
    ),
    introspectRemoteSchema(
      SchemaIdentifier.PRODUCT_PRICING,
      {
        url: process.env.PRODUCT_PRICING_SERVICE_GRAPHQL_ENDPOINT,
        authorized: true
      }
    ),
    introspectRemoteSchema(
      SchemaIdentifier.ACCOUNT_SERVICE,
      {
        url: process.env.ACCOUNT_SERVICE_GRAPHQL_ENDPOINT,
        authorized: true
      }
    ),
    introspectRemoteSchema(
      SchemaIdentifier.UNDERWRITER,
      {
        url: process.env.UNDERWRITER_GRAPHQL_ENDPOINT,
        authorized: false
      }
    ),
    introspectRemoteSchema(
      SchemaIdentifier.CONTENT_SERVICE,
      {
        url: process.env.CONTENT_SERVICE_GRAPHQL_ENDPOINT,
        authorized: false
      }
    ),
    introspectRemoteSchema(
      SchemaIdentifier.EMBARK,
      {
        url: process.env.EMBARK_GRAPHQL_ENDPOINT,
        authorized: true
      }
    ),
    introspectRemoteSchema(
      SchemaIdentifier.KEY_GEAR,
      {
        url: process.env.KEY_GEAR_GRAPHQL_ENDPOINT,
        authorized: true
      }
    ),
    introspectRemoteSchema(
      SchemaIdentifier.LOOKUP_SERVICE,
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

  if (config.GRAPHQL_SCHEMA_INTROSPECTION_MODE !== 'none') {
    remoteSchemas.forEach(result => {
      if (result.schema) {
        logger.info(`Introspection of [${result.identifier}]: Success`)
      } else {
        logger.info(`Introspection of [${result.identifier}]: Failure (skipping)`)
      }
    });
  } else {
    logger.info("Schema introspection skipped")
  }

  const schemasById: Map<SchemaIdentifier, GraphQLSchema> = new Map()
  remoteSchemas.forEach((result) => {
    if (!result.schema) return
    schemasById.set(result.identifier, result.schema)
  })
  const crossSchemaExtensions = getCrossSchemaExtensions(schemasById)

  logger.info('Merging schemas')
  const schema = mergeSchemas({
    schemas: [
      localSchema,
      ...remoteSchemas.map(s => s?.schema),
      crossSchemaExtensions.extension,
    ].filter(Boolean) as GraphQLSchema[],
    resolvers: crossSchemaExtensions.resolvers,
  })

  return {
    schema: applyMiddleware(schema, sentryMiddleware),
    graphCMSSchema: graphCmsSchema,
  }
}

export { makeSchema }
