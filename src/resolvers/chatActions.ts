import { getChat } from '../api'
import { QueryToChatActionsResolver } from '../typings/generated-graphql-types'

export const chatActions: QueryToChatActionsResolver = async (
  _root,
  _args,
  { getToken, headers },
) => {
  const token = await getToken()
  const { fabOptions } = await getChat(token, headers)
  return fabOptions
}
