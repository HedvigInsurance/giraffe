const BASE_URL = process.env.BASE_URL || 'https://gateway.test.hedvig.com'
const PORT = Number(process.env.PORT) || 4000
const UPSTREAM_MODE = process.env.UPSTREAM_MODE || 'remote'
const LOCAL_MEMBERID_OVERRIDE: string | undefined = process.env.LOCAL_MEMBERID_OVERRIDE
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
const AWS_CLAIMS_S3_BUCKET = process.env.AWS_CLAIMS_S3_BUCKET || ''

const APOLLO_ENGINE_KEY = process.env.APOLLO_ENGINE_KEY || ''

const SENTRY_DSN = process.env.SENTRY_DSN || ''
const SENTRY_ENV = process.env.SENTRY_ENV || process.env.NODE_ENV || ''

const GOOGLE_CLOUD = process.env.GOOGLE_CLOUD || null

const ANGEL_URL = process.env.ANGEL_URL || ''

export {
  BASE_URL,
  PORT,
  UPSTREAM_MODE,
  LOCAL_MEMBERID_OVERRIDE,
  PLAYGROUND_ENABLED,
  REDIS_HOSTNAME,
  REDIS_PORT,
  REDIS_CLUSTER_MODE,
  AWS_KEY,
  AWS_SECRET,
  AWS_S3_BUCKET,
  AWS_CLAIMS_S3_BUCKET,
  GIPHY_API_KEY,
  APOLLO_ENGINE_KEY,
  SENTRY_DSN,
  SENTRY_ENV,
  GOOGLE_CLOUD,
  ANGEL_URL,
}
