import * as fetch from 'node-fetch'
import { getAvatars, getUser } from '../api'
import { QueryToAvatarsResolver } from '../typings/generated-graphql-types'

const avatars: QueryToAvatarsResolver = async (
  _root,
  _args,
  { getToken, headers },
) => {
  const token = getToken()
  await getUser(token, headers)

  const avatarsResponse = await getAvatars(token, headers)

  const res = await Promise.all(
    avatarsResponse.map(async (avatar) => ({
      ...avatar,
      data: await fetch(avatar.URL).then((response) => response.json()),
    })),
  )

  return res
}

export { avatars }
