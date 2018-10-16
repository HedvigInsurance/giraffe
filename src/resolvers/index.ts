import {
  createOffer,
  getInsuranceByOfferSuccessEvent,
  signOffer,
  subscribeToOffer,
} from '../features/offer'
import {
  getSignStatus,
  getSignStatusFromSignEvent,
  subscribeToSignStatus,
} from '../features/offer/sign'
import { Resolver } from '../typings/generated-graphql-types'
import { cashback } from './cashback'
import { createSession } from './createSession'
import { gifs } from './gifs'
import { insurance } from './insurance'
import { logout } from './logout'
import { member } from './member'

const resolvers: Resolver = {
  Query: {
    insurance,
    member,
    cashback,
    signStatus: getSignStatus,
    gifs,
  },
  Mutation: {
    logout,
    createSession,
    createOffer,
    signOffer,
  },
  Subscription: {
    offer: subscribeToOffer,
    signStatus: subscribeToSignStatus,
  },
  OfferEvent: {
    insurance: getInsuranceByOfferSuccessEvent,
  },
  SignEvent: {
    status: getSignStatusFromSignEvent,
  },
}

export { resolvers }
