import { bankIdAuth, swedishBankIdAuth, norwegianBankIdAuth, subscribeToAuthStatus } from '../features/auth'
import {
  createOffer,
  getInsuranceByOfferSuccessEvent,
  signOffer,
  subscribeToOffer,
} from '../features/offer'
import {
  getSignStatus,
  getSignStatusFromSignEvent,
  signOfferV2,
  subscribeToSignStatus,
} from '../features/offer/sign'
import { Resolver } from '../typings/generated-graphql-types'
import { registerBranchCampaign } from './analytics'
import { angelStory } from './angelStory'
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
import {
  member,
  memberFeatures,
  updateEmail,
  updateLanguage,
  updatePickedLocale,
  updatePhoneNumber,
} from './member'
import {
  __resolveMessageBodyChoicesCoreType,
  __resolveMessageBodyChoicesType,
  __resolveMessageBodyCoreType,
  __resolveType as __resolveMessageBodyType,
  editLastResponse,
  getFileByMessageBody,
  markMessageAsRead,
  messages,
  resetConversation,
  subscribeToMessage,
} from './messages'
import { offerClosed } from './offerClosed'
import { registerPushToken } from './push-token'
import { selectCashbackOption } from './selectCashbackOption'
import { geo } from './geo'
import { startDirectDebitRegistration } from './trustly'
import { uploadFile, uploadFiles } from './uploadFile'

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
    geo,
    angelStory,
  },
  Mutation: {
    logout,
    createSession,
    createSessionV2,
    createOffer,
    signOffer,
    signOfferV2,
    uploadFile,
    uploadFiles,
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
    bankIdAuth,
    swedishBankIdAuth,
    norwegianBankIdAuth,
    registerBranchCampaign,
    updateLanguage,
    updatePickedLocale,
  },
  Subscription: {
    offer: subscribeToOffer,
    signStatus: subscribeToSignStatus,
    message: subscribeToMessage,
    currentChatResponse: subscribeToCurrentChatResponse,
    chatState: subscribeToChatState,
    authStatus: subscribeToAuthStatus,
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
  MessageBodyCore: {
    __resolveType: __resolveMessageBodyCoreType,
  },
  MessageBodyChoices: {
    __resolveType: __resolveMessageBodyChoicesType,
  },
  MessageBodyChoicesCore: {
    __resolveType: __resolveMessageBodyChoicesCoreType,
  },
  MessageBodyFile: {
    file: getFileByMessageBody,
  },
  Member: {
    features: memberFeatures
  }
}

export { resolvers }
