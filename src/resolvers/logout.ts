import { logoutUser } from '../api'
import * as config from '../config'
import {
  Mutation,
  MutationToLogoutResolver,
} from '../typings/generated-graphql-types'

const logout: MutationToLogoutResolver<Mutation, boolean> = async (
  _root,
  _args,
  { token },
) => {
  await logoutUser(config.BASE_URL)(token)
  return true
}

export { logout }
