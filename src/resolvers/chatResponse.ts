import { setChatFileResponse } from '../api'
import { MutationToSendChatFileResponseResolver } from './../typings/generated-graphql-types'

export const sendChatFileResponse: MutationToSendChatFileResponseResolver = async (
  _root,
  { input },
  { getToken, headers },
) => {
  const token = getToken()
  return setChatFileResponse(token, headers, input)
}
