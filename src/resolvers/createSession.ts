import { assignTrackingId, register, registerCampaign } from '../api'
import { MutationToCreateSessionResolver } from '../typings/generated-graphql-types'

const createSession: MutationToCreateSessionResolver = async (
  _parent,
  { campaign, trackingId },
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

  let trackingIdPromise
  if (trackingId) {
    trackingIdPromise = assignTrackingId(token, headers, { trackingId })
  }
  if (campaignPromise) {
    await campaignPromise
  }
  if (trackingIdPromise) {
    await trackingIdPromise
  }

  return token
}

export { createSession }
