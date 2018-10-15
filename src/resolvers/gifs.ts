import fetch from 'node-fetch'
import { getUser } from '../api'
import { GIPHY_API_KEY } from '../config'
import { QueryToGifsResolver } from '../typings/generated-graphql-types'

const gifs: QueryToGifsResolver = async (
  _root,
  { query },
  { getToken, headers },
) => {
  const token = getToken()
  await getUser(token, headers)

  const giphyResponse = await fetch(
    `http://api.giphy.com/v1/gifs/search?q=${query}&api_key=${GIPHY_API_KEY}&limit=20`,
  ).then((response) => response.json())

  return giphyResponse.data.map((gif: any) => gif.images.downsized_large)
}

export { gifs }
