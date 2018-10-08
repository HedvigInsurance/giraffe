import { loadInsurance } from '../features/insurance'
import { QueryToInsuranceResolver } from '../typings/generated-graphql-types'

const insurance: QueryToInsuranceResolver = async (
  _root,
  _args,
  { getToken },
) => {
  const token = getToken()
  return loadInsurance(token)
}

export { insurance }
