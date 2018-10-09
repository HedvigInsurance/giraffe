import {
  createOffer,
  getInsuranceByOfferSuccessEvent,
  signOffer,
  subscribeToOffer,
} from '../features/offer'
import { Resolver } from '../typings/generated-graphql-types'
import { cashback } from './cashback'
import { createSession } from './createSession'
import { insurance } from './insurance'
import { logout } from './logout'

const resolvers: Resolver = {
  Query: {
    insurance,
    cashback,
  },
  Mutation: {
    logout,
    createSession,
    createOffer,
    signOffer,
  },
  Subscription: {
    offer: subscribeToOffer,
  },
  OfferEvent: {
    insurance: getInsuranceByOfferSuccessEvent,
  },
}

export { resolvers }
