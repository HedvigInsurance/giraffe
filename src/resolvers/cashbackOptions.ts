import { getCashbackOptions } from '../api'
import { QueryToCashbackOptionsResolver } from './../typings/generated-graphql-types'

export const cashbackOptions: QueryToCashbackOptionsResolver = async (
  _root,
  _args,
  { getToken, headers },
) => {
  const token = getToken()
  return getCashbackOptions(token, headers)
}
