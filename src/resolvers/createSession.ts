import { register } from '../api'
import { MutationToCreateSessionResolver } from '../typings/generated-graphql-types'

const createSession: MutationToCreateSessionResolver = async (
  _parent,
  _args,
  { headers },
) => {
  return register(headers)
}

export { createSession }
