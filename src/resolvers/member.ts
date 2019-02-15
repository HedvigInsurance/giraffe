import { getUser, postEmail, postPhoneNumber } from '../api'
import {
  MutationToUpdateEmailResolver,
  MutationToUpdatePhoneNumberResolver,
  QueryToMemberResolver,
} from '../typings/generated-graphql-types'

const member: QueryToMemberResolver = async (
  _parent,
  _args,
  { getToken, headers },
) => {
  const token = await getToken()
  const memberResponse = await getUser(token, headers)

  return {
    id: memberResponse.memberId,
    firstName: memberResponse.firstName,
    lastName: memberResponse.lastName,
    email: memberResponse.email,
    phoneNumber: memberResponse.phoneNumber,
  }
}

const updateEmail: MutationToUpdateEmailResolver = async (
  _root,
  { input },
  { getToken, headers, ...rest },
  info,
) => {
  const token = getToken()
  await postEmail(token, headers, {
    email: input,
  })
  return member(_root, {}, { getToken, headers, ...rest }, info)
}

const updatePhoneNumber: MutationToUpdatePhoneNumberResolver = async (
  _root,
  { input },
  { getToken, headers, ...rest },
  info,
) => {
  const token = getToken()
  await postPhoneNumber(token, headers, {
    phoneNumber: input,
  })
  return member(_root, {}, { getToken, headers, ...rest }, info)
}

export { member, updateEmail, updatePhoneNumber }
