import { IResolvers } from 'graphql-tools'
import { createOffer, offerCreated } from '../features/offer'
import { cashback } from './cashback'
import { createSession } from './createSession'
import { insurance } from './insurance'
import { logout } from './logout'

const resolvers: IResolvers = {
  Query: {
    insurance,
    cashback,
  },
  Mutation: {
    logout,
    createSession,
    createOffer,
  },
  Subscription: {
    offerCreated,
  },
}

export { resolvers }
