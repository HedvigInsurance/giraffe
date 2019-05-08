import {
  ChatDto,
  editLastResponse as editLastMessage,
  getChat,
  getUser,
  resetConversation as resetMessages,
} from '../api'
import { pubsub } from '../pubsub'
import {
  Message,
  MessageBody,
  MessageBodyChoices,
  MessageBodyChoicesTypeResolver,
  MutationToEditLastResponseResolver,
  MutationToResetConversationResolver,
  QueryToMessagesResolver,
  SubscriptionToMessagesResolver,
} from '../typings/generated-graphql-types'
import { MessageBodyTypeResolver } from './../typings/generated-graphql-types'

import { subscribeToChat } from '../features/chat/chatSubscription'
import { transformMessages } from '../features/chat/transform'
import { factory } from '../utils/log'

const logger = factory.getLogger('messagesLogger')

export const messages: QueryToMessagesResolver = async (
  _root,
  _args,
  { getToken, headers },
) => {
  const token = getToken()
  const chat = await getChat(token, headers)
  return transformMessages(chat.messages)
}

export const resetConversation: MutationToResetConversationResolver = async (
  _root,
  _args,
  { getToken, headers },
) => {
  const token = getToken()
  await resetMessages(token, headers)
  return true
}

export const editLastResponse: MutationToEditLastResponseResolver = async (
  _root,
  _args,
  { getToken, headers },
) => {
  const token = getToken()
  await editLastMessage(token, headers)
  return true
}

export const subscribeToMessage: SubscriptionToMessagesResolver = {
  subscribe: async (
    _parent,
    { mostRecentTimestamp },
    { getToken, headers },
  ) => {
    const token = getToken()
    const user = await getUser(token, headers)

    const unsubscribe = subscribeToChat(
      {
        token,
        memberId: user.memberId,
        headers,
        mostRecentTimestamp,
      },
      (chat: ChatDto, previousChat: ChatDto) => {
        const transformedPreviousMessages = transformMessages(
          previousChat.messages,
        )

        const transformedNewMessages = transformMessages(chat.messages)

        const deletedMessages =
          transformedNewMessages.length < transformedPreviousMessages.length

        const messageDiff = deletedMessages
          ? transformedPreviousMessages
              .filter(
                (message) =>
                  !transformedNewMessages.find(
                    (newMessage) => newMessage!.globalId === message!.globalId,
                  ),
              )
              .reverse()
          : transformedNewMessages
              .filter(
                (message) =>
                  !transformedPreviousMessages.find(
                    (previousMessage) =>
                      previousMessage!.globalId === message!.globalId,
                  ),
              )
              .reverse()

        if (messageDiff.length !== 0) {
          if (!deletedMessages) {
            messageDiff.forEach((message) => {
              pubsub.publish(`MESSAGE.${user.memberId}`, {
                messages: [message],
              })
            })
          } else {
            pubsub.publish(`MESSAGE.${user.memberId}`, {
              messages: messageDiff,
            })
          }
        }
      },
    )

    const asyncIterator = pubsub.asyncIterator<Message[]>(
      `MESSAGE.${user.memberId}`,
    )

    asyncIterator.return = (value) => {
      unsubscribe()

      logger.info(`AsyncIterator returned for ${user.memberId}`)

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

  if (obj.type === 'multiple_select') {
    return 'MessageBodyMultipleSelect'
  }

  if (obj.type === 'paragraph') {
    return 'MessageBodyParagraph'
  }

  if (obj.type === 'text') {
    return 'MessageBodyText'
  }

  if (obj.type === 'number') {
    return 'MessageBodyNumber'
  }

  if (obj.type === 'audio') {
    return 'MessageBodyAudio'
  }

  if (obj.type === 'bankid_collcet') {
    return 'MessageBodyBankIdCollect'
  }

  if (obj.type === 'file_upload') {
    return 'MessageBodyFile'
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
