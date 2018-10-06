import { withFilter } from 'apollo-server-koa'
import { createProduct } from '../../api'
import * as config from '../../config'
import { pubsub } from '../../pubsub'
import {
  MutationToCreateOfferResolver,
  OfferEvent,
  OfferEventToInsuranceResolver,
  SubscriptionToOfferArgs,
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

const getInsuranceByOfferSuccessEvent: OfferEventToInsuranceResolver = async (
  _parent,
  _args,
  { getToken },
) => {
  const token = getToken()
  return resolveInsurance(token)
}

const offer: SubscriptionToOfferResolver = {
  subscribe: withFilter(
    () => pubsub.asyncIterator<OfferEvent>('OFFER_CREATED'),
    (
      payload: { offerCreated: OfferEvent },
      variables: SubscriptionToOfferArgs,
    ) => {
      return payload.offerCreated.insuranceId === variables.insuranceId
    },
  ),
}

export { createOffer, offer, getInsuranceByOfferSuccessEvent }
