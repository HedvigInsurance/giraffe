import { setSelectedCashbackOption } from '../api'
import { MutationResolvers } from '../generated/graphql'

import { cashbackInner } from './cashback'

const selectCashbackOption: MutationResolvers['selectCashbackOption'] = async (
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
