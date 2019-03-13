import { requestInsuranceStartDate } from '../api'
import { loadInsurance } from '../features/insurance'
import {
  MutationToRequestStartDateResolver,
  QueryToInsuranceResolver,
} from '../typings/generated-graphql-types'

const insurance: QueryToInsuranceResolver = async (
  _root,
  _args,
  { getToken, headers },
) => {
  const token = getToken()
  return loadInsurance(token, headers)
}

const requestStartDate: MutationToRequestStartDateResolver = async (
  _root,
  { requestedStartDate },
  { getToken, headers },
) => {
  const token = getToken()
  await requestInsuranceStartDate(token, headers, {
    requestedStartDate,
  })
  return true
}

export { insurance, requestStartDate }
