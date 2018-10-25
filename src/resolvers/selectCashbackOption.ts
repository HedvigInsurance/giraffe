import { getUser, setSelectedCashbackOption } from '../api'
import { MutationToSelectCashbackOptionResolver } from '../typings/generated-graphql-types'

const selectCashbackOption: MutationToSelectCashbackOptionResolver = async (
  _root,
  { id },
  { getToken, headers },
) => {
  const token = getToken()
  const result = await setSelectedCashbackOption(token, headers, id)

  if (result === 204) {
    const user = await getUser(token, headers)

    return {
      id,
      name: user.selectedCashback,
      imageUrl: user.selectedCashbackImageUrl,
    }
  }

  throw new Error("couldn't select cashback option")
}

export { selectCashbackOption }
