const BASE_URL = process.env.BASE_URL || 'https://gateway.test.hedvig.com'
const PORT = Number(process.env.PORT) || 4000
const PLAYGROUND_ENABLED =
  (process.env.PLAYGROUND_ENABLED &&
    process.env.PLAYGROUND_ENABLED === 'true') ||
  false
const REDIS_HOSTNAME = process.env.REDIS_HOSTNAME || 'localhost'
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || ''
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || ''
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || ''

export {
  BASE_URL,
  PORT,
  PLAYGROUND_ENABLED,
  REDIS_HOSTNAME,
  REDIS_PORT,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
}
