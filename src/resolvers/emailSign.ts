import { performEmailSign } from '../api'
import { MutationToEmailSignResolver } from '../typings/generated-graphql-types'

export const emailSign: MutationToEmailSignResolver = async (
  _root,
  {},
  { getToken, headers },
) => {
  const token = getToken()
  const test = await performEmailSign(token, headers)
  console.log(test)
  return true
}
