import {createProduct, getUser} from '../../api'
import {MutationResolvers, OfferEvent, SubscriptionResolvers} from '../../generated/graphql'

const createOffer: MutationResolvers['createOffer'] = async (
  _parent,
  {details},
  {getToken, headers},
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

const offerSubscription: SubscriptionResolvers['offer'] = {
  subscribe: async (_parent, _args, {getToken, headers, pubsub}): Promise<AsyncIterator<{ 'offer': OfferEvent }>> => {
    const token = getToken()
    const user = await getUser(token, headers)

    return pubsub.asyncIterator<{ 'offer': OfferEvent }>(`OFFER_CREATED.${user.memberId}`)
  },
}

export {createOffer, offerSubscription}
