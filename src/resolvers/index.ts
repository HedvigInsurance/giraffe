import { cashback } from './cashback'
import { createOffer } from './createOffer'
import { createSession } from './createSession'
import { insurance } from './insurance'
import { logout } from './logout'

const resolvers = {
  Query: {
    insurance,
    cashback,
  },
  Mutation: {
    logout,
    createSession,
    createOffer,
  },
}

export { resolvers }
