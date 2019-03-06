import { activateInsuranceAtDate } from '../api'
import { loadInsurance } from '../features/insurance'
import {
  MutationToActivateOnResolver,
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

const activateOn: MutationToActivateOnResolver = async (
  _root,
  { date, insuranceId },
  { getToken, headers },
) => {
  const token = getToken()
  await activateInsuranceAtDate(token, headers, {
    date,
    insuranceId,
  })
  return true
}

export { insurance, activateOn }
