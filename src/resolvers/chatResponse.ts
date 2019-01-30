import { setChatResponse, setChatSingleSelectResponse } from '../api'
import { setChatAudioResponse, setChatFileResponse } from './../api/index'
import {
  MutationToSendChatAudioResponseResolver,
  MutationToSendChatFileResponseResolver,
  MutationToSendChatSingleSelectResponseResolver,
  MutationToSendChatTextResponseResolver,
} from './../typings/generated-graphql-types'

export const sendChatTextResponse: MutationToSendChatTextResponseResolver = async (
  _root,
  { input },
  { getToken, headers },
) => {
  const token = getToken()
  console.log(input)
  console.log('hit')
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

export const sendChatFileResponse: MutationToSendChatFileResponseResolver = async (
  _root,
  { input },
  { getToken, headers },
) => {
  const token = getToken()
  return setChatFileResponse(token, headers, input)
}

export const sendChatAudioResponse: MutationToSendChatAudioResponseResolver = async (
  _root,
  { input },
  { getToken, headers },
) => {
  const token = getToken()
  return setChatAudioResponse(token, headers, input)
}
