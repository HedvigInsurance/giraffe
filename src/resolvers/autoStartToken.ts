import { authMemeber } from '../api'
import {
  MutationToAutoStartTokenResolver
} from '../typings/generated-graphql-types'

const autoStartToken: MutationToAutoStartTokenResolver = async (
  _parent,
  _args,
  { headers, getToken },
) => {
  const token = getToken()
  const autoStartTokenResult = await authMemeber(token, headers)
  const autoStartTokenString = autoStartTokenResult.autoStartToken

  return  {
    autoStartTokenString
  }
}

export { autoStartToken }
