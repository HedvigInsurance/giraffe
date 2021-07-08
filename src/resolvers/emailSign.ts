import { performEmailSign } from '../api'
import { MutationResolvers } from '../generated/graphql'

export const emailSign: MutationResolvers['emailSign'] = async (
  _root,
  {},
  { getToken, headers },
) => {
  const token = getToken()
  const test = await performEmailSign(token, headers)
  console.log(test)
  return true
}
