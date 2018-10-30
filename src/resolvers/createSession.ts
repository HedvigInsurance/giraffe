import * as uuid from 'uuid/v4'
import { assignTrackingId, register, registerCampaign } from '../api'
import { MutationToCreateSessionResolver } from '../typings/generated-graphql-types'

const createSession: MutationToCreateSessionResolver = async (
  _parent,
  { campaign },
  { headers },
) => {
  const token = await register(headers)
  let campaignPromise
  if (campaign) {
    campaignPromise = registerCampaign(token, headers, {
      utmSource: campaign.source,
      utmMedium: campaign.medium,
      utmContent: campaign.content ? [campaign.content] : undefined,
      utmCampaign: campaign.name,
      utmTerm: campaign.term ? [campaign.term] : undefined,
    })
  }
  const trackingId = uuid()
  await assignTrackingId(token, headers, { trackingId })
  if (campaignPromise) {
    await campaignPromise
  }
  return token
}

export { createSession }
