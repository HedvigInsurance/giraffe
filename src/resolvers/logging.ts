import { Logging } from '@google-cloud/logging'
import { parse } from 'date-fns'
import { getUser } from '../api'
import { MutationToLogResolver } from './../typings/generated-graphql-types'

export const log: MutationToLogResolver = async (
  _root,
  { input },
  { getToken, headers },
) => {
  const token = getToken()
  const user = await getUser(token, headers)

  const logging = new Logging()
  const log = logging.log(input.source)

  const entry = log.entry(
    {
      timestamp: parse(input.timestamp),
      severity: input.severity,
      resource: {
        type: 'global',
      },
    },
    {
      ...JSON.parse(input.payload),
      memberId: user.memberId,
    },
  )

  await log.write([entry])

  return true
}
