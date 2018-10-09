import { RedisPubSub } from 'graphql-redis-subscriptions'
import * as Redis from 'ioredis'
import * as config from './config'

const pubsub = new RedisPubSub({
  subscriber: new Redis({
    host: config.REDIS_HOST_NAME,
    port: config.REDIS_PORT,
  }),
})

export { pubsub }
