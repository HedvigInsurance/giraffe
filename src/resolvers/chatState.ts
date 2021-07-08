import { equals } from 'ramda'
import { ChatDto, getChat, getUser } from '../api'
import { SubscriptionResolvers, ChatState, QueryResolvers } from '../generated/graphql'
import { subscribeToChat } from './../features/chat/chatSubscription'

export const chatState: QueryResolvers['chatState'] = async (
  _root,
  _args,
  { getToken, headers },
) => {
  const token = getToken()
  const chat = await getChat(token, headers)
  return chat.state
}

export const subscribeToChatState: SubscriptionResolvers['chatState'] = {
  subscribe: async (
    _parent,
    { mostRecentTimestamp },
    { getToken, headers, pubsub },
  ): Promise<AsyncIterator<{ 'chatState': ChatState }>> => {
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

    const asyncIterator = pubsub.asyncIterator<{ 'chatState': ChatState }>(iteratorId)

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
