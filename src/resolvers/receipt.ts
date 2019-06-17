import { MutationToScanReceiptResolver } from '../typings/generated-graphql-types'

import { getUser } from '../api'

export const scanReceipt: MutationToScanReceiptResolver = async (
  _root,
  { key },
  { getToken, headers },
) => {
  const token = getToken()
  const user = await getUser(token, headers)

  return true
}
