import { getUser } from '../api'
import { QueryToMemberResolver } from '../typings/generated-graphql-types'

const member: QueryToMemberResolver = async (
  _parent,
  _args,
  { getToken, headers },
) => {
  const token = await getToken()
  const memberResponse = await getUser(token, headers)

  return {
    firstName: memberResponse.firstName,
    lastName: memberResponse.lastName,
    email: memberResponse.email,
  }
}

export { member }
