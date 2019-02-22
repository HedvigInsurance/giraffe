import { getCashbackOptions, getUser } from '../api'
import { QueryToCashbackResolver } from '../typings/generated-graphql-types'

const cashback: QueryToCashbackResolver = async (
  _root,
  _args,
  { getToken, headers },
) => {
  const token = getToken()
  const user = await getUser(token, headers)
  const options = await getCashbackOptions(token, headers)

  const cashback = options.find(
    (cashback) => cashback.name === user.selectedCashback,
  )

  if (!cashback) {
    return null
  }

  return cashback
}

export { cashback }
