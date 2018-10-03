import { InsuranceType } from '../typings/generated-graphql-types'

interface CreateOfferInput {
  firstName: string
  lastName: string
  age: number
  address: string
  postalNumber: string
  insuranceType: InsuranceType
  sqm: number
  personsInHousehold: number
  previouslyInsured: boolean
}

const createOffer = async (
  _parent: any,
  { details }: { details: CreateOfferInput },
  { getToken }: { getToken: () => string },
) => {
  // @ts-ignore
  const token = getToken()
  console.log(details) // tslint:disable-line no-console
  return {}
}

export { createOffer }
