import { getChat } from '../api'
import { QueryResolvers } from '../generated/graphql'

export const chatActions: QueryResolvers['chatActions'] = async (
  _root,
  _args,
  { getToken, headers },
) => {
  const token = await getToken()
  const { fabOptions } = await getChat(token, headers)
  return fabOptions
}
