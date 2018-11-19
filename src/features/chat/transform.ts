import { MessageDto } from '../../api'

import {
  Message,
  MessageBody,
  MessageBodyCore,
  MessageBodySingleSelect,
} from '../../typings/generated-graphql-types'

const transformChoices = (choices: any) => {
  if (!choices) {
    return choices
  }

  return choices.map((choice: any) => {
    if (choice.view) {
      return {
        ...choice,
        view: choice.view.toUpperCase(),
      }
    }

    return choice
  })
}

export const transformMessage: (message: MessageDto) => Message | null = (
  message: MessageDto,
) => {
  if (!message) {
    return null
  }

  const messageBodyCore = message.body as MessageBodyCore

  if (!messageBodyCore.text) {
    return null
  }

  const messageBodySingleSelect = message.body as MessageBodySingleSelect

  const messageBody: MessageBody = {
    type: messageBodyCore.type,
    id: messageBodyCore.id,
    text: messageBodyCore.text,
    choices: transformChoices(messageBodySingleSelect.choices),
  }

  return {
    id: message.id,
    globalId: message.globalId,
    header: {
      fromMyself: message.header.fromId !== 1,
      messageId: message.header.messageId,
      timeStamp: message.header.timeStamp,
      richTextChatCompatible: message.header.richTextChatCompatible,
      editAllowed: message.header.editAllowed,
      shouldRequestPushNotifications:
        message.header.shouldRequestPushNotifications || false,
    },
    body: messageBody,
  }
}

export const transformMessages: (messages: MessageDto[]) => Message[] = (
  messages: MessageDto[],
) => messages.map(transformMessage).filter((message) => !!message) as Message[]
