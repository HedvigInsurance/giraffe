import {registerPushToken as registerPushTokenApi} from '../api'
import {MutationResolvers} from '../generated/graphql'

export const registerPushToken: MutationResolvers['registerPushToken'] = async (
  _root,
  {pushToken},
  {getToken, headers},
) => {
  const token = getToken()
  await registerPushTokenApi(token, headers, {token: pushToken})
  return true
}
