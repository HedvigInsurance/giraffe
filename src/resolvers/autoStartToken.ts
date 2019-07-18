import { getUser, authMemeber } from '../api'
import {
  MutationToAutoStartTokenResolver
} from '../typings/generated-graphql-types'

const autoStartToken: MutationToAutoStartTokenResolver = async (
  _parent,
  _args,
  { headers, getToken },
) => {
  const user = await getUser(getToken(), headers)
  const autoStartTokenResult = await authMemeber(user.memberId, headers)
  const autoStartToken = autoStartTokenResult.autoStartToken

  return  {
    autoStartToken
  }
}

export { autoStartToken }
