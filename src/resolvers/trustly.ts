import { getUser, registerDirectDebit } from '../api'
import { MutationToStartTrustlyResolver } from '../typings/generated-graphql-types'

const startTrustly: MutationToStartTrustlyResolver = async (
  _parent,
  _args,
  { getToken, headers },
) => {
  const token = getToken()
  const user = await getUser(token, headers)
  const directDebitResponse = await registerDirectDebit(token, headers, {
    firstName: user.firstName,
    lastName: user.lastName,
    personalNumber: user.ssn,
  })
  return `${
    directDebitResponse.url
  }&gui=native&color=%23651EFF&bordercolor=%230F007A`
}

export { startTrustly }
