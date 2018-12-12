import { getAvatars, getUser } from '../api'
import { QueryToAvatarsResolver } from '../typings/generated-graphql-types'

const avatars: QueryToAvatarsResolver = async (
  _root,
  _args,
  { getToken, headers },
) => {
  const token = getToken()
  await getUser(token, headers)

  return getAvatars(token, headers)
}

export { avatars }
