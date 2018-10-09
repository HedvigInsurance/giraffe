import { ApolloError } from 'apollo-server-core'
import { OfferEventToInsuranceResolver } from '../../typings/generated-graphql-types'
import { loadInsurance } from '../insurance'

const getInsuranceByOfferSuccessEvent: OfferEventToInsuranceResolver = async (
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
