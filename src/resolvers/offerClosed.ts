import { setOfferClosed } from '../api'
import { MutationToOfferClosedResolver } from '../typings/generated-graphql-types'

export const offerClosed: MutationToOfferClosedResolver = async (
  _root,
  _args,
  { getToken, headers },
) => {
  const token = getToken()

  await setOfferClosed(token, headers)
  return true
}
