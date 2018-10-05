import { withFilter } from 'apollo-server-koa'
import { IFieldResolver } from 'graphql-tools'
import { createProduct } from '../../api'
import * as config from '../../config'
import { Context } from '../../context'
import { pubsub } from '../../pubsub'
import { InsuranceType } from '../../typings/generated-graphql-types'
import { resolveInsurance } from '../insurance'

interface CreateOfferInput {
  firstName: string
  lastName: string
  age: number
  address: string
  postalNumber: string
  city: string
  insuranceType: InsuranceType
  squareMeters: number
  personsInHousehold: number
  previousInsurer: string
}

const createOffer: IFieldResolver<
  any,
  Context,
  { details: CreateOfferInput }
> = async (_parent, { details }, { getToken }) => {
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

const getInsuranceByOfferSuccessEvent: IFieldResolver<
  any,
  Context,
  void
> = async (_parent, _args, { getToken }) => {
  const token = getToken()
  return resolveInsurance(token)
}

const offer = {
  subscribe: withFilter(
    () => pubsub.asyncIterator('OFFER_CREATED'),
    (payload, variables) => {
      return payload.offerCreated.id === variables.id
    },
  ),
}

export { createOffer, offer, getInsuranceByOfferSuccessEvent }
