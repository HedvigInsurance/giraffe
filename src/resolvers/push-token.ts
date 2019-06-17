import { registerPushToken as registerPushTokenApi } from '../api'
import { MutationToRegisterPushTokenResolver } from '../typings/generated-graphql-types'

export const registerPushToken: MutationToRegisterPushTokenResolver = async (
  _root,
  { pushToken },
  { getToken, headers },
) => {
  const token = getToken()
  await registerPushTokenApi(token, headers, { token: pushToken })
  return true
}
