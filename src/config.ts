const BASE_URL = process.env.BASE_URL || 'https://gateway.test.hedvig.com'
const PORT = Number(process.env.PORT) || 4000
const PLAYGROUND_ENABLED =
  (process.env.PLAYGROUND_ENABLED &&
    process.env.PLAYGROUND_ENABLED === 'true') ||
  false
const REDIS_HOSTNAME = process.env.REDIS_HOSTNAME || 'localhost'
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379

export { BASE_URL, PORT, PLAYGROUND_ENABLED, REDIS_HOSTNAME, REDIS_PORT }
