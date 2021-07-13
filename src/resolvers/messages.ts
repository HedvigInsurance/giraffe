import {
  QueryResolvers,
  MutationResolvers,
  SubscriptionResolvers,
  Message,
  MessageBodyResolvers,
  MessageBodyChoicesResolvers,
  MessageBodyCoreResolvers,
  MessageBodyChoicesCoreResolvers,
  MessageBodyFileResolvers,
  MessageBody,
  MessageBodyChoices,
  MessageBodyCore,
  MessageBodyChoicesCore,
} from './../generated/graphql'
import { $$asyncIterator } from 'iterall'
import {
  editLastResponse as editLastMessage,
  getChat,
  getUser,
  markMessageAsRead as markMessageAsReadAPI,
  resetConversation as resetMessages,
} from '../api'
import { MessageDto } from './../api/index'

import { transformMessage, transformMessages } from '../features/chat/transform'
import { fileInner } from './file'

export const messages: QueryResolvers['messages'] = async (
  _root,
  _args,
  { getToken, headers },
) => {
  const token = getToken()
  const chat = await getChat(token, headers)
  return transformMessages(chat.messages)
}

export const resetConversation: MutationResolvers['resetConversation'] = async (
  _root,
  _args,
  { getToken, headers },
) => {
  const token = getToken()
  await resetMessages(token, headers)
  return true
}

export const markMessageAsRead: MutationResolvers['markMessageAsRead'] = async (
  _root,
  { globalId },
  { getToken, headers },
) => {
  const token = getToken()
  const message = await markMessageAsReadAPI(globalId, token, headers)
  return transformMessage(message)
}

export const editLastResponse: MutationResolvers['editLastResponse'] = async (
  _root,
  _args,
  { getToken, headers },
) => {
  const token = getToken()
  await editLastMessage(token, headers)
  return true
}

export const messageSubscription: SubscriptionResolvers['message'] = {
  subscribe: async (
    _parent,
    {},
    { getToken, headers, pubsub },
  ): Promise<AsyncIterator<{ 'message': Message }>> => {
    const token = getToken()
    const user = await getUser(token, headers)
    return withMessageTransform(
      pubsub.asyncIterator<MessageDto>(`MESSAGE_SENT.${user.memberId}`),
    )
  },
}

export const withMessageTransform = (
  asyncIterator: AsyncIterator<MessageDto>,
): AsyncIterator<{ 'message': Message }> => ({
  next() {
    return asyncIterator.next().then(({ value, done }) => {
      return {
        value: {
          'message': transformMessage(value),
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

export const __resolveMessageBodyType: MessageBodyResolvers['__resolveType'] = (obj: MessageBody) => {
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

export const __resolveMessageBodyChoicesType: MessageBodyChoicesResolvers['__resolveType'] = (
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

export const __resolveMessageBodyCoreType: MessageBodyCoreResolvers['__resolveType'] = (
  obj: MessageBodyCore,
) => {
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

export const __resolveMessageBodyChoicesCoreType: MessageBodyChoicesCoreResolvers['__resolveType'] = (
  obj: MessageBodyChoicesCore,
) => {
  if (obj.type === 'selection') {
    return 'MessageBodyChoicesSelection'
  }

  if (obj.type === 'link') {
    return 'MessageBodyChoicesLink'
  }

  return 'MessageBodyChoicesUndefined'
}

export const getFileByMessageBody: MessageBodyFileResolvers['file'] = async (
  { key },
  _args,
  { getToken, headers },
) => {
  const token = getToken()
  const user = await getUser(token, headers)

  if (!key) {
    throw Error('Cannot query a file without a key')
  }

  return fileInner(key, user.memberId)
}
