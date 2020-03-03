import { getUser, signStatus, websign, signDetails } from '../../api'
import { ForwardHeaders } from '../../context'
import { pubsub } from '../../pubsub'
import {
  MutationToSignOfferResolver,
  MutationToSignOfferV2Resolver,
  QueryToSignStatusResolver,
  SignEvent,
  SignEventToStatusResolver,
  SignStatus,
  SubscriptionToSignStatusResolver,
} from '../../typings/generated-graphql-types'

const signOffer: MutationToSignOfferResolver = async (
  _parent,
  { details },
  { getToken, headers, remoteIp },
) => {
  const token = getToken()
  if (!remoteIp) {
    throw new Error(`Must have an ip. X-Forwarded-For is: ${remoteIp}`)
  }
  await websign(token, headers, {
    ssn: details.personalNumber,
    email: details.email,
    ipAddress: remoteIp,
  })

  return true
}

const signOfferV2: MutationToSignOfferV2Resolver = async (
  _parent,
  { details },
  { getToken, headers, remoteIp },
) => {
  const token = getToken()
  if (!remoteIp) {
    throw new Error(`Must have an ip. X-Forwarded-For is: ${remoteIp}`)
  }

  if (!details) {
    const signDetailsResult = await signDetails(token)
    const websignResult = await websign(token, headers, {
      email: signDetailsResult.email,
      ssn: signDetailsResult.personalNumber,
      ipAddress: remoteIp,
    })

    return {
      autoStartToken: websignResult.bankIdOrderResponse ? (websignResult.bankIdOrderResponse.autoStartToken as string): undefined,
      redirectUrl: websignResult.redirectUrl
    }
  }

  const websignResult = await websign(token, headers, {
    ssn: details.personalNumber,
    email: details.email,
    ipAddress: remoteIp,
  })

  return {
    autoStartToken: websignResult.bankIdOrderResponse ? (websignResult.bankIdOrderResponse.autoStartToken as string): undefined,
    redirectUrl: websignResult.redirectUrl
  }
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
): Promise<SignStatus | null> => {
  const status = await signStatus(token, headers)

  if (!status) {
    return null
  }

  return {
    collectStatus: status.collectData && {
      status: status.collectData.status,
      code: status.collectData.hintCode,
    },
    signState: status.status,
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
  signOfferV2,
  getSignStatus,
  getSignStatusFromSignEvent,
  subscribeToSignStatus,
}
