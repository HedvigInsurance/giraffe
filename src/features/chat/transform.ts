import { MessageDto } from '../../api'

import {
  Message,
  MessageBody,
  MessageBodyAudio,
  MessageBodyBankIdCollect,
  MessageBodyFile,
  MessageBodyMultipleSelect,
  MessageBodyNumber,
  MessageBodyParagraph,
  MessageBodySingleSelect,
  MessageBodyText,
  MessageBodyUndefined,
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

  // const messageBodyCore = message.body as MessageBodyCore

  /*
  if (!messageBodyCore.text) {
    return null
  }

  */
  const getBody: (bodyInput: MessageBody) => MessageBody = (bodyInput) => {
    if (bodyInput.type === 'single_select') {
      const body = bodyInput as MessageBodySingleSelect
      body.choices = transformChoices(body.choices)
      return body
    }

    if (bodyInput.type === 'multiple_select') {
      const body = bodyInput as MessageBodyMultipleSelect
      body.choices = transformChoices(body.choices)
      return body
    }

    if (bodyInput.type === 'text') {
      return bodyInput as MessageBodyText
    }

    if (bodyInput.type === 'number') {
      return bodyInput as MessageBodyNumber
    }

    if (bodyInput.type === 'audio') {
      return bodyInput as MessageBodyAudio
    }

    if (bodyInput.type === 'bankid_collect') {
      return bodyInput as MessageBodyBankIdCollect
    }

    if (bodyInput.type === 'file_upload') {
      return bodyInput as MessageBodyFile
    }

    if (bodyInput.type === 'paragraph') {
      return bodyInput as MessageBodyParagraph
    }

    return bodyInput as MessageBodyUndefined
  }

  const messageBody = getBody(message.body as MessageBody)

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
      pollingInterval: message.header.pollingInterval,
      loadingIndicator: message.header.loadingIndicator,
    },
    body: messageBody,
  }
}

export const transformMessages: (messages: MessageDto[]) => Message[] = (
  messages: MessageDto[],
) => messages.map(transformMessage).filter((message) => !!message) as Message[]
