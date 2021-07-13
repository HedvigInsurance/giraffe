import {getUser, signDetails, signStatus, websign} from '../../api'
import {ForwardHeaders} from '../../context'
import {
  MutationResolvers,
  QueryResolvers, SignEvent,
  SignEventResolvers,
  SignStatus,
  SubscriptionResolvers,
} from '../../generated/graphql'

const signOffer: MutationResolvers['signOffer'] = async (
  _parent,
  {details},
  {getToken, headers, remoteIp},
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

const signOfferV2: MutationResolvers['signOfferV2'] = async (
  _parent,
  {details},
  {getToken, headers, remoteIp},
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
      autoStartToken: websignResult.bankIdOrderResponse ? (websignResult.bankIdOrderResponse.autoStartToken as string) : undefined,
      redirectUrl: websignResult.redirectUrl
    }
  }

  const websignResult = await websign(token, headers, {
    ssn: details.personalNumber,
    email: details.email,
    ipAddress: remoteIp,
  })

  return {
    autoStartToken: websignResult.bankIdOrderResponse ? (websignResult.bankIdOrderResponse.autoStartToken as string) : undefined,
    redirectUrl: websignResult.redirectUrl
  }
}

const getSignStatus: QueryResolvers['signStatus'] = async (
  _parent,
  _args,
  {getToken, headers},
) => {
  const token = getToken()
  return loadSignStatus(token, headers)
}

const getSignStatusFromSignEvent: SignEventResolvers['status'] = async (
  _parent,
  _args,
  {getToken, headers},
) => {
  const token = getToken()
  return loadSignStatus(token, headers)
}

const loadSignStatus = async (
  token: string,
  headers: ForwardHeaders,
): Promise<SignStatus | undefined> => {
  const status = await signStatus(token, headers)

  if (!status) {
    return undefined
  }

  return {
    collectStatus: status.collectData && {
      status: status.collectData.status,
      code: status.collectData.hintCode,
    },
    signState: status.status,
  }
}

const signStatusSubscription: SubscriptionResolvers['signStatus'] = {
  subscribe: async (_parent, _args, {
    getToken,
    headers,
    pubsub
  }): Promise<AsyncIterator<{ 'signStatus': SignEvent }>> => {
    const token = getToken()
    const user = await getUser(token, headers)

    return pubsub.asyncIterator<{ 'signStatus': SignEvent }>(`SIGN_EVENTS.${user.memberId}`)
  },
}

export {
  signOffer,
  signOfferV2,
  getSignStatus,
  getSignStatusFromSignEvent,
  signStatusSubscription,
}
