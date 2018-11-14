import { getChat } from '../api'
import { QueryToChatStateResolver } from '../typings/generated-graphql-types'

export const chatState: QueryToChatStateResolver = async (
  _root,
  _args,
  { getToken, headers },
) => {
  const token = getToken()
  const chat = await getChat(token, headers)
  return chat.state
}
