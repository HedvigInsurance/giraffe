import { getCashbackOptions } from '../api'
import { ForwardHeaders } from '../context'
import {
  Cashback,
  QueryToCashbackResolver,
} from '../typings/generated-graphql-types'

const cashbackInner = async (
  token: string,
  headers: ForwardHeaders,
): Promise<Cashback | null> => {
  const options = await getCashbackOptions(token, headers)

  const cashback = options.find((c) => c.selected)

  if (!cashback) {
    return null
  }

  return cashback
}

const resolveCashback: QueryToCashbackResolver = async (
  _root,
  { locale },
  { getToken, headers },
) => {
  const token = getToken()

  const headersAndLocale = {
    ...headers,
    Locale: locale
  }

  return cashbackInner(token, headersAndLocale)
}

export { resolveCashback as cashback, cashbackInner }
