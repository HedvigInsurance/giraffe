import { withFilter } from 'apollo-server-koa'
import { createProduct } from '../../api'
import * as config from '../../config'
import { pubsub } from '../../pubsub'
import {
  MutationToCreateOfferResolver,
  OfferSuccessEventToInsuranceResolver,
  SubscriptionToOfferResolver,
} from '../../typings/generated-graphql-types'
import { resolveInsurance } from '../insurance'

const createOffer: MutationToCreateOfferResolver = async (
  _parent,
  { details },
  { getToken },
) => {
  const token = getToken()
  const res = await createProduct(config.BASE_URL)(token, {
    firstName: details.firstName,
    lastName: details.lastName,
    age: details.age,
    address: {
      street: details.address,
      city: details.city,
      zipCode: details.postalNumber,
    },
    productType: details.insuranceType,
    currentInsurer: details.previousInsurer,
    houseHoldSize: details.personsInHousehold,
    livingSpace: details.squareMeters,
  })

  return res.id
}

const getInsuranceByOfferSuccessEvent: OfferSuccessEventToInsuranceResolver = async (
  _parent,
  _args,
  { getToken },
) => {
  const token = getToken()
  return resolveInsurance(token)
}

const offer: SubscriptionToOfferResolver = {
  subscribe: withFilter(
    () => pubsub.asyncIterator('OFFER_CREATED'),
    (payload, variables) => {
      return payload.offerCreated.id === variables.id
    },
  ),
}

export { createOffer, offer, getInsuranceByOfferSuccessEvent }
