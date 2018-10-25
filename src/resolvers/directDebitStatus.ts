import { getDirectDebitStatus } from '../api'
import {
  DirectDebitStatus,
  QueryToDirectDebitStatusResolver,
} from '../typings/generated-graphql-types'

const directDebitStatus: QueryToDirectDebitStatusResolver = async (
  _parent,
  _args,
  { getToken, headers },
) => {
  const token = getToken()
  const statusCode = await getDirectDebitStatus(token, headers)
  return statusCode !== 200
    ? DirectDebitStatus.NEEDS_SETUP
    : DirectDebitStatus.ACTIVE
}

export { directDebitStatus }
