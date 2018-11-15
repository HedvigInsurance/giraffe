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
import { sendChatTextResponse } from './chatResponse'
import { chatState, subscribeToChatState } from './chatState'
import { createSession, createSessionV2 } from './createSession'
import {
  currentChatResponse,
  subscribeToCurrentChatResponse,
} from './currentChatResponse'
import { directDebitStatus } from './directDebitStatus'
import { file } from './file'
import { gifs } from './gifs'
import { insurance } from './insurance'
import { logout } from './logout'
import { member } from './member'
import {
  __resolveMessageBodyChoicesType,
  __resolveType as __resolveMessageBodyType,
  messages,
  subscribeToMessage,
} from './messages'
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
    messages,
    chatState,
    currentChatResponse,
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
    sendChatTextResponse,
  },
  Subscription: {
    offer: subscribeToOffer,
    signStatus: subscribeToSignStatus,
    message: subscribeToMessage,
    currentChatResponse: subscribeToCurrentChatResponse,
    chatState: subscribeToChatState,
  },
  OfferEvent: {
    insurance: getInsuranceByOfferSuccessEvent,
  },
  SignEvent: {
    status: getSignStatusFromSignEvent,
  },
  MessageBody: {
    __resolveType: __resolveMessageBodyType,
  },
  MessageBodyChoices: {
    __resolveType: __resolveMessageBodyChoicesType,
  },
}

export { resolvers }
