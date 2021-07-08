import { loadInsurance } from '../features/insurance'
import { QueryResolvers } from '../generated/graphql'

const insurance: QueryResolvers['insurance'] = async (
  _root,
  _args,
  { getToken, headers },
) => {
  const token = getToken()
  return loadInsurance(token, headers)
}

export { insurance }
