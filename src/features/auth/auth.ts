import { authMember } from '../../api'
import { MutationToBankIdAuthResolver } from '../../typings/generated-graphql-types'

export const bankIdAuth: MutationToBankIdAuthResolver = async (
  _parent,
  _args,
  { headers, getToken },
) => {
  const token = getToken()
  const autoStartTokenResult = await authMember(token, headers)
  const autoStartToken = autoStartTokenResult.autoStartToken

  return {
    autoStartToken,
  }
}
