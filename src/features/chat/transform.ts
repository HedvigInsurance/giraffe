import { MessageDto } from '../../api'

import {
  KeyboardType,
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

export const transformMessage: (message: MessageDto) => Message = (message) => {
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
      return transformTextOrNumberBody<MessageBodyText>(bodyInput)
    }

    if (bodyInput.type === 'number') {
      return transformTextOrNumberBody<MessageBodyNumber>(bodyInput)
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
      markedAsRead: message.header.markedAsRead,
      statusMessage: message.header.statusMessage,
    },
    body: messageBody,
  }
}

const transformTextOrNumberBody = <
  T extends MessageBodyText | MessageBodyNumber
>(
  body: T & { keyboardType?: string },
): T => {
  const ret = Object.assign({}, body) // tslint:disable-line prefer-object-spread
  if (ret.keyboardType) {
    ret.keyboard = mapKeyboard(ret.keyboardType)
  }
  return ret
}

const mapKeyboard = (unmapped: string): KeyboardType => {
  switch (unmapped) {
    case 'default': {
      return KeyboardType.DEFAULT
    }
    case 'number-pad': {
      return KeyboardType.NUMBERPAD
    }
    case 'decimal-pad': {
      return KeyboardType.DECIMALPAD
    }
    case 'numeric': {
      return KeyboardType.NUMERIC
    }
    case 'email-address': {
      return KeyboardType.EMAIL
    }
    case 'phone-pad': {
      return KeyboardType.PHONE
    }
    default:
      throw Error(`unknown keyboard type: ${unmapped}`)
  }
}

export const transformMessages: (messages: MessageDto[]) => Message[] = (
  messages: MessageDto[],
) => messages.map(transformMessage).filter((message) => !!message) as Message[]
