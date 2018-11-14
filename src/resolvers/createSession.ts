import { assignTrackingId, getUser, register, registerCampaign } from '../api'
import {
  MutationToCreateSessionResolver,
  MutationToCreateSessionV2Resolver,
} from '../typings/generated-graphql-types'
import { awaitAll } from '../utils/async'

const createSession: MutationToCreateSessionResolver = async (
  _parent,
  { campaign, trackingId },
  { headers },
) => {
  const token = await register(headers)

  await awaitAll(
    campaign
      ? registerCampaign(token, headers, {
          utmSource: campaign.source,
          utmMedium: campaign.medium,
          utmContent: campaign.content ? [campaign.content] : undefined,
          utmCampaign: campaign.name,
          utmTerm: campaign.term ? [campaign.term] : undefined,
        })
      : undefined,
    trackingId ? assignTrackingId(token, headers, { trackingId }) : undefined,
  )

  return token
}

const createSessionV2: MutationToCreateSessionV2Resolver = async (
  _parent,
  _args,
  { headers },
) => {
  const token = await register(headers)
  const user = await getUser(token, headers)
  return {
    token,
    memberId: user.memberId,
  }
}

export { createSession, createSessionV2 }
