import { Feature } from '../generated/graphql'

import { getUser, postEmail, postPhoneNumber, postLanguage, postPickedLocale, isEligibleForReferrals } from '../api'

import {
  MutationResolvers,
  QueryResolvers,
  MemberResolvers
} from '../generated/graphql'
import { graphql } from "graphql"

const member: QueryResolvers['member'] = async (
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

export const memberFeatures: MemberResolvers['features'] = async (
  _parent,
  _args,
  { getToken, headers, graphCMSSchema },
) => {
  const token = getToken()
  const user = await getUser(token, headers)

  const result = graphCMSSchema && await graphql(graphCMSSchema, `
    query Features($memberId: String!) {
      userFeatures(where: { memberId: $memberId }) {
        feature
      }
    }
  `, null, null, {
    memberId: user.memberId
  }) || {}

  if (!result.data) {
    throw new Error("failed to fetch member features")
  }

  const features = result.data.userFeatures
      .filter((feature: { feature: string }) => feature.feature === "KeyGear")
      .map((_: { feature: string }) => Feature.KeyGear)

  const eligibleForReferrals = await isEligibleForReferrals(token, headers)

  if (eligibleForReferrals) {
    features.push(Feature.Referrals)
  }

  return features
}

const updateEmail: MutationResolvers['updateEmail'] = async (
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

const updatePhoneNumber: MutationResolvers['updatePhoneNumber'] = async (
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

const updateLanguage: MutationResolvers['updateLanguage'] = async (
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

const updatePickedLocale: MutationResolvers['updatePickedLocale'] = async (
  _root,
  { pickedLocale },
  { getToken, headers, ...rest},
  info,
) => {
  const token = getToken()
  await postPickedLocale(token, headers, {
    pickedLocale: pickedLocale,
  })
  return member(_root, {}, { getToken, headers, ...rest }, info)
}

export { member, updateEmail, updatePhoneNumber, updateLanguage, updatePickedLocale }
