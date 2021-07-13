import {
  bankIdAuth,
  danishBankIdAuth,
  norwegianBankIdAuth,
  authStatusSubscription,
  swedishBankIdAuth
} from '../features/auth'
import {createOffer, getInsuranceByOfferSuccessEvent, signOffer, offerSubscription,} from '../features/offer'
import {getSignStatus, getSignStatusFromSignEvent, signOfferV2, signStatusSubscription,} from '../features/offer/sign'
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
import {chatState, chatStateSubscription} from './chatState'
import {triggerCallMeChat, triggerClaimChat, triggerFreeTextChat,} from './chatTriggers'
import {createSession, createSessionV2} from './createSession'
import {currentChatResponse, currentChatResponseSubscription,} from './currentChatResponse'
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
  messageSubscription,
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
    chatState: chatStateSubscription,
    currentChatResponse: currentChatResponseSubscription,
    signStatus: signStatusSubscription,
    offer: offerSubscription,
    message: messageSubscription,
    authStatus: authStatusSubscription,
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
