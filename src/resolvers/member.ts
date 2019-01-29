import { getUser, postEmail, postPhoneNumber } from '../api'
import { MutationToUpdateEmailResolver, MutationToUpdatePhoneNumberResolver, QueryToMemberResolver } from '../typings/generated-graphql-types'

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
    phoneNumber: memberResponse.phoneNumber,
  }
}

const updateEmail: MutationToUpdateEmailResolver = async (
  _root,
  {input},
  { getToken, headers },
) => {
  const token = getToken()
  await postEmail(token, headers, {
    newEmail: input
  })
  return true
}

const updatePhoneNumber: MutationToUpdatePhoneNumberResolver = async (
  _root,
  {input},
  { getToken, headers },
) => {
  const token = getToken()
  await postPhoneNumber(token, headers, {
    newPhoneNumber: input
  })
  return true
}

export { member, updateEmail, updatePhoneNumber }
