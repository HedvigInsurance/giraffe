import {
  MutationToTriggerCallMeChatResolver,
  MutationToTriggerClaimChatResolver,
  MutationToTriggerFreeTextChatResolver,
} from '../typings/generated-graphql-types'

import {
  triggerCallMeChat as triggerCallMeChatApi,
  triggerClaimChat as triggerClaimChatApi,
  triggerFreeTextChat as triggerFreeTextChatApi,
} from '../api'

export const triggerFreeTextChat: MutationToTriggerFreeTextChatResolver = async (
  _parent,
  _args,
  { getToken, headers },
) => {
  const token = getToken()
  await triggerFreeTextChatApi(token, headers)
  return true
}

export const triggerClaimChat: MutationToTriggerClaimChatResolver = async (
  _parent,
  _args,
  { getToken, headers },
) => {
  const token = getToken()
  await triggerClaimChatApi(token, headers)
  return true
}

export const triggerCallMeChat: MutationToTriggerCallMeChatResolver = async (
  _parent,
  _args,
  { getToken, headers },
) => {
  const token = getToken()
  await triggerCallMeChatApi(token, headers)
  return true
}
