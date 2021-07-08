import fetch from 'node-fetch'
import { getUser } from '../api'
import { GIPHY_API_KEY } from '../config'
import { QueryResolvers } from '../generated/graphql'

const gifs: QueryResolvers['gifs'] = async (
  _root,
  { query },
  { getToken, headers },
) => {
  const token = getToken()
  await getUser(token, headers)

  const giphyResponse = await fetch(
    `https://api.giphy.com/v1/gifs/search?q=${query}&api_key=${GIPHY_API_KEY}&limit=20`,
  ).then((response) => response.json())

  return giphyResponse.data.map((gif: any) => gif.images.downsized_large)
}

export { gifs }
