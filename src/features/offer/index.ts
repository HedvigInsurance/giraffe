import { createProduct } from '../../api'
import * as config from '../../config'
import { pubsub } from '../../pubsub'
import {
  MutationToCreateOfferResolver,
  OfferEvent,
  OfferEventToInsuranceResolver,
  SubscriptionToOfferResolver,
} from '../../typings/generated-graphql-types'
import { loadInsurance } from '../insurance'

const createOffer: MutationToCreateOfferResolver = async (
  _parent,
  { details },
  { getToken, headers },
) => {
  const token = getToken()
  const res = await createProduct(config.BASE_URL, headers)(token, {
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
  { getToken, headers },
) => {
  const token = getToken()
  return loadInsurance(token, headers)
}

const offer: SubscriptionToOfferResolver = {
  subscribe: (_parent, _args, { getToken }) => {
    const token = getToken()
    return pubsub.asyncIterator<OfferEvent>(`OFFER_CREATED.${token}`)
  },
}

export { createOffer, offer, getInsuranceByOfferSuccessEvent }
