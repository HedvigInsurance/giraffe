import { equals } from 'ramda'
import { ChatDto, getChat, getUser } from '../api'
import { pubsub } from '../pubsub'
import {
  Message,
  QueryToCurrentResponseResolver,
  SubscriptionToCurrentResponseResolver,
} from '../typings/generated-graphql-types'

import { subscribeToChat } from '../features/chat/chatSubscription'
import { transformMessage } from '../features/chat/transform'

export const currentResponse: QueryToCurrentResponseResolver = async (
  _root,
  _args,
  { getToken, headers },
) => {
  const token = getToken()
  const chat = await getChat(token, headers)
  return transformMessage(chat.messages[0])
}

export const subscribeToCurrentResponse: SubscriptionToCurrentResponseResolver = {
  subscribe: async (_parent, _args, { getToken, headers }) => {
    const token = getToken()
    const user = await getUser(token, headers)
    const iteratorId = `CURRENT_RESPONSE.${user.memberId}`

    const unsubscribe = subscribeToChat(
      {
        token,
        memberId: user.memberId,
        headers,
      },
      (chat: ChatDto, previousChat: ChatDto) => {
        if (!equals(chat.messages[0], previousChat.messages[0])) {
          pubsub.publish(iteratorId, {
            currentResponse: chat.messages[0],
          })
        }
      },
    )

    const asyncIterator = pubsub.asyncIterator<Message>(iteratorId)

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
