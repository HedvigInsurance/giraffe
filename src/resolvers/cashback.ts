import { getCashbackOptions, getUser } from '../api'
import { ForwardHeaders } from '../context'
import {
  Cashback,
  QueryToCashbackResolver,
} from '../typings/generated-graphql-types'

const cashbackInner = async (
  token: string,
  headers: ForwardHeaders,
): Promise<Cashback | null> => {
  const user = await getUser(token, headers)
  const options = await getCashbackOptions(token, headers)

  const cashback = options.find((c) => c.name === user.selectedCashback)

  if (!cashback) {
    return null
  }

  return cashback
}

const resolveCashback: QueryToCashbackResolver = async (
  _root,
  _args,
  { getToken, headers },
) => {
  const token = getToken()

  return cashbackInner(token, headers)
}

export { resolveCashback as cashback, cashbackInner }
