import { getCashbackOptions } from '../api'
import { QueryToCashbackOptionsResolver } from './../typings/generated-graphql-types'

export const cashbackOptions: QueryToCashbackOptionsResolver = async (
  _root,
  { locale },
  { getToken, headers },
) => {
  const token = getToken()

  const headersAndLocale = {
    ...headers,
    Locale: locale
  }

  return getCashbackOptions(token, headersAndLocale)
}
