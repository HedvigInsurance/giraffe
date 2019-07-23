import { registerCampaign } from '../api'
import { MutationToRegisterBranchCampaignResolver } from '../typings/generated-graphql-types'

const registerBranchCampaign: MutationToRegisterBranchCampaignResolver = async (
  _parent,
  { campaign },
  { getToken, headers },
) => {
  const token = getToken()

  const response = await registerCampaign(token, headers, {
    utmSource: campaign.source,
    utmMedium: campaign.medium,
    utmContent: campaign.content ? [campaign.content] : undefined,
    utmCampaign: campaign.name,
    utmTerm: campaign.term ? [campaign.term] : undefined,
  })

  return response.ok
}

export { registerBranchCampaign }
