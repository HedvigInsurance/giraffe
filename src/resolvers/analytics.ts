import { MutationResolvers } from './../generated/graphql';
import { registerCampaign } from '../api'

const registerBranchCampaign: MutationResolvers['registerBranchCampaign'] = async (
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
