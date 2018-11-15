import { setChatResponse } from '../api'
import { MutationToSendChatTextResponseResolver } from './../typings/generated-graphql-types'

export const sendChatTextResponse: MutationToSendChatTextResponseResolver = async (
  _root,
  { input },
  { getToken, headers },
) => {
  const token = getToken()
  return setChatResponse(token, headers, input)
}
