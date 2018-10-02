import { getUser } from '../api'
import * as config from '../config'
import {
  Cashback,
  Query,
  QueryToCashbackResolver,
} from '../typings/generated-graphql-types'

const cashback: QueryToCashbackResolver<Query, Cashback> = async (
  _root,
  _args,
  { token },
) => {
  const user = await getUser(config.BASE_URL)(token)
  return {
    name: user.selectedCashback,
    imageUrl: user.selectedCashbackImageUrl,
  }
}

export { cashback }
