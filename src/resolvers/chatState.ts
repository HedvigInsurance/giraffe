import { equals } from 'ramda'
import { ChatDto, getChat, getUser } from '../api'
import {
  ChatState,
  QueryToChatStateResolver,
} from '../typings/generated-graphql-types'
import { subscribeToChat } from './../features/chat/chatSubscription'
import { SubscriptionToChatStateResolver } from './../typings/generated-graphql-types'

export const chatState: QueryToChatStateResolver = async (
  _root,
  _args,
  { getToken, headers },
) => {
  const token = getToken()
  const chat = await getChat(token, headers)
  return chat.state
}

export const subscribeToChatState: SubscriptionToChatStateResolver = {
  subscribe: async (
    _parent,
    { mostRecentTimestamp },
    { getToken, headers, pubsub },
  ) => {
    const token = getToken()
    const user = await getUser(token, headers)
    const iteratorId = `CHAT_STATE.${user.memberId}`

    const unsubscribe = subscribeToChat(
      {
        token,
        memberId: user.memberId,
        headers,
        mostRecentTimestamp,
      },
      (chat: ChatDto, previousChat: ChatDto) => {
        if (!equals(chat.state, previousChat.state)) {
          pubsub.publish(iteratorId, {
            chatState: chat.state,
          })
        }
      },
    )

    const asyncIterator = pubsub.asyncIterator<ChatState>(iteratorId)

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
