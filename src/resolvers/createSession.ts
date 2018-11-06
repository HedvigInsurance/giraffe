import { assignTrackingId, register, registerCampaign } from '../api'
import { MutationToCreateSessionResolver } from '../typings/generated-graphql-types'
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

export { createSession }
