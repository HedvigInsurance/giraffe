import { RedisPubSub } from 'graphql-redis-subscriptions'
import * as config from './config'

const pubsub = new RedisPubSub({
  connection: {
    host: config.REDIS_HOSTNAME,
    port: config.REDIS_PORT,
  },
})

export { pubsub }
