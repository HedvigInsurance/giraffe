import { authMember, norwegianAuthMember } from '../../api'
import { MutationToBankIdAuthResolver, MutationToNorwegianBankIdAuthResolver } from '../../typings/generated-graphql-types'

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

export const norwegianBankIdAuth: MutationToNorwegianBankIdAuthResolver = async (
  _parent,
  _args,
  { headers, getToken },
) => {
  const token = getToken()
  const norwegianAuthResult = await norwegianAuthMember(token, headers)
  const redirectUrl = norwegianAuthResult.redirectUrl

  return {
    redirectUrl,
  }
}
