import { getUser, registerDirectDebit } from '../api'
import { MutationToStartDirectDebitRegistrationResolver } from '../typings/generated-graphql-types'

const startDirectDebitRegistration: MutationToStartDirectDebitRegistrationResolver = async (
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
  return directDebitResponse.url
}

export { startDirectDebitRegistration }
