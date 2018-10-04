const BASE_URL = process.env.BASE_URL || 'https://gateway.test.hedvig.com'
const PORT = process.env.PORT || 4000
const PLAYGROUND_ENABLED =
  (process.env.PLAYGROUND_ENABLED &&
    process.env.PLAYGROUND_ENABLED === 'true') ||
  false
const NODE_ENV = process.env.NODE_ENV || 'development'

export { BASE_URL, PORT, PLAYGROUND_ENABLED, NODE_ENV }
