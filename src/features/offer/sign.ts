import { getUser, signStatus, websign } from '../../api'
import { ForwardHeaders } from '../../context'
import { pubsub } from '../../pubsub'
import {
  MutationToSignOfferResolver,
  QueryToSignStatusResolver,
  SignEvent,
  SignEventToStatusResolver,
  SignStatus,
  SubscriptionToSignStatusResolver,
} from '../../typings/generated-graphql-types'

const signOffer: MutationToSignOfferResolver = async (
  _parent,
  { details },
  { getToken, headers },
) => {
  const token = getToken()
  const ipAddress = headers['X-Forwarded-For']
  await websign(token, headers, {
    ssn: details.personalNumber,
    email: details.email,
    ipAddress,
  })

  return true
}

const getSignStatus: QueryToSignStatusResolver = async (
  _parent,
  _args,
  { getToken, headers },
) => {
  const token = getToken()
  return loadSignStatus(token, headers)
}

const getSignStatusFromSignEvent: SignEventToStatusResolver = async (
  _parent,
  _args,
  { getToken, headers },
) => {
  const token = getToken()
  return loadSignStatus(token, headers)
}

const loadSignStatus = async (
  token: string,
  headers: ForwardHeaders,
): Promise<SignStatus> => {
  const status = await signStatus(token, headers)
  return {
    collectStatus: {
      status: status.collectData.status,
      code: status.collectData.hintCode,
    },
  }
}

const subscribeToSignStatus: SubscriptionToSignStatusResolver = {
  subscribe: async (_parent, _args, { getToken, headers }) => {
    const token = getToken()
    const user = await getUser(token, headers)

    return pubsub.asyncIterator<SignEvent>(`SIGN_EVENTS.${user.memberId}`)
  },
}

export {
  signOffer,
  getSignStatus,
  getSignStatusFromSignEvent,
  subscribeToSignStatus,
}
