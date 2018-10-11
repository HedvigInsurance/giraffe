import { logoutUser } from '../api'
import { MutationToLogoutResolver } from '../typings/generated-graphql-types'

const logout: MutationToLogoutResolver = async (
  _root,
  _args,
  { getToken, headers },
) => {
  const token = getToken()
  await logoutUser(token, headers)
  return true
}

export { logout }
