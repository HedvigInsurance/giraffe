import {
  bankIdAuth,
  danishBankIdAuth,
  norwegianBankIdAuth,
  subscribeToAuthStatus,
  swedishBankIdAuth
} from '../features/auth'
import {createOffer, getInsuranceByOfferSuccessEvent, signOffer, subscribeToOffer,} from '../features/offer'
import {getSignStatus, getSignStatusFromSignEvent, signOfferV2, subscribeToSignStatus,} from '../features/offer/sign'
import {Resolver} from '../typings/generated-graphql-types'
import {registerBranchCampaign} from './analytics'
import {angelStory} from './angelStory'
import {avatars} from './avatars'
import {cashback} from './cashback'
import {cashbackOptions} from './cashbackOptions'
import {chatActions} from './chatActions'
import {
  sendChatAudioResponse,
  sendChatFileResponse,
  sendChatSingleSelectResponse,
  sendChatTextResponse,
} from './chatResponse'
import {chatState, subscribeToChatState} from './chatState'
import {triggerCallMeChat, triggerClaimChat, triggerFreeTextChat,} from './chatTriggers'
import {createSession, createSessionV2} from './createSession'
import {currentChatResponse, subscribeToCurrentChatResponse,} from './currentChatResponse'
import {emailSign} from './emailSign'
import {file} from './file'
import {gifs} from './gifs'
import {insurance} from './insurance'
import {log} from './logging'
import {logout} from './logout'
import {member, memberFeatures, updateEmail, updateLanguage, updatePhoneNumber, updatePickedLocale,} from './member'
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
import {offerClosed} from './offerClosed'
import {registerPushToken} from './push-token'
import {selectCashbackOption} from './selectCashbackOption'
import {geo} from './geo'
import {startDirectDebitRegistration} from './trustly'
import {uploadFile, uploadFiles} from './uploadFile'
import {activeContractBundles, contracts, hasContract} from './contracts'
import {createAddressChangeQuotes} from './addressChange'
import {availableLocales} from './availableLocales'
import {
  MutationResolvers,
  OfferEventResolvers,
  QueryResolvers,
  SignEventResolvers,
  SubscriptionResolvers
} from '../generated/graphql'

const newQueryResolvers: QueryResolvers = {
  angelStory,
  availableLocales,
  avatars,
  activeContractBundles,
  cashback,
  cashbackOptions,
  chatActions,
  contracts,
  hasContract,
  geo,
  gifs,
  file,
  currentChatResponse,
  member,
  chatState,
  insurance,
  signStatus: getSignStatus,
}

const newMutationResolvers: MutationResolvers = {
  uploadFile,
  uploadFiles,
  selectCashbackOption,
  offerClosed,
  startDirectDebitRegistration,
  logout,
  registerPushToken,
  log,
  createAddressChangeQuotes,
  emailSign,
  registerBranchCampaign,
  sendChatTextResponse,
  createSession,
  createSessionV2,
  sendChatSingleSelectResponse,
  sendChatFileResponse,
  sendChatAudioResponse,
  triggerClaimChat,
  triggerFreeTextChat,
  updateLanguage,
  updatePickedLocale,
  triggerCallMeChat,
  updateEmail,
  updatePhoneNumber,
  signOffer,
  signOfferV2,
  createOffer,
  bankIdAuth,
  swedishBankIdAuth,
  norwegianBankIdAuth,
  danishBankIdAuth,
}

const newSubscriptionResolvers: SubscriptionResolvers = {
  chatState: subscribeToChatState,
  currentChatResponse: subscribeToCurrentChatResponse,
  signStatus: subscribeToSignStatus,
  offer: subscribeToOffer,
}

const newSignEventResolvers: SignEventResolvers = {
  status: getSignStatusFromSignEvent
}

const newOfferEventResolvers: OfferEventResolvers = {
  insurance: getInsuranceByOfferSuccessEvent
}

const resolvers: Resolver = {
  Query: {
    ...(newQueryResolvers as Resolver['Query']),
    messages,
  },

  Mutation: {
    ...(newMutationResolvers as Resolver['Mutation']),
    resetConversation,
    editLastResponse,
    markMessageAsRead,
  },
  Subscription: {
    ...(newSubscriptionResolvers as Resolver['Subscription']),
    message: subscribeToMessage,
    authStatus: subscribeToAuthStatus,
  },
  OfferEvent: {
    ...(newOfferEventResolvers as Resolver['OfferEvent'])
  },
  SignEvent: {
    ...(newSignEventResolvers as Resolver['SignEvent'])
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
  } as Resolver['Member']
}

export {resolvers}
