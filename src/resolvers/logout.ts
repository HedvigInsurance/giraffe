import { IFieldResolver } from 'graphql-tools'
import { logoutUser } from '../api'
import * as config from '../config'

const logout: IFieldResolver<any, any, any> = async (
  _root,
  _args,
  { getToken },
) => {
  const token = getToken()
  await logoutUser(config.BASE_URL)(token)
  return true
}

export { logout }
