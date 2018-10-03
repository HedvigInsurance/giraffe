import { register } from '../api'
import * as config from '../config'

const createSession = async () => {
  return register(config.BASE_URL)()
}

export { createSession }
