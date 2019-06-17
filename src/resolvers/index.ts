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
import { avatars } from './avatars'
import { cashback } from './cashback'
import { cashbackOptions } from './cashbackOptions'
import { chatActions } from './chatActions'
import {
  sendChatAudioResponse,
  sendChatFileResponse,
  sendChatSingleSelectResponse,
  sendChatTextResponse,
} from './chatResponse'
import { chatState, subscribeToChatState } from './chatState'
import {
  triggerCallMeChat,
  triggerClaimChat,
  triggerFreeTextChat,
} from './chatTriggers'
import { createSession, createSessionV2 } from './createSession'
import {
  currentChatResponse,
  subscribeToCurrentChatResponse,
} from './currentChatResponse'
import { emailSign } from './emailSign'
import { file } from './file'
import { gifs } from './gifs'
import { insurance } from './insurance'
import { log } from './logging'
import { logout } from './logout'
import { member, updateEmail, updatePhoneNumber } from './member'
import {
  __resolveMessageBodyChoicesType,
  __resolveType as __resolveMessageBodyType,
  editLastResponse,
  markMessageAsRead,
  messages,
  resetConversation,
  subscribeToMessage,
} from './messages'
import { offerClosed } from './offerClosed'
import { registerPushToken } from './push-token'
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
    cashbackOptions,
    messages,
    chatState,
    currentChatResponse,
    avatars,
    chatActions,
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
    sendChatSingleSelectResponse,
    sendChatFileResponse,
    sendChatAudioResponse,
    resetConversation,
    editLastResponse,
    updateEmail,
    updatePhoneNumber,
    registerPushToken,
    triggerClaimChat,
    triggerFreeTextChat,
    triggerCallMeChat,
    emailSign,
    markMessageAsRead,
    log,
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
