import {danishAuthMember, norwegianAuthMember, swedishAuthMember} from '../../api'
import {MutationResolvers} from '../../generated/graphql'

const bankIdAuth: MutationResolvers['bankIdAuth'] = async (
  _parent,
  _args,
  {headers, getToken},
) => {
  const token = getToken()
  const autoStartTokenResult = await swedishAuthMember(token, headers)
  const autoStartToken = autoStartTokenResult.autoStartToken

  return {
    autoStartToken,
  }
}

const swedishBankIdAuth: MutationResolvers['swedishBankIdAuth'] = async (
  _parent,
  _args,
  {headers, getToken},
) => {
  const token = getToken()
  const autoStartTokenResult = await swedishAuthMember(token, headers)
  const autoStartToken = autoStartTokenResult.autoStartToken

  return {
    autoStartToken,
  }
}

const norwegianBankIdAuth: MutationResolvers['norwegianBankIdAuth'] = async (
  _parent,
  {personalNumber},
  {headers, getToken},
) => {
  const token = getToken()
  const norwegianAuthResult = await norwegianAuthMember(token, headers, {personalNumber: personalNumber ? personalNumber : null})
  const redirectUrl = norwegianAuthResult.redirectUrl

  return {
    redirectUrl,
  }
}

const danishBankIdAuth: MutationResolvers['danishBankIdAuth'] = async (
  _parent,
  {personalNumber},
  {headers, getToken},
) => {
  const token = getToken()
  const danishAuthResult = await danishAuthMember(token, headers, {personalNumber: personalNumber})
  const redirectUrl = danishAuthResult.redirectUrl

  return {
    redirectUrl,
  }
}

export {bankIdAuth, swedishBankIdAuth, norwegianBankIdAuth, danishBankIdAuth}
