import { activateInsuranceAtDate } from '../api'
import { loadInsurance } from '../features/insurance'
import {
  MutationToActivateAtDateResolver,
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

const activateAtDate: MutationToActivateAtDateResolver = async (
  _root,
  { insuranceId, activationDate },
  { getToken, headers },
) => {
  const token = getToken()
  await activateInsuranceAtDate(token, headers, {
    insuranceId,
    activationDate,
  })
  return true
}

export { insurance, activateAtDate }
