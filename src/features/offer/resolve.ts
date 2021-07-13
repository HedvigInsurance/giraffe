import { ApolloError } from 'apollo-server-core'
import { OfferEventResolvers } from '../../generated/graphql'
import { loadInsurance } from '../insurance'

const getInsuranceByOfferSuccessEvent: OfferEventResolvers['insurance'] = async (
  parent,
  _args,
  { getToken, headers },
) => {
  if (parent.status === 'FAIL') {
    throw new ApolloError('Failed to create offer')
  }
  const token = getToken()
  return loadInsurance(token, headers)
}

export { getInsuranceByOfferSuccessEvent }
