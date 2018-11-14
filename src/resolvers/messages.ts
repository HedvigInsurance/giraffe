import { getChat } from '../api'
import {
  MessageBody,
  MessageBodyChoices,
  MessageBodyChoicesTypeResolver,
  MessageBodyCore,
  MessageBodySingleSelect,
  QueryToMessagesResolver,
} from '../typings/generated-graphql-types'
import { MessageBodyTypeResolver } from './../typings/generated-graphql-types'

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

export const messages: QueryToMessagesResolver = async (
  _root,
  _args,
  { getToken, headers },
) => {
  const token = getToken()
  const chat = await getChat(token, headers)

  return chat.messages.map((message) => {
    const messageBodyCore = message.body as MessageBodyCore
    const messageBodySingleSelect = message.body as MessageBodySingleSelect

    const messageBody: MessageBody = {
      type: messageBodyCore.type,
      id: messageBodyCore.id,
      text: messageBodyCore.text,
      choices: transformChoices(messageBodySingleSelect.choices),
    }

    return {
      ...message,
      body: messageBody,
    }
  })
}

export const __resolveType: MessageBodyTypeResolver = (obj: MessageBody) => {
  if (obj.type === 'single_select') {
    return 'MessageBodySingleSelect'
  }

  if (obj.type === 'paragraph') {
    return 'MessageBodyParagraph'
  }

  return 'MessageBodyUndefined'
}

export const __resolveMessageBodyChoicesType: MessageBodyChoicesTypeResolver = (
  obj: MessageBodyChoices,
) => {
  if (obj.type === 'selection') {
    return 'MessageBodyChoicesSelection'
  }

  if (obj.type === 'link') {
    return 'MessageBodyChoicesLink'
  }

  return 'MessageBodyChoicesUndefined'
}
