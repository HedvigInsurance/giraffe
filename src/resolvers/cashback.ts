import { getCashbackOptions } from '../api'
import { ForwardHeaders } from '../context'
import { Maybe, Cashback, QueryResolvers } from '../generated/graphql'

export const cashback: QueryResolvers['cashback'] = async (
  _root,
  { locale },
  { getToken, headers },
): Promise<Maybe<Cashback>>  => {
  const token = getToken()

  const headersAndLocale = {
    ...headers,
    Locale: locale
  }

  return cashbackInner(token, headersAndLocale)
}

export const cashbackInner = async (
  token: string,
  headers: ForwardHeaders,
): Promise<Maybe<Cashback>> => {
  const options = await getCashbackOptions(token, headers)

  const cashback = options.find((c) => c.selected)

  if (!cashback) {
    return undefined
  }

  return cashback
}
