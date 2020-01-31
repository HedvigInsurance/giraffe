import { ApolloLink } from 'apollo-link'
import { setContext } from 'apollo-link-context'
import { createHttpLink } from 'apollo-link-http'
import { WebSocketLink } from 'apollo-link-ws';
import { createCacheLink } from 'apollo-link-redis-cache'
import { gql, GraphQLUpload } from 'apollo-server-koa'
import { readFileSync } from 'fs'
import { GraphQLSchema } from 'graphql'
import { applyMiddleware } from 'graphql-middleware'
import { split } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';
import { SubscriptionClient } from "subscriptions-transport-ws";

import * as WebSocket from 'ws';
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

  const allowedRootFields = ['languages', 'marketingStories', "coreMLModels"]

  const transformedTranslationSchema = transformSchema(
    executableTranslationsSchema,
    [
      new FilterRootFields(
        (_, name) =>
          !!allowedRootFields.find((allowedName) => name === allowedName),
      ),
    ],
  )

  const dontPanicLink = createHttpLink({
    uri: process.env.DONT_PANIC_ENDPOINT,
    fetch: fetch as any,
  })
  let dontPanicSchema: GraphQLSchema | undefined
  try {
    logger.info('Introspecting dontPanicSchema')
    dontPanicSchema = makeRemoteExecutableSchema({
      schema: await introspectSchema(dontPanicLink),
      link: dontPanicLink,
    })
    logger.info('DontPanicSchema Introspected')
  } catch (e) {
    /* noop */
    logger.error('DontPanicSchema Introspection failed (Ignoring)')
  }

  const authorizationContextLink = setContext((_, previousContext) => ({
    headers: {
      authorization: `Bearer ${previousContext.graphqlContext &&
        previousContext.graphqlContext.getToken &&
        previousContext.graphqlContext.getToken()}`,
    },
  }))

  const optionalAuthorizationContextLink = setContext((_, previousContext) => {
    try {
       return {
         headers: {
         authorization: `Bearer ${previousContext.graphqlContext &&
           previousContext.graphqlContext.getToken &&
           previousContext.graphqlContext.getToken()}`,
       }}
     } catch(e) {
       return {}
     }
  })

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
  try {
    logger.info('Introspecting AccountServiceSchema')
    accountServiceSchema = makeRemoteExecutableSchema({
      schema: await introspectSchema(accountServiceLink),
      link: accountServiceLink,
    })
    logger.info('AccountServiceSchema Introspected')
  } catch (e) {
    /* noop */
    logger.error('AccountServiceSchema Introspection failed (Ignoring)', e)
  }

  const lookupServiceHTTPLink = createHttpLink({
    uri: process.env.LOOKUP_SERVICE_GRAPHQL_ENDPOINT,
    fetch: fetch as any,
  })

  const lookupServiceWSClient = new SubscriptionClient(process.env.LOOKUP_SERVICE_GRAPHQL_WS_ENDPOINT || "", {
    reconnect: true
  }, WebSocket);

  const lookupServiceWSLink = new WebSocketLink(lookupServiceWSClient);

  const lookupServiceLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
    },
    lookupServiceWSLink,
    lookupServiceHTTPLink,
  );

  let lookupServiceSchema: GraphQLSchema | undefined
  try {
    logger.info('Introspecting LookupServiceSchema')
    lookupServiceSchema = makeRemoteExecutableSchema({
      schema: await introspectSchema(lookupServiceLink),
      link: lookupServiceLink,
    })
    logger.info('LookupServiceSchema Introspected')
  } catch (e) {
    /* noop */
    logger.error('LookupServiceSchema Introspection failed (Ignoring)', e)
  }

  const underwriterLink = optionalAuthorizationContextLink.concat(
    createHttpLink({
      uri: process.env.UNDERWRITER_GRAPHQL_ENDPOINT,
      fetch: fetch as any,
      credentials: 'include',
    }),
  )
  let underwriterSchema: GraphQLSchema | undefined
  try {
    logger.info('Introspecting UnderwriterSchema')
    underwriterSchema = makeRemoteExecutableSchema({
      schema: await introspectSchema(underwriterLink),
      link: underwriterLink,
    })
    logger.info('UnderwriterSchema Introspected')
  } catch (e) {
    /* noop */
    logger.error('UnderwriterSchema Introspection failed (Ignoring)', e)
  }

  const appContentServiceLink = authorizationContextLink.concat(
    createHttpLink({
      uri: process.env.APP_CONTENT_SERVICE_GRAPHQL_ENDPOINT,
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
      dontPanicSchema,
      paymentServiceSchema,
      productPricingServiceSchema,
      accountServiceSchema,
      lookupServiceSchema,
      underwriterSchema,
      appContentServiceSchema,
      embarkSchema
    ].filter(Boolean) as GraphQLSchema[],
  })
  logger.info('Schemas merged')

  return applyMiddleware(schema, sentryMiddleware)
}

export { makeSchema }
