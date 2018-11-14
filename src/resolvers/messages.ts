import { getChat, getUser, MessageDto } from '../api'
import { pubsub } from '../pubsub'
import {
  Message,
  MessageBody,
  MessageBodyChoices,
  MessageBodyChoicesTypeResolver,
  MessageBodyCore,
  MessageBodySingleSelect,
  QueryToMessagesResolver,
  SubscriptionToMessageResolver,
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

const transformMessages = (messages: MessageDto[]) =>
  messages.map((message) => {
    const messageBodyCore = message.body as MessageBodyCore
    const messageBodySingleSelect = message.body as MessageBodySingleSelect

    const messageBody: MessageBody = {
      type: messageBodyCore.type,
      id: messageBodyCore.id,
      text: messageBodyCore.text,
      choices: transformChoices(messageBodySingleSelect.choices),
    }

    return {
      globalId: message.globalId,
      header: {
        fromMyself: message.header.fromId != 1,
        messageId: message.header.messageId,
        timeStamp: message.header.timestamp,
        richTextChatCompatible: message.header.richTextChatCompatible,
        editAllowed: message.header.editAllowed,
        shouldRequestPushNotifications:
          message.header.shouldRequestPushNotifications,
      },
      body: messageBody,
    }
  })

export const messages: QueryToMessagesResolver = async (
  _root,
  _args,
  { getToken, headers },
) => {
  const token = getToken()
  const chat = await getChat(token, headers)
  return transformMessages(chat.messages) as Message[]
}

export const subscribeToMessage: SubscriptionToMessageResolver = {
  subscribe: async (_parent, _args, { getToken, headers }) => {
    const token = getToken()
    const user = await getUser(token, headers)
    const notifiedMessages = new Map()
    let intervalId: NodeJS.Timer | null = null

    getChat(token, headers).then(({ messages }) => {
      let originalMessages = transformMessages(messages)

      intervalId = setInterval(async () => {
        const { messages: newMessages } = await getChat(token, headers)
        const transformedNewMessages = transformMessages(newMessages)

        const messageDiff = transformedNewMessages.filter(
          (message) =>
            !originalMessages.find(
              (originalMessage) =>
                originalMessage.globalId === message.globalId,
            ),
        )

        originalMessages = transformedNewMessages

        if (messageDiff.length !== 0) {
          messageDiff.forEach((message) => {
            if (notifiedMessages.get(message.globalId)) {
              return
            }

            notifiedMessages.set(message.globalId, true)

            pubsub.publish(`MESSAGE.${user.memberId}`, {
              message,
            })
          })
        }
      }, 500)
    })

    const asyncIterator = pubsub.asyncIterator<Message>(
      `MESSAGE.${user.memberId}`,
    )

    asyncIterator.return = (value) => {
      if (intervalId) {
        clearInterval(intervalId)
      }

      return Promise.resolve({
        done: true,
        value,
      })
    }
    return asyncIterator
  },
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
