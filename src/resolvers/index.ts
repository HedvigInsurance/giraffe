import { IResolvers } from 'graphql-tools'
import {
  createOffer,
  getInsuranceByOfferSuccessEvent,
  offer,
} from '../features/offer'
import { cashback } from './cashback'
import { createSession } from './createSession'
import { insurance } from './insurance'
import { logout } from './logout'

const resolvers: IResolvers = {
  Query: {
    insurance,
    cashback,
  },
  // @ts-ignore
  Mutation: {
    logout,
    createSession,
    createOffer,
  },
  Subscription: {
    offer,
  },
  // @ts-ignore
  OfferSuccessEvent: {
    insurance: getInsuranceByOfferSuccessEvent,
  },
}

export { resolvers }
