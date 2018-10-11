import { createProduct, getUser } from '../../api'
import { pubsub } from '../../pubsub'
import {
  MutationToCreateOfferResolver,
  OfferEvent,
  SubscriptionToOfferResolver,
} from '../../typings/generated-graphql-types'

const createOffer: MutationToCreateOfferResolver = async (
  _parent,
  { details },
  { getToken, headers },
) => {
  const token = getToken()
  await createProduct(token, headers, {
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

  return true
}

const subscribeToOffer: SubscriptionToOfferResolver = {
  subscribe: async (_parent, _args, { getToken, headers }) => {
    const token = getToken()
    const user = await getUser(token, headers)

    return pubsub.asyncIterator<OfferEvent>(`OFFER_CREATED.${user.memberId}`)
  },
}

export { createOffer, subscribeToOffer }
