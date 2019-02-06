const BASE_URL = process.env.BASE_URL || 'https://gateway.test.hedvig.com'
const PORT = Number(process.env.PORT) || 4000
const PLAYGROUND_ENABLED =
  (process.env.PLAYGROUND_ENABLED &&
    process.env.PLAYGROUND_ENABLED === 'true') ||
  false
const REDIS_HOSTNAME = process.env.REDIS_HOSTNAME || 'localhost'
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379
const REDIS_CLUSTER_MODE =
  (process.env.REDIS_CLUSTER_MODE &&
    process.env.REDIS_CLUSTER_MODE === 'true') ||
  false
const GIPHY_API_KEY = process.env.GIPHY_API_KEY || ''

const AWS_KEY = process.env.AWS_KEY || ''
const AWS_SECRET = process.env.AWS_SECRET || ''
const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET || ''

const APOLLO_ENGINE_KEY = process.env.APOLLO_ENGINE_KEY || ''

const SENTRY_DSN = process.env.SENTRY_DSN || ''
const SENTRY_ENV = process.env.SENTRY_ENV || process.env.NODE_ENV || ''

export {
  BASE_URL,
  PORT,
  PLAYGROUND_ENABLED,
  REDIS_HOSTNAME,
  REDIS_PORT,
  REDIS_CLUSTER_MODE,
  AWS_KEY,
  AWS_SECRET,
  AWS_S3_BUCKET,
  GIPHY_API_KEY,
  APOLLO_ENGINE_KEY,
  SENTRY_DSN,
  SENTRY_ENV,
}
