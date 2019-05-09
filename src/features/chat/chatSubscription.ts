import { equals } from 'ramda'
import { ChatDto, getChat } from '../../api'
import { ForwardHeaders } from '../../context'
import { factory } from '../../utils/log'

const logger = factory.getLogger('subscriptionLogger')

interface SubscribeInterface {
  token: string
  headers: ForwardHeaders
  memberId: string
  mostRecentTimestamp: string
}

export const subscribeToChat = (
  { token, headers, memberId, mostRecentTimestamp }: SubscribeInterface,
  callback: (chat: ChatDto, previousChat: ChatDto) => void,
) => {
  let isSubscribing = true

  getChat(token, headers).then((chat) => {
    let previousChat = chat

    previousChat.messages = previousChat.messages.filter(
      (message: any) =>
        Number(message.header.timeStamp) >= Number(mostRecentTimestamp),
    )

    const intervalId = setInterval(async () => {
      if (!isSubscribing) {
        logger.info(`Removed interval for ${memberId}`)
        clearInterval(intervalId)
        return
      }

      logger.info(`Will interval update chat for ${memberId}`)
      const newChat = await getChat(token, headers)
      logger.info(`Did interval update chat for ${memberId}`)

      if (
        !equals(
          previousChat.messages.map((m) => m.globalId),
          newChat.messages.map((m) => m.globalId),
        ) ||
        !equals(previousChat.state, newChat.state)
      ) {
        logger.info(`Sending chat updates to ${memberId}`)
        callback(newChat, previousChat)
      }

      previousChat = newChat
    }, 500)
  })

  return () => {
    isSubscribing = false
  }
}
