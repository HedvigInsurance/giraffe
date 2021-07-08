import { setOfferClosed } from '../api'
import { MutationResolvers } from '../generated/graphql'

export const offerClosed: MutationResolvers['offerClosed'] = async (
  _root,
  _args,
  { getToken, headers },
) => {
  const token = getToken()

  await setOfferClosed(token, headers)
  return true
}
