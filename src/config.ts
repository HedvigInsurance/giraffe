const BASE_URL = process.env.BASE_URL || 'https://gateway.test.hedvig.com'
const PORT = process.env.PORT || 4000
const PLAYGROUND_ENABLED =
  (process.env.PLAYGROUND_ENABLED &&
    process.env.PLAYGROUND_ENABLED === 'true') ||
  false

export { BASE_URL, PORT, PLAYGROUND_ENABLED }
