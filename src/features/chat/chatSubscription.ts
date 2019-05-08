import { equals } from 'ramda'
import * as uuid from 'uuid/v1'
import { ChatDto, getChat } from '../../api'
import { ForwardHeaders } from '../../context'
import { factory } from '../../utils/log'

const logger = factory.getLogger('subscriptionLogger')

const listeners = new Map()
const intervals = new Map()

interface SubscribeInterface {
  token: string
  headers: ForwardHeaders
  memberId: string
  mostRecentTimestamp: string
}

const unsubscribe = (memberId: string, listenerId: string) => () => {
  listeners.get(memberId).delete(listenerId)

  logger.info(`Unsubscribe ${memberId}`)

  logger.info(
    `Number of subscribers for ${memberId} is ${listeners.get(memberId).size}`,
  )

  if (listeners.get(memberId).size === 0) {
    logger.info(`Actually did unsubscribe ${memberId}`)

    clearInterval(intervals.get(memberId))
    intervals.delete(memberId)
    listeners.delete(memberId)
  }
}

export const subscribeToChat = (
  { token, headers, memberId, mostRecentTimestamp }: SubscribeInterface,
  callback: (chat: ChatDto, previousChat: ChatDto) => void,
) => {
  const listenerId = uuid()

  if (listeners.get(memberId)) {
    listeners.get(memberId).set(listenerId, callback)
    return unsubscribe(memberId, listenerId)
  }

  listeners.set(memberId, new Map())
  listeners.get(memberId).set(listenerId, callback)

  getChat(token, headers).then((chat) => {
    let previousChat = chat

    previousChat.messages = previousChat.messages = previousChat.messages.filter(
      (message: any) =>
        Number(message.header.timeStamp) <= Number(mostRecentTimestamp),
    )

    const intervalId = setInterval(async () => {
      logger.info(`Will interval update chat for ${memberId}`)
      const newChat = await getChat(token, headers)
      logger.info(`Did interval update chat for ${memberId}`)

      if (!equals(previousChat, newChat)) {
        logger.info(`Sending chat updates to ${memberId}`)

        listeners
          .get(memberId)
          .forEach((listener: (chat: ChatDto, previousChat: ChatDto) => void) =>
            listener(newChat, previousChat),
          )
      }

      previousChat = newChat
    }, 500)

    if (intervals.get(memberId)) {
      logger.info(`ABORT already had a listener for ${memberId}`)
      clearInterval(intervalId)
      return
    }

    intervals.set(memberId, intervalId)
  })

  return unsubscribe(memberId, listenerId)
}
