import { AuthEvent, SubscriptionResolvers } from './../../generated/graphql';
import { getUser } from '../../api'

const subscribeToAuthStatus: SubscriptionResolvers['authStatus'] = {
  subscribe: async (_parent, _args, { getToken, headers, pubsub }) => {
    const token = getToken()
    const user = await getUser(token, headers)

    return pubsub.asyncIterator<AuthEvent>(`AUTH_EVENTS.${user.memberId}`)
  },
  resolve: (payload: AuthEvent) => payload
}

export { subscribeToAuthStatus }
