import { equals } from 'ramda'
import { ChatDto, getChat, getUser } from '../api'
import {
  ChatResponse,
  QueryResolvers,
  SubscriptionResolvers
} from '../generated/graphql'

import { subscribeToChat } from '../features/chat/chatSubscription'
import { transformMessage } from '../features/chat/transform'

export const currentChatResponse: QueryResolvers['currentChatResponse'] = async (
  _root,
  _args,
  { getToken, headers },
) => {
  const token = getToken()
  const chat = await getChat(token, headers)
  return transformMessage(chat.messages[0])
}

export const subscribeToCurrentChatResponse: SubscriptionResolvers['currentChatResponse'] = {
  subscribe: async (
    _parent,
    { mostRecentTimestamp },
    { getToken, headers, pubsub },
  ): Promise<AsyncIterator<{ 'currentChatResponse': ChatResponse }>> => {
    const token = getToken()
    const user = await getUser(token, headers)
    const iteratorId = `CURRENT_RESPONSE.${user.memberId}`

    const unsubscribe = subscribeToChat(
      {
        token,
        memberId: user.memberId,
        headers,
        mostRecentTimestamp,
      },
      (chat: ChatDto, previousChat: ChatDto) => {
        if (!equals(chat.messages[0], previousChat.messages[0])) {
          pubsub.publish(iteratorId, {
            currentChatResponse: transformMessage(chat.messages[0]),
          })
        }
      },
    )

    const asyncIterator = pubsub.asyncIterator<{ 'currentChatResponse': ChatResponse }>(iteratorId)

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
