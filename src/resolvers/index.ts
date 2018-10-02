import { cashback } from './cashback'
import { insurance } from './insurance'

const resolvers = {
  Query: {
    insurance,
    cashback,
  },
}

export { resolvers }
