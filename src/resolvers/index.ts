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
import { insurance } from './insurance'
import { logout } from './logout'
import { uploadFile } from './uploadFile'

const resolvers: Resolver = {
  Query: {
    insurance,
    cashback,
    signStatus: getSignStatus,
  },
  Mutation: {
    logout,
    createSession,
    createOffer,
    signOffer,
    uploadFile,
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
