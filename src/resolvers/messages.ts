import { ChatDto, getChat, getUser } from '../api'
import { pubsub } from '../pubsub'
import {
  Message,
  MessageBody,
  MessageBodyChoices,
  MessageBodyChoicesTypeResolver,
  QueryToMessagesResolver,
  SubscriptionToMessageResolver,
} from '../typings/generated-graphql-types'
import { MessageBodyTypeResolver } from './../typings/generated-graphql-types'

import { subscribeToChat } from '../features/chat/chatSubscription'
import { transformMessages } from '../features/chat/transform'

export const messages: QueryToMessagesResolver = async (
  _root,
  _args,
  { getToken, headers },
) => {
  const token = getToken()
  const chat = await getChat(token, headers)
  return transformMessages(chat.messages)
}

export const subscribeToMessage: SubscriptionToMessageResolver = {
  subscribe: async (_parent, _args, { getToken, headers }) => {
    const token = getToken()
    const user = await getUser(token, headers)

    const unsubscribe = subscribeToChat(
      {
        token,
        memberId: user.memberId,
        headers,
      },
      (chat: ChatDto, previousChat: ChatDto) => {
        const transformedPreviousMessages = transformMessages(
          previousChat.messages,
        )
        const transformedNewMessages = transformMessages(chat.messages)

        const messageDiff = transformedNewMessages
          .filter(
            (message) =>
              !transformedPreviousMessages.find(
                (previousMessage) =>
                  previousMessage!.globalId === message!.globalId,
              ),
          )
          .reverse()

        if (messageDiff.length !== 0) {
          messageDiff.forEach((message) => {
            pubsub.publish(`MESSAGE.${user.memberId}`, {
              message,
            })
          })
        }
      },
    )

    const asyncIterator = pubsub.asyncIterator<Message>(
      `MESSAGE.${user.memberId}`,
    )

    asyncIterator.return = (value) => {
      unsubscribe()

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
