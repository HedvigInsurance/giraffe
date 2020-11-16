import { setSelectedCashbackOption } from '../api'
import { MutationToSelectCashbackOptionResolver } from '../typings/generated-graphql-types'
import { cashbackInner } from './cashback'

const selectCashbackOption: MutationToSelectCashbackOptionResolver = async (
  _root,
  { id, locale },
  { getToken, headers },
) => {
  const token = getToken()

  const headersAndLocale = {
    ...headers,
    Locale: locale
  }

  const result = await setSelectedCashbackOption(token, headersAndLocale, id)

  if (result === 204 || result === 200) {
    const cashback = await cashbackInner(token, headers)
    if (cashback !== null) {
      return cashback
    }
  }

  throw new Error("couldn't select cashback option")
}

export { selectCashbackOption }
