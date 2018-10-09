import { getUser } from '../api'
import * as config from '../config'
import { QueryToCashbackResolver } from '../typings/generated-graphql-types'

const cashback: QueryToCashbackResolver = async (
  _root,
  _args,
  { getToken, headers },
) => {
  const token = getToken()
  const user = await getUser(config.BASE_URL, headers)(token)
  return {
    name: user.selectedCashback,
    imageUrl: user.selectedCashbackImageUrl,
  }
}

export { cashback }
