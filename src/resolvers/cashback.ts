import { AuthenticationError } from 'apollo-server-koa'
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
  if (!token) {
    throw new AuthenticationError('Must be logged in')
  }
  const user = await getUser(config.BASE_URL)(token)
  return {
    name: user.selectedCashback,
    imageUrl: user.selectedCashbackImageUrl,
  }
}

export { cashback }
