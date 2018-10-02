import { cashback } from './cashback'
import { insurance } from './insurance'
import { logout } from './logout'

const resolvers = {
  Query: {
    insurance,
    cashback,
  },
  Mutation: {
    logout,
  },
}

export { resolvers }
