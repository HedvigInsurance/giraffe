import { Upstream } from './../api/upstream';
import { resolve } from 'path';
import { readFileSync } from 'fs'
import { gql, GraphQLUpload, ApolloServer } from 'apollo-server-koa';
import { IResolvers, makeExecutableSchema } from 'graphql-tools';
import { Context } from '../context';
import { resolvers } from '../resolvers'
import { createTestClient } from 'apollo-server-testing'
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { DocumentNode } from 'graphql';

const typeDefs = gql(
  readFileSync(resolve(__dirname, '../schema.graphqls'), 'utf8'),
)

const fakeUpstream = (): Upstream => ({
  productPricing: {
    getContract: () => Promise.reject("getContract Not implemented"),
    getMemberContracts: () => Promise.reject("getMemberContracts Not implemented"),
    getContractMarketInfo: () => Promise.reject("getContractMarketInfo Not implemented"),
    getSelfChangeEligibility: () => Promise.reject("getSelfChangeEligibility Not implemented"),
    getTrials: () => Promise.reject("getTrials Not implemented"),
  },
  underwriter: {
    createQuote: () => Promise.reject("createQuote Not implemented"),
  },
  memberService: {
    getSelfMember: () => Promise.reject("getSelfMember Not implemented")
  }
})

const upstream = fakeUpstream()

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
  resolverValidationOptions: {
    requireResolversForResolveType: false
  },
})

interface TestingQuery {
  query: DocumentNode,
  variables?: Record<string, any>
}

interface TestingMutation {
  mutation: DocumentNode,
  variables?: Record<string, any>
}

export interface TestingContext {
  query<TResult = any>(query: TestingQuery): Promise<TResult>,
  mutate<TResult = any>(mutation: TestingMutation): Promise<TResult>,
  upstream: Upstream,
  stop(): Promise<void>
}

export const startApolloTesting = (): TestingContext => {
  afterEach(() => {
    // Reset upstream mocks between tests
    Object.assign(upstream, fakeUpstream())
  })

  const server = new ApolloServer({
    schema: localSchema,
    context: context
  })
  const { query, mutate } = createTestClient(server)
  return {
    query: async (q) => {
      const result = await query(q)
      if (result.errors) {
        throw result.errors
      }
      return result.data!!
    },
    mutate: async (m) => {
      const result = await mutate(m)
      if (result.errors) {
        throw result.errors
      }
      return result.data!!
    },
    upstream,
    stop: server.stop
  }
}
