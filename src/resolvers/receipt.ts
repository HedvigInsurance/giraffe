// import { getUser } from '../api'
import { esClient } from '../api/elasticsearch'
import { MutationToScanReceiptResolver } from '../typings/generated-graphql-types'

export const scanReceipt: MutationToScanReceiptResolver = async (
  _root,
  { key },
  {},
) => {
  // const token = getToken()
  // const user = await getUser(token, headers)

  // console.log(esClient)

  console.log(`Key: ${key}`)

  esClient.cat.indices({ format: 'json' }, (err, res) => {
    console.log(res)
    if (err) {
      console.error(err)
    }
  })

  return {
    text: 'Hej',
  }
}
