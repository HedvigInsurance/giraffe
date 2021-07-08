import { logoutUser } from '../api'
import { MutationResolvers } from '../generated/graphql'


const logout: MutationResolvers['logout'] = async (
  _root,
  _args,
  { getToken, headers },
) => {
  const token = getToken()
  await logoutUser(token, headers)
  return true
}

export { logout }
