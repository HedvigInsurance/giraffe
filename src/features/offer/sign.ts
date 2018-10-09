import { ApolloError } from 'apollo-server-koa'
import { websign } from '../../api'
import * as config from '../../config'
import { MutationToSignOfferResolver } from '../../typings/generated-graphql-types'

const signOffer: MutationToSignOfferResolver = async (
  _parent,
  { details },
  { getToken, headers },
) => {
  const token = getToken()
  const ipAddress = headers['X-Forwarded-For']
  if (!ipAddress) {
    throw new ApolloError('Not permitted to sign without IP :(')
  }
  await websign(config.BASE_URL, headers)(token, {
    ssn: details.personalNumber,
    email: details.email,
    ipAddress,
  })

  return true
}

export { signOffer }
