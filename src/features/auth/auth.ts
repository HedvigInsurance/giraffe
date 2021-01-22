import { swedishAuthMember, norwegianAuthMember, danishAuthMember } from '../../api'
import { MutationToBankIdAuthResolver, MutationToSwedishBankIdAuthResolver, MutationToNorwegianBankIdAuthResolver, MutationToDanishBankIdAuthResolver } from '../../typings/generated-graphql-types'

const bankIdAuth: MutationToBankIdAuthResolver = async (
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

const swedishBankIdAuth: MutationToSwedishBankIdAuthResolver = async (
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

const norwegianBankIdAuth: MutationToNorwegianBankIdAuthResolver = async (
  _parent,
  { personalNumber },
  { headers, getToken },
) => {
  const token = getToken()
  const norwegianAuthResult = await norwegianAuthMember(token, headers, { personalNumber: personalNumber ? personalNumber : null })
  const redirectUrl = norwegianAuthResult.redirectUrl

  return {
    redirectUrl,
  }
}

const danishBankIdAuth: MutationToDanishBankIdAuthResolver = async (
  _parent,
  _args,
  { headers, getToken },
) => {
  const token = getToken()
  const danishAuthResult = await danishAuthMember(token, headers, { personalNumber: null })
  const redirectUrl = danishAuthResult.redirectUrl

  return {
    redirectUrl,
  }
}

export { bankIdAuth, swedishBankIdAuth, norwegianBankIdAuth, danishBankIdAuth }
