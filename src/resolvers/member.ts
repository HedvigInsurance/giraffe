import { getUser } from '../api'
import { QueryToMemberResolver } from '../typings/generated-graphql-types'

const member: QueryToMemberResolver = async (
  _parent,
  _args,
  { getToken, headers },
) => {
  const token = await getToken()
  const memberObj = await getUser(token, headers)

  return {
    firstName: memberObj.firstName,
    lastName: memberObj.lastName,
  }
}

export { member }
