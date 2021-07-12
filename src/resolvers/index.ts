import {
  bankIdAuth,
  danishBankIdAuth,
  norwegianBankIdAuth,
  subscribeToAuthStatus,
  swedishBankIdAuth
} from '../features/auth'
import {createOffer, getInsuranceByOfferSuccessEvent, signOffer, subscribeToOffer,} from '../features/offer'
import {getSignStatus, getSignStatusFromSignEvent, signOfferV2, subscribeToSignStatus,} from '../features/offer/sign'
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
  __resolveMessageBodyType,
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
  Resolvers,
} from '../generated/graphql'
import {claims} from "./claims";

export const resolvers: Resolvers = {
  Query: {
    angelStory,
    availableLocales,
    avatars,
    activeContractBundles,
    cashback,
    cashbackOptions,
    chatActions,
    contracts,
    hasContract,
    claims,
    geo,
    gifs,
    file,
    currentChatResponse,
    member,
    messages,
    chatState,
    insurance,
    signStatus: getSignStatus,
  },
  Mutation: {
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
    resetConversation,
    editLastResponse,
    markMessageAsRead,
    signOffer,
    signOfferV2,
    createOffer,
    bankIdAuth,
    swedishBankIdAuth,
    norwegianBankIdAuth,
    danishBankIdAuth,
  },
  Subscription: {
    chatState: subscribeToChatState,
    currentChatResponse: subscribeToCurrentChatResponse,
    signStatus: subscribeToSignStatus,
    offer: subscribeToOffer,
    message: subscribeToMessage,
    authStatus: subscribeToAuthStatus,
  },
  OfferEvent: {
    insurance: getInsuranceByOfferSuccessEvent
  },
  SignEvent: {
    status: getSignStatusFromSignEvent
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
