import { Logging } from '@google-cloud/logging'
import { parse } from 'date-fns'
import { getUser } from '../api'
import { MutationResolvers } from '../generated/graphql'


const logging = new Logging()

export const log: MutationResolvers['log'] = async (
  _root,
  { input },
  { getToken, headers },
) => {
  const token = getToken()
  const user = await getUser(token, headers)

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
