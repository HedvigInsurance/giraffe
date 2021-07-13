import fetch from 'node-fetch'
import { getAvatars, getUser } from '../api'
import { QueryResolvers } from '../generated/graphql'

export const avatars: QueryResolvers['avatars'] = async (
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
