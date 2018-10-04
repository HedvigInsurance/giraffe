import { withFilter } from 'apollo-server-koa'
import { createProduct } from '../../api'
import * as config from '../../config'
import { pubsub } from '../../pubsub'
import { InsuranceType } from '../../typings/generated-graphql-types'

interface CreateOfferInput {
  firstName: string
  lastName: string
  age: number
  address: string
  postalNumber: string
  city: string
  insuranceType: InsuranceType
  sqm: number
  personsInHousehold: number
  previousInsurer: string
}

const createOffer = async (
  _parent: any,
  { details }: { details: CreateOfferInput },
  { getToken }: { getToken: () => string },
) => {
  const token = getToken()
  await createProduct(config.BASE_URL)(token, {
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
  })

  return true
}

const offerCreated = {
  subscribe: withFilter(
    () => pubsub.asyncIterator('offerCreated'),
    (payload, variables) => {
      return payload.id === variables.id
    },
  ),
}

setInterval(() => {
  console.log('publishing on pubsub') // tslint:disable-line no-console
  pubsub.publish('offerCreated', { address: 'woot', id: 'some-id' })
}, 1000)

export { createOffer, offerCreated }
