import { setChatResponse, setChatSingleSelectResponse } from '../api'
import {
  MutationToSendChatSingleSelectResponseResolver,
  MutationToSendChatTextResponseResolver,
} from './../typings/generated-graphql-types'

export const sendChatTextResponse: MutationToSendChatTextResponseResolver = async (
  _root,
  { input },
  { getToken, headers },
) => {
  const token = getToken()
  return setChatResponse(token, headers, input)
}

export const sendChatSingleSelectResponse: MutationToSendChatSingleSelectResponseResolver = async (
  _root,
  { input },
  { getToken, headers },
) => {
  const token = getToken()
  return setChatSingleSelectResponse(token, headers, input)
}
