
import { Upstream } from './../api/upstream';
import { resolve } from 'path';
import { readFileSync } from 'fs'
import { gql, GraphQLUpload, ApolloServer } from 'apollo-server-koa';
import { IResolvers, makeExecutableSchema } from 'graphql-tools';
import { Context } from '../context';
import { resolvers } from '../resolvers'
import { ApolloServerTestClient, createTestClient } from 'apollo-server-testing'
import { RedisPubSub } from 'graphql-redis-subscriptions';

const typeDefs = gql(
  readFileSync(resolve(__dirname, '../schema.graphqls'), 'utf8'),
)

const upstream: Upstream = {
  productPricing: {
    getContract: () => Promise.reject("getContract Not implemented"),
    getMemberContracts: () => Promise.reject("getMemberContracts Not implemented"),
    getContractMarketInfo: () => Promise.reject("getContractMarketInfo Not implemented"),
    getSelfChangeEligibility: () => Promise.reject("getSelfChangeEligibility Not implemented")
  },
  underwriter: {
    createQuote: (_) => Promise.reject("createQuote Not implemented")
  },
  memberService: {
    getSelfMember: () => Promise.reject("getSelfMember Not implemented")
  }
}

const context: Context = {
    getToken: () => 'test-token',
    headers: {
      'User-Agent': 'Testing',
      'X-Forwarded-For': 'Testing',
      'X-Request-Id': 'Testing',
      'Accept-Language': 'en',
      'Enable-Simple-Sign': 'false',
    },
    remoteIp: '127.0.0.1',
    upstream: upstream,
    pubsub: {} as RedisPubSub, // fake this at some point
    strings: (key) => key
}

const localSchema = makeExecutableSchema<Context>({
  typeDefs,
  // @ts-ignore - This type is incorrect
  resolvers: {
    Upload: GraphQLUpload,
    ...(resolvers as IResolvers<any, Context>),
  },
})

export interface TestingContext {
  query: ApolloServerTestClient['query'],
  mutate: ApolloServerTestClient['mutate'],
  upstream: Upstream,
  stop(): Promise<void>
}

export const startApolloTesting = (): TestingContext => {
  const server = new ApolloServer({
    schema: localSchema,
    context: context
  })
  const { query, mutate } = createTestClient(server)
  return {
    query,
    mutate,
    upstream,
    stop: server.stop
  }
}
