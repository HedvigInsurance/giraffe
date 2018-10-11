import { getUser } from '../api'
import { QueryToCashbackResolver } from '../typings/generated-graphql-types'

const cashback: QueryToCashbackResolver = async (
  _root,
  _args,
  { getToken, headers },
) => {
  const token = getToken()
  const user = await getUser(token, headers)
  return {
    name: user.selectedCashback,
    imageUrl: user.selectedCashbackImageUrl,
  }
}

export { cashback }
