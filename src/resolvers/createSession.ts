import { register } from '../api'
import * as config from '../config'
import { MutationToCreateSessionResolver } from '../typings/generated-graphql-types'

const createSession: MutationToCreateSessionResolver = async () => {
  return register(config.BASE_URL)()
}

export { createSession }
