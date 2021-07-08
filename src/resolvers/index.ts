import {MutationResolvers} from './../generated/graphql';
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
import {QueryResolvers} from '../generated/graphql'

const newQueryResolvers: QueryResolvers = {
  activeContractBundles,
  contracts,
  hasContract,

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
  createAddressChangeQuotes
}

const resolvers: Resolver = {
  Query: {
    ...(newQueryResolvers as Resolver['Query']),
    insurance,
    member,
    cashback,
    signStatus: getSignStatus,
    gifs,
    file,
    cashbackOptions,
    chatState,
    currentChatResponse,
    avatars,
    chatActions,
    geo,
    angelStory,
    messages,
    availableLocales
  },
  Mutation: {
    ...(newMutationResolvers as Resolver['Mutation']),
    resetConversation,
    editLastResponse,
    markMessageAsRead,
    createSession,
    createSessionV2,
    createOffer,
    signOffer,
    signOfferV2,
    sendChatTextResponse,
    sendChatSingleSelectResponse,
    sendChatFileResponse,
    sendChatAudioResponse,

    updateEmail,
    updatePhoneNumber,

    triggerClaimChat,
    triggerFreeTextChat,
    triggerCallMeChat,
    emailSign,

    bankIdAuth,
    swedishBankIdAuth,
    norwegianBankIdAuth,
    danishBankIdAuth,
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

export {resolvers}
