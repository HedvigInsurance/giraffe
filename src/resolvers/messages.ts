import { $$asyncIterator } from 'iterall'
import {
  editLastResponse as editLastMessage,
  getChat,
  getUser,
  resetConversation as resetMessages,
} from '../api'
import { pubsub } from '../pubsub'
import {
  MessageBody,
  MessageBodyChoices,
  MessageBodyChoicesTypeResolver,
  MutationToEditLastResponseResolver,
  MutationToResetConversationResolver,
  QueryToMessagesResolver,
  SubscriptionToMessageResolver,
} from '../typings/generated-graphql-types'
import { MessageDto } from './../api/index'
import { MessageBodyTypeResolver } from './../typings/generated-graphql-types'

import { transformMessage, transformMessages } from '../features/chat/transform'

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

export const withMessageTransform = (
  asyncIterator: AsyncIterator<MessageDto>,
): any => ({
  next() {
    return asyncIterator.next().then(({ value, done }) => {
      return {
        value: {
          message: transformMessage(value),
        },
        done,
      }
    })
  },
  return() {
    return Promise.resolve({ value: undefined, done: true })
  },
  throw(error: any) {
    return Promise.reject(error)
  },
  [$$asyncIterator as any]() {
    return this
  },
})

export const subscribeToMessage: SubscriptionToMessageResolver = {
  subscribe: async (_parent, {}, { getToken, headers }) => {
    const token = getToken()
    const user = await getUser(token, headers)
    return withMessageTransform(
      pubsub.asyncIterator<MessageDto>(`MESSAGE_SENT.${user.memberId}`),
    )
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
