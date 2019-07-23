import { registerCampaign } from '../api'
import { MutationToRegiserBranchCampaignResolver } from '../typings/generated-graphql-types'

const registerBranchCampaign: MutationToRegiserBranchCampaignResolver = async (
  _parent,
  { campaign },
  { getToken, headers },
) => {
  const token = getToken()

  if (campaign) {
    const response = await registerCampaign(token, headers, {
      utmSource: campaign.source,
      utmMedium: campaign.medium,
      utmContent: campaign.content ? [campaign.content] : undefined,
      utmCampaign: campaign.name,
      utmTerm: campaign.term ? [campaign.term] : undefined,
    })

    return response.ok
  }

  throw new Error("campaign was undefined")
}

export { registerBranchCampaign }
