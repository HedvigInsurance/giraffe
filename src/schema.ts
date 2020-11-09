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
    uri: 'https://api-euwest.graphcms.com/v1/cjmawd9hw036a01cuzmjhplka/master',
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

  const apiGatewayLink = authorizationContextLink.concat(
    createHttpLink({
      uri: process.env.API_GATEWAY_GRAPHQL_ENDPOINT,
      fetch: fetch as any,
      credentials: 'include',
    }),
  )
  let apiGatewaySchema: GraphQLSchema | undefined
  logger.info('Introspecting API Gateway schema')
  apiGatewaySchema = makeRemoteExecutableSchema({
    schema: await introspectSchema(apiGatewayLink),
    link: apiGatewayLink,
  })
  logger.info('API Gateway schema introspected')

  const paymentServiceLink = authorizationContextLink.concat(
    createHttpLink({
      uri: process.env.PAYMENT_SERVICE_GRAPHQL_ENDPOINT,
      fetch: fetch as any,
      credentials: 'include',
    }),
  )
  let paymentServiceSchema: GraphQLSchema | undefined
  logger.info('Introspecting PaymentServiceSchema')
  paymentServiceSchema = makeRemoteExecutableSchema({
    schema: await introspectSchema(paymentServiceLink),
    link: paymentServiceLink,
  })
  logger.info('PaymentServiceSchema Introspected')

  const productPricingServiceLink = authorizationContextLink.concat(
    createHttpLink({
      uri: process.env.PRODUCT_PRICING_SERVICE_GRAPHQL_ENDPOINT,
      fetch: fetch as any,
      credentials: 'include',
    }),
  )
  let productPricingServiceSchema: GraphQLSchema | undefined
  logger.info('Introspecting ProductPricingServiceSchema')
  productPricingServiceSchema = makeRemoteExecutableSchema({
    schema: await introspectSchema(productPricingServiceLink),
    link: productPricingServiceLink,
  })
  logger.info('ProductPricingServiceSchema Introspected')

  const accountServiceLink = authorizationContextLink.concat(
    createHttpLink({
      uri: process.env.ACCOUNT_SERVICE_GRAPHQL_ENDPOINT,
      fetch: fetch as any,
      credentials: 'include',
    }),
  )
  let accountServiceSchema: GraphQLSchema | undefined
  logger.info('Introspecting AccountServiceSchema')
  accountServiceSchema = makeRemoteExecutableSchema({
    schema: await introspectSchema(accountServiceLink),
    link: accountServiceLink,
  })
  logger.info('AccountServiceSchema Introspected')

  const lookupServiceHTTPLink = createHttpLink({
    uri: process.env.LOOKUP_SERVICE_GRAPHQL_ENDPOINT,
    fetch: fetch as any,
  })

  const lookupServiceWSClient = new SubscriptionClient(
    process.env.LOOKUP_SERVICE_GRAPHQL_WS_ENDPOINT || '',
    {
      reconnect: true,
    },
    WebSocket,
  )

  const lookupServiceWSLink = new WebSocketLink(lookupServiceWSClient)

  const lookupServiceLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query)
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      )
    },
    lookupServiceWSLink,
    lookupServiceHTTPLink,
  )

  let lookupServiceSchema: GraphQLSchema | undefined
  logger.info('Introspecting LookupServiceSchema')
  lookupServiceSchema = makeRemoteExecutableSchema({
    schema: await introspectSchema(lookupServiceLink),
    link: lookupServiceLink,
  })
  logger.info('LookupServiceSchema Introspected')

  const underwriterLink = optionalAuthorizationContextLink.concat(
    createHttpLink({
      uri: process.env.UNDERWRITER_GRAPHQL_ENDPOINT,
      fetch: fetch as any,
      credentials: 'include',
    }),
  )
  let underwriterSchema: GraphQLSchema | undefined
  logger.info('Introspecting UnderwriterSchema')
  underwriterSchema = makeRemoteExecutableSchema({
    schema: await introspectSchema(underwriterLink),
    link: underwriterLink,
  })
  logger.info('UnderwriterSchema Introspected')

  const appContentServiceLink = optionalAuthorizationContextLink.concat(
    createHttpLink({
      uri: process.env.CONTENT_SERVICE_GRAPHQL_ENDPOINT,
      fetch: fetch as any,
      credentials: 'include',
    }),
  )
  let appContentServiceSchema: GraphQLSchema | undefined
  logger.info('Introspecting AppContentService')
  appContentServiceSchema = makeRemoteExecutableSchema({
    schema: await introspectSchema(appContentServiceLink),
    link: appContentServiceLink,
  })

  const embarkLink = authorizationContextLink.concat(
    createHttpLink({
      uri: process.env.EMBARK_GRAPHQL_ENDPOINT,
      fetch: fetch as any,
      credentials: 'include',
    }),
  )
  let embarkSchema: GraphQLSchema | undefined
  try {
    logger.info('Introspecting Embark')
    embarkSchema = makeRemoteExecutableSchema({
      schema: await introspectSchema(embarkLink),
      link: embarkLink,
    })
  } catch (e) {
    logger.error('Embark Introspection failed (Ignoring)', e)
  }

  const keyGearLink = authorizationContextLink.concat(
    createHttpLink({
      uri: process.env.KEY_GEAR_GRAPHQL_ENDPOINT,
      fetch: fetch as any,
      credentials: 'include',
    }),
  )
  let keyGearSchema: GraphQLSchema | undefined
  logger.info('Introspecting KeyGear')
  keyGearSchema = makeRemoteExecutableSchema({
    schema: await introspectSchema(keyGearLink),
    link: keyGearLink,
  })

  const localSchema = makeExecutableSchema<Context>({
    typeDefs,
    // @ts-ignore - This type is incorrect
    resolvers: {
      Upload: GraphQLUpload,
      ...(resolvers as IResolvers<any, Context>),
    },
  })
  logger.info('AppContentService Introspected')

  logger.info('Merging schemas')
  const schema = mergeSchemas({
    schemas: [
      transformedTranslationSchema,
      localSchema,
      apiGatewaySchema,
      paymentServiceSchema,
      productPricingServiceSchema,
      accountServiceSchema,
      lookupServiceSchema,
      underwriterSchema,
      appContentServiceSchema,
      embarkSchema,
      keyGearSchema,
      crossSchemaExtensions,
    ].filter(Boolean) as GraphQLSchema[],
    resolvers: getCrossSchemaResolvers(
      transformedTranslationSchema,
      appContentServiceSchema,
    ),
  })
  logger.info('Schemas merged')

  return {
    schema: applyMiddleware(schema, sentryMiddleware),
    graphCMSSchema: executableTranslationsSchema,
  }
}

export { makeSchema }
