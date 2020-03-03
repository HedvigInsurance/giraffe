import { swedishAuthMember, norwegianAuthMember } from '../../api'
import { MutationToBankIdAuthResolver, MutationToSwedishBankIdAuthResolver, MutationToNorwegianBankIdAuthResolver } from '../../typings/generated-graphql-types'

export const bankIdAuth: MutationToBankIdAuthResolver = async (
  _parent,
  _args,
  { headers, getToken },
) => {
  const token = getToken()
  const autoStartTokenResult = await swedishAuthMember(token, headers)
  const autoStartToken = autoStartTokenResult.autoStartToken

  return {
    autoStartToken,
  }
}

export const swedishBankIdAuth: MutationToSwedishBankIdAuthResolver = async (
  _parent,
  _args,
  { headers, getToken },
) => {
  const token = getToken()
  const autoStartTokenResult = await swedishAuthMember(token, headers)
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
