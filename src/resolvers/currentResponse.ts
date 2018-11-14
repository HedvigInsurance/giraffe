import { getChat } from '../api'
import {
  MessageBody,
  MessageBodyCore,
  MessageBodySingleSelect,
  MessageHeader,
  QueryToCurrentResponseResolver,
} from '../typings/generated-graphql-types'

export const currentResponse: QueryToCurrentResponseResolver = async (
  _root,
  _args,
  { getToken, headers },
) => {
  const token = getToken()
  const chat = await getChat(token, headers)

  const firstMessage = chat.messages[0]

  const messageBodyCore = firstMessage.body as MessageBodyCore
  const messageBodySingleSelect = firstMessage.body as MessageBodySingleSelect

  const messageBody: MessageBody = {
    type: messageBodyCore.type,
    id: messageBodyCore.id,
    text: messageBodyCore.text,
    choices: messageBodySingleSelect.choices,
  }

  const messageHeader: MessageHeader = {
    messageId: firstMessage.header.messageId,
    timeStamp: '',
    fromMyself: firstMessage.header.fromMyself,
    richTextChatCompatible: false,
    editAllowed: false,
    shouldRequestPushNotifications: false,
  }

  return {
    ...firstMessage,
    header: messageHeader,
    body: messageBody,
  }
}
