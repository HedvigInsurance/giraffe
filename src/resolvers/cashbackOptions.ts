import { getCashbackOptions } from '../api'
import { QueryResolvers } from '../generated/graphql'

export const cashbackOptions: QueryResolvers['cashbackOptions'] = async (
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
