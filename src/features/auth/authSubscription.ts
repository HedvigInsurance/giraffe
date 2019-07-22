import { getUser } from '../../api'
import { pubsub } from '../../pubsub'
import {
  AuthEvent,
  SubscriptionToAuthStatusResolver,
} from '../../typings/generated-graphql-types'

const subscribeToAuthStatus: SubscriptionToAuthStatusResolver = {
  subscribe: async (_parent, _args, { getToken, headers }) => {
    const token = getToken()
    const user = await getUser(token, headers)

    return pubsub.asyncIterator<AuthEvent>(`AUTH_EVENTS.${user.memberId}`)
  },
  resolve: (payload, _args, _context, _info) => {
    return (payload as unknown) as AuthEvent
  },
}

export { subscribeToAuthStatus }
