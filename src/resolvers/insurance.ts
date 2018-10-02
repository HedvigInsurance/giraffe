import { AuthenticationError } from 'apollo-server-koa'
import { getInsurance, getUser } from '../api'
import * as config from '../config'
import {
  Insurance,
  Query,
  QueryToInsuranceResolver,
} from '../typings/generated-graphql-types'

const insurance: QueryToInsuranceResolver<Query, Insurance> = async (
  _root,
  _args,
  { token },
) => {
  if (!token) {
    throw new AuthenticationError('Must be logged in')
  }
  const [insuranceObject, user] = await Promise.all([
    getInsurance(config.BASE_URL)(token),
    getUser(config.BASE_URL)(token),
  ])
  return {
    monthlyCost: insuranceObject.currentTotalPrice,
    address: insuranceObject.addressStreet,
    certificateUrl: insuranceObject.certificateUrl,
    status: insuranceObject.status,
    type: insuranceObject.insuranceType,
    activeFrom: insuranceObject.activeFrom,
    perilCategories: insuranceObject.categories,
    safetyIncreasers: user.safetyIncreasers,
  }
}

export { insurance }
