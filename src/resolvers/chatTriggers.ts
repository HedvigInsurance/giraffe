import {MutationResolvers} from '../generated/graphql'

import {
  triggerCallMeChat as triggerCallMeChatApi,
  triggerClaimChat as triggerClaimChatApi,
  triggerFreeTextChat as triggerFreeTextChatApi,
} from '../api'

export const triggerFreeTextChat: MutationResolvers['triggerFreeTextChat'] = async (
  _parent,
  _args,
  {getToken, headers},
) => {
  const token = getToken()
  await triggerFreeTextChatApi(token, headers)
  return true
}

export const triggerClaimChat: MutationResolvers['triggerClaimChat'] = async (
  _parent,
  _args,
  {getToken, headers},
) => {
  const token = getToken()
  await triggerClaimChatApi(token, headers)
  return true
}

export const triggerCallMeChat: MutationResolvers['triggerCallMeChat'] = async (
  _parent,
  _args,
  {getToken, headers},
) => {
  const token = getToken()
  await triggerCallMeChatApi(token, headers)
  return true
}
