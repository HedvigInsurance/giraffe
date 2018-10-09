import { register } from '../api'
import * as config from '../config'
import { MutationToCreateSessionResolver } from '../typings/generated-graphql-types'

const createSession: MutationToCreateSessionResolver = async (
  _parent,
  _args,
  { headers },
) => {
  return register(config.BASE_URL, headers)()
}

export { createSession }
