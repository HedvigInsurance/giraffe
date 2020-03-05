import { Feature } from './../typings/generated-graphql-types';
import { getUser, postEmail, postPhoneNumber, postLanguage, postMarket } from '../api'
import {
  MutationToUpdateEmailResolver,
  MutationToUpdatePhoneNumberResolver,
  MutationToUpdateLanguageResolver,
  MutationToUpdateMarketResolver,
  QueryToMemberResolver,
  MemberToFeaturesResolver
} from '../typings/generated-graphql-types'
import { graphql } from "graphql"

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
    features: []
  }
}

export const memberFeatures: MemberToFeaturesResolver = async (
  _parent,
  _args,
  { getToken, headers, graphCMSSchema },
) => {
  const token = getToken()
  const user = await getUser(token, headers)

  const result = await graphql(graphCMSSchema, `
    query Features($memberId: String!) {
      userFeatures(where: { memberId: $memberId }) {
        feature
      }
    }
  `, null, null, {
    memberId: user.memberId
  })

  if (!result.data) {
    throw new Error("failed to fetch member features")
  }

  return result.data.userFeatures
    .filter((feature: { feature: string }) => feature.feature === "KeyGear")
    .map((_: { feature: string }) => Feature.KeyGear)
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

const updateLanguage: MutationToUpdateLanguageResolver = async (
  _root,
  { input },
  { getToken, headers },
) => {
  const token = getToken()
  await postLanguage(token, headers, {
    acceptLanguage: input,
  })
  return true
}

const updateMarket: MutationToUpdateMarketResolver = async (
  _root,
  { input },
  { getToken, headers, ...rest},
  info,
) => {
  const token = getToken()
  await postMarket(token, headers, {
    market: input,
  })
  return member(_root, {}, { getToken, headers, ...rest }, info)
}

export { member, updateEmail, updatePhoneNumber, updateLanguage, updateMarket }
