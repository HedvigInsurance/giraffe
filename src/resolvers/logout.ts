import { logoutUser } from '../api'
import * as config from '../config'
import { MutationToLogoutResolver } from '../typings/generated-graphql-types'

const logout: MutationToLogoutResolver = async (
  _root,
  _args,
  { getToken, headers },
) => {
  const token = getToken()
  await logoutUser(config.BASE_URL, headers)(token)
  return true
}

export { logout }
