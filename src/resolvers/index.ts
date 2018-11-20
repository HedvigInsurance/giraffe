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
import { cashbackOptions } from './cashbackOptions'
import { sendChatFileResponse } from './chatResponse'
import { directDebitStatus } from './directDebitStatus'
import { file } from './file'
import { gifs } from './gifs'
import { insurance } from './insurance'
import { logout } from './logout'
import { member } from './member'
import { offerClosed } from './offerClosed'
import { selectCashbackOption } from './selectCashbackOption'
import { startDirectDebitRegistration } from './trustly'
import { uploadFile } from './uploadFile'

const resolvers: Resolver = {
  Query: {
    insurance,
    member,
    cashback,
    signStatus: getSignStatus,
    gifs,
    file,
    directDebitStatus,
    cashbackOptions,
  },
  Mutation: {
    logout,
    createSession,
    createSessionV2,
    createOffer,
    signOffer,
    uploadFile,
    selectCashbackOption,
    offerClosed,
    startDirectDebitRegistration,
    sendChatFileResponse,
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
