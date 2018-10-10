import { signStatus, websign } from '../../api'
import * as config from '../../config'
import {
  MutationToSignOfferResolver,
  QueryToSignStatusResolver,
} from '../../typings/generated-graphql-types'

const signOffer: MutationToSignOfferResolver = async (
  _parent,
  { details },
  { getToken, headers },
) => {
  const token = getToken()
  const ipAddress = headers['X-Forwarded-For']
  await websign(config.BASE_URL, headers)(token, {
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
  const status = await signStatus(config.BASE_URL, headers)(token)
  return {
    collectStatus: {
      status: status.collectData.status,
      code: status.collectData.hintCode,
    },
  }
}

export { signOffer, getSignStatus }
