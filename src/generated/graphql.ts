import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { Context } from '../context';
export type Maybe<T> = T | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  LocalDate: any;
  Object: any;
  URL: any;
  Instant: any;
  UUID: any;
  Upload: any;
  TimeStamp: any;
  JSONObject: any;
};

/** The contract has an inception date in the future and a termination date in the future */
export type ActiveInFutureAndTerminatedInFutureStatus = {
  __typename?: 'ActiveInFutureAndTerminatedInFutureStatus';
  futureInception?: Maybe<Scalars['LocalDate']>;
  futureTermination?: Maybe<Scalars['LocalDate']>;
};

/** The contract has an inception date set in the future */
export type ActiveInFutureStatus = {
  __typename?: 'ActiveInFutureStatus';
  futureInception?: Maybe<Scalars['LocalDate']>;
};

/** The contract has an inception date set today or in the past without a termination date set */
export type ActiveStatus = {
  __typename?: 'ActiveStatus';
  pastInception?: Maybe<Scalars['LocalDate']>;
  upcomingAgreementChange?: Maybe<UpcomingAgreementChange>;
};

export type Address = {
  __typename?: 'Address';
  street: Scalars['String'];
  postalCode: Scalars['String'];
  city?: Maybe<Scalars['String']>;
  apartment?: Maybe<Scalars['String']>;
  floor?: Maybe<Scalars['String']>;
};

/** A quote-agnostic payload type for changing the addess. */
export type AddressChangeInput = {
  /** The target bundle that should have its address changed. */
  contractBundleId: Scalars['ID'];
  /** Is this an apartment or a house. */
  type: AddressHomeType;
  /** Street value, including number. */
  street: Scalars['String'];
  /** Zip code. */
  zip: Scalars['String'];
  /** The total living space, in square meters. */
  livingSpace: Scalars['Int'];
  /** Number co-insured, the number of people on the contract except for the policy holder. */
  numberCoInsured: Scalars['Int'];
  /** Is this a rental or do does the policy holder own it? */
  ownership: AddressOwnership;
  /** The date the member gets access to this new home. */
  startDate: Scalars['LocalDate'];
  /** Set to true if the insurance is concerning a youth. Concept used in Norway */
  isYouth?: Maybe<Scalars['Boolean']>;
  /** Set to true if the insurance is concerning a student. Concept used in Sweden, Denmark */
  isStudent?: Maybe<Scalars['Boolean']>;
  /** Ancillary area. Required if type == HOUSE. */
  ancillaryArea?: Maybe<Scalars['Int']>;
  /** Year of construction. Required if type == HOUSE. */
  yearOfConstruction?: Maybe<Scalars['Int']>;
  /** Number of bathrooms. Required if type == HOUSE. */
  numberOfBathrooms?: Maybe<Scalars['Int']>;
  /** Is this property subleted? Required if type == HOUSE. */
  isSubleted?: Maybe<Scalars['Boolean']>;
  /** A list of extra buildings outside of the main property. Required if type == HOUSE. */
  extraBuildings?: Maybe<Array<AddressHouseExtraBuilding>>;
};

export type AddressChangeQuoteFailure = {
  __typename?: 'AddressChangeQuoteFailure';
  breachedUnderwritingGuidelines: Array<Scalars['String']>;
};

export type AddressChangeQuoteResult = AddressChangeQuoteSuccess | AddressChangeQuoteFailure;

export type AddressChangeQuoteSuccess = {
  __typename?: 'AddressChangeQuoteSuccess';
  quoteIds: Array<Scalars['ID']>;
};

export enum AddressHomeType {
  Apartment = 'APARTMENT',
  House = 'HOUSE'
}

export type AddressHouseExtraBuilding = {
  type: Scalars['String'];
  area: Scalars['Int'];
  hasWaterConnected: Scalars['Boolean'];
};

export enum AddressOwnership {
  Own = 'OWN',
  Brf = 'BRF',
  Rent = 'RENT'
}

export type Agreement = SwedishApartmentAgreement | SwedishHouseAgreement | NorwegianHomeContentAgreement | NorwegianTravelAgreement | DanishHomeContentAgreement | DanishAccidentAgreement | DanishTravelAgreement;

export type AgreementCore = {
  id: Scalars['ID'];
  status: AgreementStatus;
  activeFrom?: Maybe<Scalars['LocalDate']>;
  activeTo?: Maybe<Scalars['LocalDate']>;
  premium: MonetaryAmountV2;
  certificateUrl?: Maybe<Scalars['String']>;
};

export enum AgreementStatus {
  /** An agreement with no activation date, waiting to be activated */
  Pending = 'PENDING',
  /** An agreement that will be active on a future date */
  ActiveInFuture = 'ACTIVE_IN_FUTURE',
  /** An agreement that is active today */
  Active = 'ACTIVE',
  /** An agreement that either was never active that is now terminated or was active in the past of a now terminated contract */
  Terminated = 'TERMINATED'
}

export type AngelStory = {
  __typename?: 'AngelStory';
  content: Scalars['String'];
};

export type ArrangedPerilCategories = {
  __typename?: 'ArrangedPerilCategories';
  me?: Maybe<PerilCategory>;
  home?: Maybe<PerilCategory>;
  stuff?: Maybe<PerilCategory>;
};

export type AuthEvent = {
  __typename?: 'AuthEvent';
  status?: Maybe<AuthState>;
};

export enum AuthState {
  Initiated = 'INITIATED',
  InProgress = 'IN_PROGRESS',
  Failed = 'FAILED',
  Success = 'SUCCESS'
}

export type Avatar = {
  __typename?: 'Avatar';
  name: Scalars['String'];
  URL: Scalars['String'];
  width: Scalars['Int'];
  height: Scalars['Int'];
  duration: Scalars['Int'];
  data?: Maybe<Scalars['Object']>;
};

export type BankIdAuthResponse = {
  __typename?: 'BankIdAuthResponse';
  autoStartToken: Scalars['String'];
};

export type BankIdSignResponse = {
  __typename?: 'BankIdSignResponse';
  autoStartToken?: Maybe<Scalars['String']>;
  redirectUrl?: Maybe<Scalars['String']>;
};

export enum BankIdStatus {
  Pending = 'pending',
  Failed = 'failed',
  Complete = 'complete'
}

export type CampaignInput = {
  source?: Maybe<Scalars['String']>;
  medium?: Maybe<Scalars['String']>;
  term?: Maybe<Scalars['String']>;
  content?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
};

export type Cashback = {
  __typename?: 'Cashback';
  id?: Maybe<Scalars['ID']>;
  name?: Maybe<Scalars['String']>;
  imageUrl?: Maybe<Scalars['String']>;
  selectedUrl?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  paragraph?: Maybe<Scalars['String']>;
};

export type ChatAction = {
  __typename?: 'ChatAction';
  text?: Maybe<Scalars['String']>;
  triggerUrl?: Maybe<Scalars['URL']>;
  enabled?: Maybe<Scalars['Boolean']>;
};

export type ChatResponse = {
  __typename?: 'ChatResponse';
  globalId: Scalars['ID'];
  id: Scalars['ID'];
  body: MessageBody;
  header: MessageHeader;
};

export type ChatResponseAudioInput = {
  globalId: Scalars['ID'];
  file: Scalars['Upload'];
};

export type ChatResponseBodyAudioInput = {
  url: Scalars['String'];
};

export type ChatResponseBodyFileInput = {
  key: Scalars['String'];
  mimeType: Scalars['String'];
};

export type ChatResponseBodySingleSelectInput = {
  selectedValue: Scalars['ID'];
};

export type ChatResponseBodyTextInput = {
  text: Scalars['String'];
};

export type ChatResponseFileInput = {
  globalId: Scalars['ID'];
  body: ChatResponseBodyFileInput;
};

export type ChatResponseSingleSelectInput = {
  globalId: Scalars['ID'];
  body: ChatResponseBodySingleSelectInput;
};

export type ChatResponseTextInput = {
  globalId: Scalars['ID'];
  body: ChatResponseBodyTextInput;
};

export type ChatState = {
  __typename?: 'ChatState';
  ongoingClaim: Scalars['Boolean'];
  showOfferScreen: Scalars['Boolean'];
  onboardingDone: Scalars['Boolean'];
};

export type CollectStatus = {
  __typename?: 'CollectStatus';
  status?: Maybe<BankIdStatus>;
  code?: Maybe<Scalars['String']>;
};

export type Contract = {
  __typename?: 'Contract';
  id: Scalars['ID'];
  holderMember: Scalars['ID'];
  typeOfContract: TypeOfContract;
  switchedFromInsuranceProvider?: Maybe<Scalars['String']>;
  status: ContractStatus;
  displayName: Scalars['String'];
  /**
   * "The 'best guess' of the agreement that depicts the member's insurance, either
   * the pending, future, current or, if terminated, past agreement
   */
  currentAgreement: Agreement;
  /** The date the contract agreement timeline begin, if it has been activated */
  inception?: Maybe<Scalars['LocalDate']>;
  /** The date the contract agreement timelinen end, on if it has been terminated */
  termination?: Maybe<Scalars['LocalDate']>;
  /** An upcoming renewal, present if the member has been notified and the renewal is within 31 days */
  upcomingRenewal?: Maybe<UpcomingRenewal>;
  createdAt: Scalars['Instant'];
};

export type ContractBundle = {
  __typename?: 'ContractBundle';
  id: Scalars['ID'];
  contracts: Array<Contract>;
  angelStories: ContractBundleAngelStories;
};

export type ContractBundleAngelStories = {
  __typename?: 'ContractBundleAngelStories';
  addressChange?: Maybe<Scalars['ID']>;
};

export type ContractStatus = PendingStatus | ActiveInFutureStatus | ActiveStatus | ActiveInFutureAndTerminatedInFutureStatus | TerminatedInFutureStatus | TerminatedTodayStatus | TerminatedStatus;

export type DanishAccidentAgreement = AgreementCore & {
  __typename?: 'DanishAccidentAgreement';
  id: Scalars['ID'];
  activeFrom?: Maybe<Scalars['LocalDate']>;
  activeTo?: Maybe<Scalars['LocalDate']>;
  premium: MonetaryAmountV2;
  certificateUrl?: Maybe<Scalars['String']>;
  status: AgreementStatus;
  address: Address;
  numberCoInsured: Scalars['Int'];
  type?: Maybe<DanishAccidentLineOfBusiness>;
};

export enum DanishAccidentLineOfBusiness {
  Regular = 'REGULAR',
  Student = 'STUDENT'
}

export type DanishBankIdAuthResponse = {
  __typename?: 'DanishBankIdAuthResponse';
  redirectUrl: Scalars['String'];
};

export type DanishHomeContentAgreement = AgreementCore & {
  __typename?: 'DanishHomeContentAgreement';
  id: Scalars['ID'];
  activeFrom?: Maybe<Scalars['LocalDate']>;
  activeTo?: Maybe<Scalars['LocalDate']>;
  premium: MonetaryAmountV2;
  certificateUrl?: Maybe<Scalars['String']>;
  status: AgreementStatus;
  address: Address;
  numberCoInsured: Scalars['Int'];
  squareMeters: Scalars['Int'];
  type?: Maybe<DanishHomeContentLineOfBusiness>;
};

export enum DanishHomeContentLineOfBusiness {
  Rent = 'RENT',
  Own = 'OWN',
  StudentRent = 'STUDENT_RENT',
  StudentOwn = 'STUDENT_OWN'
}

export type DanishTravelAgreement = AgreementCore & {
  __typename?: 'DanishTravelAgreement';
  id: Scalars['ID'];
  activeFrom?: Maybe<Scalars['LocalDate']>;
  activeTo?: Maybe<Scalars['LocalDate']>;
  premium: MonetaryAmountV2;
  certificateUrl?: Maybe<Scalars['String']>;
  status: AgreementStatus;
  address: Address;
  numberCoInsured: Scalars['Int'];
  type?: Maybe<DanishTravelLineOfBusiness>;
};

export enum DanishTravelLineOfBusiness {
  Regular = 'REGULAR',
  Student = 'STUDENT'
}

export type ExtraBuilding = ExtraBuildingValue;

export type ExtraBuildingCore = {
  type: ExtraBuildingType;
  area: Scalars['Int'];
  displayName: Scalars['String'];
  hasWaterConnected: Scalars['Boolean'];
};

export enum ExtraBuildingType {
  Garage = 'GARAGE',
  Carport = 'CARPORT',
  Shed = 'SHED',
  Storehouse = 'STOREHOUSE',
  Friggebod = 'FRIGGEBOD',
  Attefall = 'ATTEFALL',
  Outhouse = 'OUTHOUSE',
  Guesthouse = 'GUESTHOUSE',
  Gazebo = 'GAZEBO',
  Greenhouse = 'GREENHOUSE',
  Sauna = 'SAUNA',
  Barn = 'BARN',
  Boathouse = 'BOATHOUSE',
  Other = 'OTHER'
}

export type ExtraBuildingValue = ExtraBuildingCore & {
  __typename?: 'ExtraBuildingValue';
  type: ExtraBuildingType;
  area: Scalars['Int'];
  displayName: Scalars['String'];
  hasWaterConnected: Scalars['Boolean'];
};

export enum Feature {
  KeyGear = 'KeyGear',
  Referrals = 'Referrals'
}

export type File = {
  __typename?: 'File';
  /** signedUrl is valid for 30 minutes after upload, don't hang on to this. */
  signedUrl: Scalars['String'];
  /** S3 key that can be used to retreive new signed urls in the future. */
  key: Scalars['String'];
  /** S3 bucket that the file was uploaded to. */
  bucket: Scalars['String'];
};

export type Geo = {
  __typename?: 'Geo';
  countryISOCode: Scalars['String'];
};

export type Gif = {
  __typename?: 'Gif';
  url?: Maybe<Scalars['String']>;
};


export type Insurance = {
  __typename?: 'Insurance';
  address?: Maybe<Scalars['String']>;
  postalNumber?: Maybe<Scalars['String']>;
  cost?: Maybe<InsuranceCost>;
  personsInHousehold?: Maybe<Scalars['Int']>;
  certificateUrl?: Maybe<Scalars['String']>;
  status: InsuranceStatus;
  type?: Maybe<InsuranceType>;
  activeFrom?: Maybe<Scalars['LocalDate']>;
  /** @deprecated Use previousInsurer instead */
  insuredAtOtherCompany?: Maybe<Scalars['Boolean']>;
  presaleInformationUrl?: Maybe<Scalars['String']>;
  policyUrl?: Maybe<Scalars['String']>;
  /** @deprecated Use previousInsurer instead */
  currentInsurerName?: Maybe<Scalars['String']>;
  livingSpace?: Maybe<Scalars['Int']>;
  /** @deprecated Use arrangedPerilCategories instead */
  perilCategories?: Maybe<Array<Maybe<PerilCategory>>>;
  /** @deprecated Use cost instead */
  monthlyCost?: Maybe<Scalars['Int']>;
  /** @deprecated Field no longer supported */
  safetyIncreasers?: Maybe<Array<Scalars['String']>>;
  arrangedPerilCategories: ArrangedPerilCategories;
  renewal?: Maybe<Renewal>;
  previousInsurer?: Maybe<PreviousInsurer>;
  ancillaryArea?: Maybe<Scalars['Int']>;
  yearOfConstruction?: Maybe<Scalars['Int']>;
  numberOfBathrooms?: Maybe<Scalars['Int']>;
  extraBuildings?: Maybe<Array<ExtraBuilding>>;
  isSubleted?: Maybe<Scalars['Boolean']>;
};

export type InsuranceCost = {
  __typename?: 'InsuranceCost';
  monthlyGross: MonetaryAmountV2;
  monthlyDiscount: MonetaryAmountV2;
  monthlyNet: MonetaryAmountV2;
  freeUntil?: Maybe<Scalars['LocalDate']>;
};

export enum InsuranceStatus {
  Pending = 'PENDING',
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  InactiveWithStartDate = 'INACTIVE_WITH_START_DATE',
  Terminated = 'TERMINATED'
}

export enum InsuranceType {
  Rent = 'RENT',
  Brf = 'BRF',
  StudentRent = 'STUDENT_RENT',
  StudentBrf = 'STUDENT_BRF',
  House = 'HOUSE'
}


export enum KeyboardType {
  Default = 'DEFAULT',
  Numberpad = 'NUMBERPAD',
  Decimalpad = 'DECIMALPAD',
  Numeric = 'NUMERIC',
  Email = 'EMAIL',
  Phone = 'PHONE'
}


export enum Locale {
  SvSe = 'sv_SE',
  EnSe = 'en_SE',
  NbNo = 'nb_NO',
  EnNo = 'en_NO',
  DaDk = 'da_DK',
  EnDk = 'en_DK'
}

export type LoggingInput = {
  timestamp: Scalars['TimeStamp'];
  source: LoggingSource;
  payload: Scalars['JSONObject'];
  severity: LoggingSeverity;
};

export enum LoggingSeverity {
  Default = 'DEFAULT',
  Debug = 'DEBUG',
  Info = 'INFO',
  Notice = 'NOTICE',
  Warning = 'WARNING',
  Error = 'ERROR',
  Critical = 'CRITICAL',
  Alert = 'ALERT',
  Emergency = 'EMERGENCY'
}

export enum LoggingSource {
  Ios = 'IOS',
  Android = 'ANDROID'
}

export type Member = {
  __typename?: 'Member';
  id?: Maybe<Scalars['ID']>;
  firstName?: Maybe<Scalars['String']>;
  lastName?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  phoneNumber?: Maybe<Scalars['String']>;
  acceptLanguage?: Maybe<Scalars['String']>;
  features: Array<Feature>;
};

export type Message = {
  __typename?: 'Message';
  globalId: Scalars['ID'];
  id: Scalars['ID'];
  body: MessageBody;
  header: MessageHeader;
};

export type MessageBody = MessageBodySingleSelect | MessageBodyMultipleSelect | MessageBodyText | MessageBodyNumber | MessageBodyAudio | MessageBodyBankIdCollect | MessageBodyFile | MessageBodyParagraph | MessageBodyUndefined;

export type MessageBodyAudio = MessageBodyCore & {
  __typename?: 'MessageBodyAudio';
  type: Scalars['String'];
  id: Scalars['ID'];
  text: Scalars['String'];
  url?: Maybe<Scalars['String']>;
};

export type MessageBodyBankIdCollect = MessageBodyCore & {
  __typename?: 'MessageBodyBankIdCollect';
  type: Scalars['String'];
  id: Scalars['ID'];
  text: Scalars['String'];
  referenceId?: Maybe<Scalars['String']>;
};

export type MessageBodyChoices = MessageBodyChoicesUndefined | MessageBodyChoicesSelection | MessageBodyChoicesLink;

export type MessageBodyChoicesCore = {
  type: Scalars['String'];
  value: Scalars['String'];
  text: Scalars['String'];
  selected: Scalars['Boolean'];
};

export type MessageBodyChoicesLink = MessageBodyChoicesCore & {
  __typename?: 'MessageBodyChoicesLink';
  type: Scalars['String'];
  value: Scalars['String'];
  text: Scalars['String'];
  selected: Scalars['Boolean'];
  view?: Maybe<MessageBodyChoicesLinkView>;
  appUrl?: Maybe<Scalars['String']>;
  webUrl?: Maybe<Scalars['String']>;
};

export enum MessageBodyChoicesLinkView {
  Offer = 'OFFER',
  Dashboard = 'DASHBOARD'
}

export type MessageBodyChoicesSelection = MessageBodyChoicesCore & {
  __typename?: 'MessageBodyChoicesSelection';
  type: Scalars['String'];
  value: Scalars['String'];
  text: Scalars['String'];
  selected: Scalars['Boolean'];
  clearable?: Maybe<Scalars['Boolean']>;
};

export type MessageBodyChoicesUndefined = MessageBodyChoicesCore & {
  __typename?: 'MessageBodyChoicesUndefined';
  type: Scalars['String'];
  value: Scalars['String'];
  text: Scalars['String'];
  selected: Scalars['Boolean'];
};

export type MessageBodyCore = {
  type: Scalars['String'];
  id: Scalars['ID'];
  text: Scalars['String'];
};

export type MessageBodyFile = MessageBodyCore & {
  __typename?: 'MessageBodyFile';
  type: Scalars['String'];
  id: Scalars['ID'];
  text: Scalars['String'];
  key?: Maybe<Scalars['String']>;
  mimeType?: Maybe<Scalars['String']>;
  file: File;
};

export type MessageBodyMultipleSelect = MessageBodyCore & {
  __typename?: 'MessageBodyMultipleSelect';
  type: Scalars['String'];
  id: Scalars['ID'];
  text: Scalars['String'];
  choices?: Maybe<Array<Maybe<MessageBodyChoices>>>;
};

export type MessageBodyNumber = MessageBodyCore & {
  __typename?: 'MessageBodyNumber';
  type: Scalars['String'];
  id: Scalars['ID'];
  text: Scalars['String'];
  placeholder?: Maybe<Scalars['String']>;
  keyboard?: Maybe<KeyboardType>;
  textContentType?: Maybe<TextContentType>;
};

export type MessageBodyParagraph = MessageBodyCore & {
  __typename?: 'MessageBodyParagraph';
  type: Scalars['String'];
  id: Scalars['ID'];
  text: Scalars['String'];
};

export type MessageBodySingleSelect = MessageBodyCore & {
  __typename?: 'MessageBodySingleSelect';
  type: Scalars['String'];
  id: Scalars['ID'];
  text: Scalars['String'];
  choices?: Maybe<Array<Maybe<MessageBodyChoices>>>;
};

export type MessageBodyText = MessageBodyCore & {
  __typename?: 'MessageBodyText';
  type: Scalars['String'];
  id: Scalars['ID'];
  text: Scalars['String'];
  placeholder?: Maybe<Scalars['String']>;
  keyboard?: Maybe<KeyboardType>;
  textContentType?: Maybe<TextContentType>;
};

export type MessageBodyUndefined = MessageBodyCore & {
  __typename?: 'MessageBodyUndefined';
  type: Scalars['String'];
  id: Scalars['ID'];
  text: Scalars['String'];
};

export type MessageHeader = {
  __typename?: 'MessageHeader';
  messageId: Scalars['ID'];
  fromMyself: Scalars['Boolean'];
  timeStamp: Scalars['String'];
  richTextChatCompatible: Scalars['Boolean'];
  editAllowed: Scalars['Boolean'];
  shouldRequestPushNotifications: Scalars['Boolean'];
  pollingInterval: Scalars['Int'];
  loadingIndicator?: Maybe<Scalars['String']>;
  markedAsRead: Scalars['Boolean'];
  statusMessage?: Maybe<Scalars['String']>;
};

export type MonetaryAmountV2 = {
  __typename?: 'MonetaryAmountV2';
  amount: Scalars['String'];
  currency: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  logout: Scalars['Boolean'];
  createSession: Scalars['String'];
  createSessionV2?: Maybe<SessionInformation>;
  /** @deprecated Use Quotes instead */
  createOffer?: Maybe<Scalars['Boolean']>;
  /** @deprecated Use `signOfferV2`. */
  signOffer?: Maybe<Scalars['Boolean']>;
  /** @deprecated Use Quotes instead */
  signOfferV2: BankIdSignResponse;
  uploadFile: File;
  uploadFiles?: Maybe<Array<File>>;
  selectCashbackOption: Cashback;
  /** @deprecated Use Quotes instead */
  offerClosed: Scalars['Boolean'];
  startDirectDebitRegistration: Scalars['URL'];
  sendChatTextResponse: Scalars['Boolean'];
  sendChatSingleSelectResponse: Scalars['Boolean'];
  sendChatFileResponse: Scalars['Boolean'];
  sendChatAudioResponse: Scalars['Boolean'];
  resetConversation: Scalars['Boolean'];
  editLastResponse: Scalars['Boolean'];
  updateEmail: Member;
  updatePhoneNumber: Member;
  registerPushToken?: Maybe<Scalars['Boolean']>;
  triggerFreeTextChat?: Maybe<Scalars['Boolean']>;
  triggerClaimChat?: Maybe<Scalars['Boolean']>;
  triggerCallMeChat?: Maybe<Scalars['Boolean']>;
  emailSign?: Maybe<Scalars['Boolean']>;
  markMessageAsRead: Message;
  log?: Maybe<Scalars['Boolean']>;
  /** @deprecated Use `swedishBankIdAuth`. */
  bankIdAuth: BankIdAuthResponse;
  swedishBankIdAuth: BankIdAuthResponse;
  norwegianBankIdAuth: NorwegianBankIdAuthResponse;
  danishBankIdAuth: DanishBankIdAuthResponse;
  registerBranchCampaign?: Maybe<Scalars['Boolean']>;
  updateLanguage: Scalars['Boolean'];
  updatePickedLocale: Member;
  /** Create all the quotes needed in relation to a change of address, based on the current state of the member's insurance. */
  createAddressChangeQuotes: AddressChangeQuoteResult;
};


export type MutationCreateSessionArgs = {
  campaign?: Maybe<CampaignInput>;
  trackingId?: Maybe<Scalars['UUID']>;
};


export type MutationCreateOfferArgs = {
  details: OfferInput;
};


export type MutationSignOfferArgs = {
  details: SignInput;
};


export type MutationSignOfferV2Args = {
  details?: Maybe<SignInput>;
};


export type MutationUploadFileArgs = {
  file: Scalars['Upload'];
};


export type MutationUploadFilesArgs = {
  files: Array<Scalars['Upload']>;
};


export type MutationSelectCashbackOptionArgs = {
  id: Scalars['ID'];
  locale?: Maybe<Locale>;
};


export type MutationSendChatTextResponseArgs = {
  input: ChatResponseTextInput;
};


export type MutationSendChatSingleSelectResponseArgs = {
  input: ChatResponseSingleSelectInput;
};


export type MutationSendChatFileResponseArgs = {
  input: ChatResponseFileInput;
};


export type MutationSendChatAudioResponseArgs = {
  input: ChatResponseAudioInput;
};


export type MutationUpdateEmailArgs = {
  input: Scalars['String'];
};


export type MutationUpdatePhoneNumberArgs = {
  input: Scalars['String'];
};


export type MutationRegisterPushTokenArgs = {
  pushToken: Scalars['String'];
};


export type MutationTriggerClaimChatArgs = {
  input: TriggerClaimChatInput;
};


export type MutationMarkMessageAsReadArgs = {
  globalId: Scalars['ID'];
};


export type MutationLogArgs = {
  input: LoggingInput;
};


export type MutationNorwegianBankIdAuthArgs = {
  personalNumber?: Maybe<Scalars['String']>;
};


export type MutationDanishBankIdAuthArgs = {
  personalNumber: Scalars['String'];
};


export type MutationRegisterBranchCampaignArgs = {
  campaign: CampaignInput;
};


export type MutationUpdateLanguageArgs = {
  input: Scalars['String'];
};


export type MutationUpdatePickedLocaleArgs = {
  pickedLocale: Locale;
};


export type MutationCreateAddressChangeQuotesArgs = {
  input: AddressChangeInput;
};

export type NorwegianBankIdAuthResponse = {
  __typename?: 'NorwegianBankIdAuthResponse';
  redirectUrl: Scalars['String'];
};

export type NorwegianHomeContentAgreement = AgreementCore & {
  __typename?: 'NorwegianHomeContentAgreement';
  id: Scalars['ID'];
  activeFrom?: Maybe<Scalars['LocalDate']>;
  activeTo?: Maybe<Scalars['LocalDate']>;
  premium: MonetaryAmountV2;
  certificateUrl?: Maybe<Scalars['String']>;
  status: AgreementStatus;
  address: Address;
  numberCoInsured: Scalars['Int'];
  squareMeters: Scalars['Int'];
  type?: Maybe<NorwegianHomeContentLineOfBusiness>;
};

export enum NorwegianHomeContentLineOfBusiness {
  Rent = 'RENT',
  Own = 'OWN',
  YouthRent = 'YOUTH_RENT',
  YouthOwn = 'YOUTH_OWN'
}

export type NorwegianTravelAgreement = AgreementCore & {
  __typename?: 'NorwegianTravelAgreement';
  id: Scalars['ID'];
  activeFrom?: Maybe<Scalars['LocalDate']>;
  activeTo?: Maybe<Scalars['LocalDate']>;
  premium: MonetaryAmountV2;
  certificateUrl?: Maybe<Scalars['String']>;
  status: AgreementStatus;
  numberCoInsured: Scalars['Int'];
  type?: Maybe<NorwegianTravelLineOfBusiness>;
};

export enum NorwegianTravelLineOfBusiness {
  Regular = 'REGULAR',
  Youth = 'YOUTH'
}


export type OfferEvent = {
  __typename?: 'OfferEvent';
  status: OfferStatus;
  insurance?: Maybe<Insurance>;
};

export type OfferInput = {
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  age: Scalars['Int'];
  address: Scalars['String'];
  postalNumber: Scalars['String'];
  city?: Maybe<Scalars['String']>;
  insuranceType: InsuranceType;
  squareMeters: Scalars['Int'];
  personsInHousehold: Scalars['Int'];
  previousInsurer?: Maybe<Scalars['String']>;
};

export enum OfferStatus {
  Success = 'SUCCESS',
  Fail = 'FAIL'
}

/** The contract is neither active or terminated, waiting to have an inception date set */
export type PendingStatus = {
  __typename?: 'PendingStatus';
  pendingSince?: Maybe<Scalars['LocalDate']>;
};

export type Peril = {
  __typename?: 'Peril';
  id?: Maybe<Scalars['ID']>;
  title?: Maybe<Scalars['String']>;
  imageUrl?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
};

export type PerilCategory = {
  __typename?: 'PerilCategory';
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  iconUrl?: Maybe<Scalars['String']>;
  perils?: Maybe<Array<Maybe<Peril>>>;
};

export type PreviousInsurer = {
  __typename?: 'PreviousInsurer';
  displayName?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  switchable: Scalars['Boolean'];
};

export type Query = {
  __typename?: 'Query';
  /** @deprecated Use `contracts` instead */
  insurance: Insurance;
  cashback?: Maybe<Cashback>;
  cashbackOptions: Array<Maybe<Cashback>>;
  signStatus?: Maybe<SignStatus>;
  member: Member;
  gifs: Array<Maybe<Gif>>;
  file: File;
  messages: Array<Maybe<Message>>;
  currentChatResponse?: Maybe<ChatResponse>;
  chatState: ChatState;
  avatars?: Maybe<Array<Maybe<Avatar>>>;
  chatActions?: Maybe<Array<Maybe<ChatAction>>>;
  geo: Geo;
  angelStory?: Maybe<AngelStory>;
  /** Returns all the currently active contracts, combined into bundles. */
  activeContractBundles: Array<ContractBundle>;
  /** Returns all contracts the member currently holds, regardless of activation/termination status */
  contracts: Array<Contract>;
  /** Returns whether a member has at least one contract */
  hasContract: Scalars['Boolean'];
  /**
   * Returns a type describing whether the 'Self Change' functionality is possible.
   * @deprecated Use angelStories in `activeContractBundles` instead
   */
  selfChangeEligibility: SelfChangeEligibility;
  /** All locales that are available and activated */
  availableLocales: Array<Locale>;
};


export type QueryCashbackArgs = {
  locale?: Maybe<Locale>;
};


export type QueryCashbackOptionsArgs = {
  locale?: Maybe<Locale>;
};


export type QueryGifsArgs = {
  query: Scalars['String'];
};


export type QueryFileArgs = {
  key: Scalars['String'];
};


export type QueryAngelStoryArgs = {
  name: Scalars['String'];
  locale?: Maybe<Scalars['String']>;
};

export type Renewal = {
  __typename?: 'Renewal';
  certificateUrl: Scalars['String'];
  date: Scalars['LocalDate'];
};

/** These types represent reasons for why the self-change flow cannot be run. */
export enum SelfChangeBlocker {
  /** Member has no contracts - changing them makes no sense. */
  NoContracts = 'NO_CONTRACTS',
  /** Member has at least one contract that is not supported at this time */
  UnsupportedContract = 'UNSUPPORTED_CONTRACT',
  /** Contract is still pending, it can't be changed until it is active. */
  StillPending = 'STILL_PENDING',
  /** Contract has a termination date set. */
  HasTermination = 'HAS_TERMINATION',
  /** Contract is already undergoing future changes. */
  HasFutureChanges = 'HAS_FUTURE_CHANGES',
  /** Contract is not currently active. */
  NotActiveToday = 'NOT_ACTIVE_TODAY',
  /** Member has multiple contracts with mismatching number of co-insured. */
  CoinsuredMismatch = 'COINSURED_MISMATCH',
  /** Member has multiple contracts with mismatching 'youth' status. */
  YouthMismatch = 'YOUTH_MISMATCH',
  /** Member has too many contracts. */
  TooManyContracts = 'TOO_MANY_CONTRACTS'
}

export type SelfChangeEligibility = {
  __typename?: 'SelfChangeEligibility';
  /** @deprecated Use addressChangeEmbarkStoryId instead */
  blockers: Array<SelfChangeBlocker>;
  /** @deprecated Use addressChangeEmbarkStoryId instead */
  embarkStoryId?: Maybe<Scalars['ID']>;
  /** The ID of an embark story that contains an address change flow, if eligible. */
  addressChangeEmbarkStoryId?: Maybe<Scalars['ID']>;
};

export type SessionInformation = {
  __typename?: 'SessionInformation';
  token: Scalars['String'];
  memberId: Scalars['String'];
};

export type SignEvent = {
  __typename?: 'SignEvent';
  status?: Maybe<SignStatus>;
};

export type SignInput = {
  personalNumber: Scalars['String'];
  email: Scalars['String'];
};

export enum SignState {
  Initiated = 'INITIATED',
  InProgress = 'IN_PROGRESS',
  Failed = 'FAILED',
  Completed = 'COMPLETED'
}

export type SignStatus = {
  __typename?: 'SignStatus';
  collectStatus?: Maybe<CollectStatus>;
  signState?: Maybe<SignState>;
};

export type Subscription = {
  __typename?: 'Subscription';
  /** @deprecated Use Quotes instead */
  offer?: Maybe<OfferEvent>;
  /** @deprecated Use Quotes instead */
  signStatus?: Maybe<SignEvent>;
  message: Message;
  currentChatResponse?: Maybe<ChatResponse>;
  chatState: ChatState;
  authStatus?: Maybe<AuthEvent>;
};


export type SubscriptionCurrentChatResponseArgs = {
  mostRecentTimestamp: Scalars['String'];
};


export type SubscriptionChatStateArgs = {
  mostRecentTimestamp: Scalars['String'];
};

export type SwedishApartmentAgreement = AgreementCore & {
  __typename?: 'SwedishApartmentAgreement';
  id: Scalars['ID'];
  activeFrom?: Maybe<Scalars['LocalDate']>;
  activeTo?: Maybe<Scalars['LocalDate']>;
  premium: MonetaryAmountV2;
  certificateUrl?: Maybe<Scalars['String']>;
  status: AgreementStatus;
  address: Address;
  numberCoInsured: Scalars['Int'];
  squareMeters: Scalars['Int'];
  type: SwedishApartmentLineOfBusiness;
};

export enum SwedishApartmentLineOfBusiness {
  Rent = 'RENT',
  Brf = 'BRF',
  StudentRent = 'STUDENT_RENT',
  StudentBrf = 'STUDENT_BRF'
}

export type SwedishHouseAgreement = AgreementCore & {
  __typename?: 'SwedishHouseAgreement';
  id: Scalars['ID'];
  activeFrom?: Maybe<Scalars['LocalDate']>;
  activeTo?: Maybe<Scalars['LocalDate']>;
  premium: MonetaryAmountV2;
  certificateUrl?: Maybe<Scalars['String']>;
  status: AgreementStatus;
  address: Address;
  numberCoInsured: Scalars['Int'];
  squareMeters: Scalars['Int'];
  ancillaryArea: Scalars['Int'];
  yearOfConstruction: Scalars['Int'];
  numberOfBathrooms: Scalars['Int'];
  extraBuildings: Array<Maybe<ExtraBuilding>>;
  isSubleted: Scalars['Boolean'];
};

/** The contract is active today but will be terminated in the future, i.e. is active today but will not be in the future */
export type TerminatedInFutureStatus = {
  __typename?: 'TerminatedInFutureStatus';
  futureTermination?: Maybe<Scalars['LocalDate']>;
  upcomingAgreementChange?: Maybe<UpcomingAgreementChange>;
};

/**
 * The contract has been terminated in the past, terminated on the same date as its
 * start date or has never been activated and has a termination date set
 */
export type TerminatedStatus = {
  __typename?: 'TerminatedStatus';
  termination?: Maybe<Scalars['LocalDate']>;
};

/** The contract has been active and has its termination date set to today, i.e. today is the last day the contract is active */
export type TerminatedTodayStatus = {
  __typename?: 'TerminatedTodayStatus';
  today?: Maybe<Scalars['LocalDate']>;
  upcomingAgreementChange?: Maybe<UpcomingAgreementChange>;
};

export enum TextContentType {
  None = 'NONE',
  Url = 'URL',
  AddressCity = 'ADDRESS_CITY',
  AddressCityState = 'ADDRESS_CITY_STATE',
  AddressState = 'ADDRESS_STATE',
  CountryName = 'COUNTRY_NAME',
  CreditCardNumber = 'CREDIT_CARD_NUMBER',
  EmailAddress = 'EMAIL_ADDRESS',
  FamilyName = 'FAMILY_NAME',
  FullStreetAddress = 'FULL_STREET_ADDRESS',
  GivenName = 'GIVEN_NAME',
  JobTitle = 'JOB_TITLE',
  Location = 'LOCATION',
  MiddleName = 'MIDDLE_NAME',
  Name = 'NAME',
  NamePrefix = 'NAME_PREFIX',
  NameSuffix = 'NAME_SUFFIX',
  NickName = 'NICK_NAME',
  OrganizationName = 'ORGANIZATION_NAME',
  PostalCode = 'POSTAL_CODE',
  StreetAddressLine1 = 'STREET_ADDRESS_LINE1',
  StreetAddressLine2 = 'STREET_ADDRESS_LINE2',
  Sublocality = 'SUBLOCALITY',
  TelephoneNumber = 'TELEPHONE_NUMBER',
  Username = 'USERNAME',
  Password = 'PASSWORD'
}


export type TriggerClaimChatInput = {
  claimTypeId?: Maybe<Scalars['ID']>;
};

export enum TypeOfContract {
  SeHouse = 'SE_HOUSE',
  SeApartmentBrf = 'SE_APARTMENT_BRF',
  SeApartmentRent = 'SE_APARTMENT_RENT',
  SeApartmentStudentBrf = 'SE_APARTMENT_STUDENT_BRF',
  SeApartmentStudentRent = 'SE_APARTMENT_STUDENT_RENT',
  NoHomeContentOwn = 'NO_HOME_CONTENT_OWN',
  NoHomeContentRent = 'NO_HOME_CONTENT_RENT',
  NoHomeContentYouthOwn = 'NO_HOME_CONTENT_YOUTH_OWN',
  NoHomeContentYouthRent = 'NO_HOME_CONTENT_YOUTH_RENT',
  NoTravel = 'NO_TRAVEL',
  NoTravelYouth = 'NO_TRAVEL_YOUTH',
  DkHomeContentOwn = 'DK_HOME_CONTENT_OWN',
  DkHomeContentRent = 'DK_HOME_CONTENT_RENT',
  DkHomeContentStudentOwn = 'DK_HOME_CONTENT_STUDENT_OWN',
  DkHomeContentStudentRent = 'DK_HOME_CONTENT_STUDENT_RENT',
  DkAccident = 'DK_ACCIDENT',
  DkAccidentStudent = 'DK_ACCIDENT_STUDENT',
  DkTravel = 'DK_TRAVEL',
  DkTravelStudent = 'DK_TRAVEL_STUDENT'
}

/** If present, the upcomingAgreementChange contains info regarding the agreement that will succeed the current one */
export type UpcomingAgreementChange = {
  __typename?: 'UpcomingAgreementChange';
  newAgreement: Agreement;
};

export type UpcomingRenewal = {
  __typename?: 'UpcomingRenewal';
  renewalDate: Scalars['LocalDate'];
  draftCertificateUrl: Scalars['String'];
};






export type ResolverTypeWrapper<T> = Promise<T> | T;

export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Query: ResolverTypeWrapper<{}>;
  Insurance: ResolverTypeWrapper<Omit<Insurance, 'extraBuildings'> & { extraBuildings?: Maybe<Array<ResolversTypes['ExtraBuilding']>> }>;
  String: ResolverTypeWrapper<Scalars['String']>;
  InsuranceCost: ResolverTypeWrapper<InsuranceCost>;
  MonetaryAmountV2: ResolverTypeWrapper<MonetaryAmountV2>;
  LocalDate: ResolverTypeWrapper<Scalars['LocalDate']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  InsuranceStatus: InsuranceStatus;
  InsuranceType: InsuranceType;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  PerilCategory: ResolverTypeWrapper<PerilCategory>;
  Peril: ResolverTypeWrapper<Peril>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  ArrangedPerilCategories: ResolverTypeWrapper<ArrangedPerilCategories>;
  Renewal: ResolverTypeWrapper<Renewal>;
  PreviousInsurer: ResolverTypeWrapper<PreviousInsurer>;
  ExtraBuilding: ResolversTypes['ExtraBuildingValue'];
  ExtraBuildingValue: ResolverTypeWrapper<ExtraBuildingValue>;
  ExtraBuildingCore: ResolversTypes['ExtraBuildingValue'];
  ExtraBuildingType: ExtraBuildingType;
  Locale: Locale;
  Cashback: ResolverTypeWrapper<Cashback>;
  SignStatus: ResolverTypeWrapper<SignStatus>;
  CollectStatus: ResolverTypeWrapper<CollectStatus>;
  BankIdStatus: BankIdStatus;
  SignState: SignState;
  Member: ResolverTypeWrapper<Member>;
  Feature: Feature;
  Gif: ResolverTypeWrapper<Gif>;
  File: ResolverTypeWrapper<File>;
  Message: ResolverTypeWrapper<Omit<Message, 'body'> & { body: ResolversTypes['MessageBody'] }>;
  MessageBody: ResolversTypes['MessageBodySingleSelect'] | ResolversTypes['MessageBodyMultipleSelect'] | ResolversTypes['MessageBodyText'] | ResolversTypes['MessageBodyNumber'] | ResolversTypes['MessageBodyAudio'] | ResolversTypes['MessageBodyBankIdCollect'] | ResolversTypes['MessageBodyFile'] | ResolversTypes['MessageBodyParagraph'] | ResolversTypes['MessageBodyUndefined'];
  MessageBodySingleSelect: ResolverTypeWrapper<Omit<MessageBodySingleSelect, 'choices'> & { choices?: Maybe<Array<Maybe<ResolversTypes['MessageBodyChoices']>>> }>;
  MessageBodyCore: ResolversTypes['MessageBodySingleSelect'] | ResolversTypes['MessageBodyMultipleSelect'] | ResolversTypes['MessageBodyText'] | ResolversTypes['MessageBodyNumber'] | ResolversTypes['MessageBodyAudio'] | ResolversTypes['MessageBodyBankIdCollect'] | ResolversTypes['MessageBodyFile'] | ResolversTypes['MessageBodyParagraph'] | ResolversTypes['MessageBodyUndefined'];
  MessageBodyChoices: ResolversTypes['MessageBodyChoicesUndefined'] | ResolversTypes['MessageBodyChoicesSelection'] | ResolversTypes['MessageBodyChoicesLink'];
  MessageBodyChoicesUndefined: ResolverTypeWrapper<MessageBodyChoicesUndefined>;
  MessageBodyChoicesCore: ResolversTypes['MessageBodyChoicesUndefined'] | ResolversTypes['MessageBodyChoicesSelection'] | ResolversTypes['MessageBodyChoicesLink'];
  MessageBodyChoicesSelection: ResolverTypeWrapper<MessageBodyChoicesSelection>;
  MessageBodyChoicesLink: ResolverTypeWrapper<MessageBodyChoicesLink>;
  MessageBodyChoicesLinkView: MessageBodyChoicesLinkView;
  MessageBodyMultipleSelect: ResolverTypeWrapper<Omit<MessageBodyMultipleSelect, 'choices'> & { choices?: Maybe<Array<Maybe<ResolversTypes['MessageBodyChoices']>>> }>;
  MessageBodyText: ResolverTypeWrapper<MessageBodyText>;
  KeyboardType: KeyboardType;
  TextContentType: TextContentType;
  MessageBodyNumber: ResolverTypeWrapper<MessageBodyNumber>;
  MessageBodyAudio: ResolverTypeWrapper<MessageBodyAudio>;
  MessageBodyBankIdCollect: ResolverTypeWrapper<MessageBodyBankIdCollect>;
  MessageBodyFile: ResolverTypeWrapper<MessageBodyFile>;
  MessageBodyParagraph: ResolverTypeWrapper<MessageBodyParagraph>;
  MessageBodyUndefined: ResolverTypeWrapper<MessageBodyUndefined>;
  MessageHeader: ResolverTypeWrapper<MessageHeader>;
  ChatResponse: ResolverTypeWrapper<Omit<ChatResponse, 'body'> & { body: ResolversTypes['MessageBody'] }>;
  ChatState: ResolverTypeWrapper<ChatState>;
  Avatar: ResolverTypeWrapper<Avatar>;
  Object: ResolverTypeWrapper<Scalars['Object']>;
  ChatAction: ResolverTypeWrapper<ChatAction>;
  URL: ResolverTypeWrapper<Scalars['URL']>;
  Geo: ResolverTypeWrapper<Geo>;
  AngelStory: ResolverTypeWrapper<AngelStory>;
  ContractBundle: ResolverTypeWrapper<ContractBundle>;
  Contract: ResolverTypeWrapper<Omit<Contract, 'status' | 'currentAgreement'> & { status: ResolversTypes['ContractStatus'], currentAgreement: ResolversTypes['Agreement'] }>;
  TypeOfContract: TypeOfContract;
  ContractStatus: ResolversTypes['PendingStatus'] | ResolversTypes['ActiveInFutureStatus'] | ResolversTypes['ActiveStatus'] | ResolversTypes['ActiveInFutureAndTerminatedInFutureStatus'] | ResolversTypes['TerminatedInFutureStatus'] | ResolversTypes['TerminatedTodayStatus'] | ResolversTypes['TerminatedStatus'];
  PendingStatus: ResolverTypeWrapper<PendingStatus>;
  ActiveInFutureStatus: ResolverTypeWrapper<ActiveInFutureStatus>;
  ActiveStatus: ResolverTypeWrapper<ActiveStatus>;
  UpcomingAgreementChange: ResolverTypeWrapper<Omit<UpcomingAgreementChange, 'newAgreement'> & { newAgreement: ResolversTypes['Agreement'] }>;
  Agreement: ResolversTypes['SwedishApartmentAgreement'] | ResolversTypes['SwedishHouseAgreement'] | ResolversTypes['NorwegianHomeContentAgreement'] | ResolversTypes['NorwegianTravelAgreement'] | ResolversTypes['DanishHomeContentAgreement'] | ResolversTypes['DanishAccidentAgreement'] | ResolversTypes['DanishTravelAgreement'];
  SwedishApartmentAgreement: ResolverTypeWrapper<SwedishApartmentAgreement>;
  AgreementCore: ResolversTypes['SwedishApartmentAgreement'] | ResolversTypes['SwedishHouseAgreement'] | ResolversTypes['NorwegianHomeContentAgreement'] | ResolversTypes['NorwegianTravelAgreement'] | ResolversTypes['DanishHomeContentAgreement'] | ResolversTypes['DanishAccidentAgreement'] | ResolversTypes['DanishTravelAgreement'];
  AgreementStatus: AgreementStatus;
  Address: ResolverTypeWrapper<Address>;
  SwedishApartmentLineOfBusiness: SwedishApartmentLineOfBusiness;
  SwedishHouseAgreement: ResolverTypeWrapper<Omit<SwedishHouseAgreement, 'extraBuildings'> & { extraBuildings: Array<Maybe<ResolversTypes['ExtraBuilding']>> }>;
  NorwegianHomeContentAgreement: ResolverTypeWrapper<NorwegianHomeContentAgreement>;
  NorwegianHomeContentLineOfBusiness: NorwegianHomeContentLineOfBusiness;
  NorwegianTravelAgreement: ResolverTypeWrapper<NorwegianTravelAgreement>;
  NorwegianTravelLineOfBusiness: NorwegianTravelLineOfBusiness;
  DanishHomeContentAgreement: ResolverTypeWrapper<DanishHomeContentAgreement>;
  DanishHomeContentLineOfBusiness: DanishHomeContentLineOfBusiness;
  DanishAccidentAgreement: ResolverTypeWrapper<DanishAccidentAgreement>;
  DanishAccidentLineOfBusiness: DanishAccidentLineOfBusiness;
  DanishTravelAgreement: ResolverTypeWrapper<DanishTravelAgreement>;
  DanishTravelLineOfBusiness: DanishTravelLineOfBusiness;
  ActiveInFutureAndTerminatedInFutureStatus: ResolverTypeWrapper<ActiveInFutureAndTerminatedInFutureStatus>;
  TerminatedInFutureStatus: ResolverTypeWrapper<TerminatedInFutureStatus>;
  TerminatedTodayStatus: ResolverTypeWrapper<TerminatedTodayStatus>;
  TerminatedStatus: ResolverTypeWrapper<TerminatedStatus>;
  UpcomingRenewal: ResolverTypeWrapper<UpcomingRenewal>;
  Instant: ResolverTypeWrapper<Scalars['Instant']>;
  ContractBundleAngelStories: ResolverTypeWrapper<ContractBundleAngelStories>;
  SelfChangeEligibility: ResolverTypeWrapper<SelfChangeEligibility>;
  SelfChangeBlocker: SelfChangeBlocker;
  Mutation: ResolverTypeWrapper<{}>;
  CampaignInput: CampaignInput;
  UUID: ResolverTypeWrapper<Scalars['UUID']>;
  SessionInformation: ResolverTypeWrapper<SessionInformation>;
  OfferInput: OfferInput;
  SignInput: SignInput;
  BankIdSignResponse: ResolverTypeWrapper<BankIdSignResponse>;
  Upload: ResolverTypeWrapper<Scalars['Upload']>;
  ChatResponseTextInput: ChatResponseTextInput;
  ChatResponseBodyTextInput: ChatResponseBodyTextInput;
  ChatResponseSingleSelectInput: ChatResponseSingleSelectInput;
  ChatResponseBodySingleSelectInput: ChatResponseBodySingleSelectInput;
  ChatResponseFileInput: ChatResponseFileInput;
  ChatResponseBodyFileInput: ChatResponseBodyFileInput;
  ChatResponseAudioInput: ChatResponseAudioInput;
  TriggerClaimChatInput: TriggerClaimChatInput;
  LoggingInput: LoggingInput;
  TimeStamp: ResolverTypeWrapper<Scalars['TimeStamp']>;
  LoggingSource: LoggingSource;
  JSONObject: ResolverTypeWrapper<Scalars['JSONObject']>;
  LoggingSeverity: LoggingSeverity;
  BankIdAuthResponse: ResolverTypeWrapper<BankIdAuthResponse>;
  NorwegianBankIdAuthResponse: ResolverTypeWrapper<NorwegianBankIdAuthResponse>;
  DanishBankIdAuthResponse: ResolverTypeWrapper<DanishBankIdAuthResponse>;
  AddressChangeInput: AddressChangeInput;
  AddressHomeType: AddressHomeType;
  AddressOwnership: AddressOwnership;
  AddressHouseExtraBuilding: AddressHouseExtraBuilding;
  AddressChangeQuoteResult: ResolversTypes['AddressChangeQuoteSuccess'] | ResolversTypes['AddressChangeQuoteFailure'];
  AddressChangeQuoteSuccess: ResolverTypeWrapper<AddressChangeQuoteSuccess>;
  AddressChangeQuoteFailure: ResolverTypeWrapper<AddressChangeQuoteFailure>;
  Subscription: ResolverTypeWrapper<{}>;
  OfferEvent: ResolverTypeWrapper<OfferEvent>;
  OfferStatus: OfferStatus;
  SignEvent: ResolverTypeWrapper<SignEvent>;
  AuthEvent: ResolverTypeWrapper<AuthEvent>;
  AuthState: AuthState;
  ChatResponseBodyAudioInput: ChatResponseBodyAudioInput;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Query: {};
  Insurance: Omit<Insurance, 'extraBuildings'> & { extraBuildings?: Maybe<Array<ResolversParentTypes['ExtraBuilding']>> };
  String: Scalars['String'];
  InsuranceCost: InsuranceCost;
  MonetaryAmountV2: MonetaryAmountV2;
  LocalDate: Scalars['LocalDate'];
  Int: Scalars['Int'];
  Boolean: Scalars['Boolean'];
  PerilCategory: PerilCategory;
  Peril: Peril;
  ID: Scalars['ID'];
  ArrangedPerilCategories: ArrangedPerilCategories;
  Renewal: Renewal;
  PreviousInsurer: PreviousInsurer;
  ExtraBuilding: ResolversParentTypes['ExtraBuildingValue'];
  ExtraBuildingValue: ExtraBuildingValue;
  ExtraBuildingCore: ResolversParentTypes['ExtraBuildingValue'];
  Cashback: Cashback;
  SignStatus: SignStatus;
  CollectStatus: CollectStatus;
  Member: Member;
  Gif: Gif;
  File: File;
  Message: Omit<Message, 'body'> & { body: ResolversParentTypes['MessageBody'] };
  MessageBody: ResolversParentTypes['MessageBodySingleSelect'] | ResolversParentTypes['MessageBodyMultipleSelect'] | ResolversParentTypes['MessageBodyText'] | ResolversParentTypes['MessageBodyNumber'] | ResolversParentTypes['MessageBodyAudio'] | ResolversParentTypes['MessageBodyBankIdCollect'] | ResolversParentTypes['MessageBodyFile'] | ResolversParentTypes['MessageBodyParagraph'] | ResolversParentTypes['MessageBodyUndefined'];
  MessageBodySingleSelect: Omit<MessageBodySingleSelect, 'choices'> & { choices?: Maybe<Array<Maybe<ResolversParentTypes['MessageBodyChoices']>>> };
  MessageBodyCore: ResolversParentTypes['MessageBodySingleSelect'] | ResolversParentTypes['MessageBodyMultipleSelect'] | ResolversParentTypes['MessageBodyText'] | ResolversParentTypes['MessageBodyNumber'] | ResolversParentTypes['MessageBodyAudio'] | ResolversParentTypes['MessageBodyBankIdCollect'] | ResolversParentTypes['MessageBodyFile'] | ResolversParentTypes['MessageBodyParagraph'] | ResolversParentTypes['MessageBodyUndefined'];
  MessageBodyChoices: ResolversParentTypes['MessageBodyChoicesUndefined'] | ResolversParentTypes['MessageBodyChoicesSelection'] | ResolversParentTypes['MessageBodyChoicesLink'];
  MessageBodyChoicesUndefined: MessageBodyChoicesUndefined;
  MessageBodyChoicesCore: ResolversParentTypes['MessageBodyChoicesUndefined'] | ResolversParentTypes['MessageBodyChoicesSelection'] | ResolversParentTypes['MessageBodyChoicesLink'];
  MessageBodyChoicesSelection: MessageBodyChoicesSelection;
  MessageBodyChoicesLink: MessageBodyChoicesLink;
  MessageBodyMultipleSelect: Omit<MessageBodyMultipleSelect, 'choices'> & { choices?: Maybe<Array<Maybe<ResolversParentTypes['MessageBodyChoices']>>> };
  MessageBodyText: MessageBodyText;
  MessageBodyNumber: MessageBodyNumber;
  MessageBodyAudio: MessageBodyAudio;
  MessageBodyBankIdCollect: MessageBodyBankIdCollect;
  MessageBodyFile: MessageBodyFile;
  MessageBodyParagraph: MessageBodyParagraph;
  MessageBodyUndefined: MessageBodyUndefined;
  MessageHeader: MessageHeader;
  ChatResponse: Omit<ChatResponse, 'body'> & { body: ResolversParentTypes['MessageBody'] };
  ChatState: ChatState;
  Avatar: Avatar;
  Object: Scalars['Object'];
  ChatAction: ChatAction;
  URL: Scalars['URL'];
  Geo: Geo;
  AngelStory: AngelStory;
  ContractBundle: ContractBundle;
  Contract: Omit<Contract, 'status' | 'currentAgreement'> & { status: ResolversParentTypes['ContractStatus'], currentAgreement: ResolversParentTypes['Agreement'] };
  ContractStatus: ResolversParentTypes['PendingStatus'] | ResolversParentTypes['ActiveInFutureStatus'] | ResolversParentTypes['ActiveStatus'] | ResolversParentTypes['ActiveInFutureAndTerminatedInFutureStatus'] | ResolversParentTypes['TerminatedInFutureStatus'] | ResolversParentTypes['TerminatedTodayStatus'] | ResolversParentTypes['TerminatedStatus'];
  PendingStatus: PendingStatus;
  ActiveInFutureStatus: ActiveInFutureStatus;
  ActiveStatus: ActiveStatus;
  UpcomingAgreementChange: Omit<UpcomingAgreementChange, 'newAgreement'> & { newAgreement: ResolversParentTypes['Agreement'] };
  Agreement: ResolversParentTypes['SwedishApartmentAgreement'] | ResolversParentTypes['SwedishHouseAgreement'] | ResolversParentTypes['NorwegianHomeContentAgreement'] | ResolversParentTypes['NorwegianTravelAgreement'] | ResolversParentTypes['DanishHomeContentAgreement'] | ResolversParentTypes['DanishAccidentAgreement'] | ResolversParentTypes['DanishTravelAgreement'];
  SwedishApartmentAgreement: SwedishApartmentAgreement;
  AgreementCore: ResolversParentTypes['SwedishApartmentAgreement'] | ResolversParentTypes['SwedishHouseAgreement'] | ResolversParentTypes['NorwegianHomeContentAgreement'] | ResolversParentTypes['NorwegianTravelAgreement'] | ResolversParentTypes['DanishHomeContentAgreement'] | ResolversParentTypes['DanishAccidentAgreement'] | ResolversParentTypes['DanishTravelAgreement'];
  Address: Address;
  SwedishHouseAgreement: Omit<SwedishHouseAgreement, 'extraBuildings'> & { extraBuildings: Array<Maybe<ResolversParentTypes['ExtraBuilding']>> };
  NorwegianHomeContentAgreement: NorwegianHomeContentAgreement;
  NorwegianTravelAgreement: NorwegianTravelAgreement;
  DanishHomeContentAgreement: DanishHomeContentAgreement;
  DanishAccidentAgreement: DanishAccidentAgreement;
  DanishTravelAgreement: DanishTravelAgreement;
  ActiveInFutureAndTerminatedInFutureStatus: ActiveInFutureAndTerminatedInFutureStatus;
  TerminatedInFutureStatus: TerminatedInFutureStatus;
  TerminatedTodayStatus: TerminatedTodayStatus;
  TerminatedStatus: TerminatedStatus;
  UpcomingRenewal: UpcomingRenewal;
  Instant: Scalars['Instant'];
  ContractBundleAngelStories: ContractBundleAngelStories;
  SelfChangeEligibility: SelfChangeEligibility;
  Mutation: {};
  CampaignInput: CampaignInput;
  UUID: Scalars['UUID'];
  SessionInformation: SessionInformation;
  OfferInput: OfferInput;
  SignInput: SignInput;
  BankIdSignResponse: BankIdSignResponse;
  Upload: Scalars['Upload'];
  ChatResponseTextInput: ChatResponseTextInput;
  ChatResponseBodyTextInput: ChatResponseBodyTextInput;
  ChatResponseSingleSelectInput: ChatResponseSingleSelectInput;
  ChatResponseBodySingleSelectInput: ChatResponseBodySingleSelectInput;
  ChatResponseFileInput: ChatResponseFileInput;
  ChatResponseBodyFileInput: ChatResponseBodyFileInput;
  ChatResponseAudioInput: ChatResponseAudioInput;
  TriggerClaimChatInput: TriggerClaimChatInput;
  LoggingInput: LoggingInput;
  TimeStamp: Scalars['TimeStamp'];
  JSONObject: Scalars['JSONObject'];
  BankIdAuthResponse: BankIdAuthResponse;
  NorwegianBankIdAuthResponse: NorwegianBankIdAuthResponse;
  DanishBankIdAuthResponse: DanishBankIdAuthResponse;
  AddressChangeInput: AddressChangeInput;
  AddressHouseExtraBuilding: AddressHouseExtraBuilding;
  AddressChangeQuoteResult: ResolversParentTypes['AddressChangeQuoteSuccess'] | ResolversParentTypes['AddressChangeQuoteFailure'];
  AddressChangeQuoteSuccess: AddressChangeQuoteSuccess;
  AddressChangeQuoteFailure: AddressChangeQuoteFailure;
  Subscription: {};
  OfferEvent: OfferEvent;
  SignEvent: SignEvent;
  AuthEvent: AuthEvent;
  ChatResponseBodyAudioInput: ChatResponseBodyAudioInput;
};

export type ActiveInFutureAndTerminatedInFutureStatusResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ActiveInFutureAndTerminatedInFutureStatus'] = ResolversParentTypes['ActiveInFutureAndTerminatedInFutureStatus']> = {
  futureInception?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
  futureTermination?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ActiveInFutureStatusResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ActiveInFutureStatus'] = ResolversParentTypes['ActiveInFutureStatus']> = {
  futureInception?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ActiveStatusResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ActiveStatus'] = ResolversParentTypes['ActiveStatus']> = {
  pastInception?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
  upcomingAgreementChange?: Resolver<Maybe<ResolversTypes['UpcomingAgreementChange']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AddressResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Address'] = ResolversParentTypes['Address']> = {
  street?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  postalCode?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  city?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  apartment?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  floor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AddressChangeQuoteFailureResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AddressChangeQuoteFailure'] = ResolversParentTypes['AddressChangeQuoteFailure']> = {
  breachedUnderwritingGuidelines?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AddressChangeQuoteResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AddressChangeQuoteResult'] = ResolversParentTypes['AddressChangeQuoteResult']> = {
  __resolveType: TypeResolveFn<'AddressChangeQuoteSuccess' | 'AddressChangeQuoteFailure', ParentType, ContextType>;
};

export type AddressChangeQuoteSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AddressChangeQuoteSuccess'] = ResolversParentTypes['AddressChangeQuoteSuccess']> = {
  quoteIds?: Resolver<Array<ResolversTypes['ID']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AgreementResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Agreement'] = ResolversParentTypes['Agreement']> = {
  __resolveType: TypeResolveFn<'SwedishApartmentAgreement' | 'SwedishHouseAgreement' | 'NorwegianHomeContentAgreement' | 'NorwegianTravelAgreement' | 'DanishHomeContentAgreement' | 'DanishAccidentAgreement' | 'DanishTravelAgreement', ParentType, ContextType>;
};

export type AgreementCoreResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AgreementCore'] = ResolversParentTypes['AgreementCore']> = {
  __resolveType: TypeResolveFn<'SwedishApartmentAgreement' | 'SwedishHouseAgreement' | 'NorwegianHomeContentAgreement' | 'NorwegianTravelAgreement' | 'DanishHomeContentAgreement' | 'DanishAccidentAgreement' | 'DanishTravelAgreement', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['AgreementStatus'], ParentType, ContextType>;
  activeFrom?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
  activeTo?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
  premium?: Resolver<ResolversTypes['MonetaryAmountV2'], ParentType, ContextType>;
  certificateUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
};

export type AngelStoryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AngelStory'] = ResolversParentTypes['AngelStory']> = {
  content?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ArrangedPerilCategoriesResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ArrangedPerilCategories'] = ResolversParentTypes['ArrangedPerilCategories']> = {
  me?: Resolver<Maybe<ResolversTypes['PerilCategory']>, ParentType, ContextType>;
  home?: Resolver<Maybe<ResolversTypes['PerilCategory']>, ParentType, ContextType>;
  stuff?: Resolver<Maybe<ResolversTypes['PerilCategory']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AuthEventResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AuthEvent'] = ResolversParentTypes['AuthEvent']> = {
  status?: Resolver<Maybe<ResolversTypes['AuthState']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AvatarResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Avatar'] = ResolversParentTypes['Avatar']> = {
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  URL?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  width?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  height?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  duration?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  data?: Resolver<Maybe<ResolversTypes['Object']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BankIdAuthResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['BankIdAuthResponse'] = ResolversParentTypes['BankIdAuthResponse']> = {
  autoStartToken?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BankIdSignResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['BankIdSignResponse'] = ResolversParentTypes['BankIdSignResponse']> = {
  autoStartToken?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  redirectUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CashbackResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Cashback'] = ResolversParentTypes['Cashback']> = {
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  imageUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  selectedUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  paragraph?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ChatActionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ChatAction'] = ResolversParentTypes['ChatAction']> = {
  text?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  triggerUrl?: Resolver<Maybe<ResolversTypes['URL']>, ParentType, ContextType>;
  enabled?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ChatResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ChatResponse'] = ResolversParentTypes['ChatResponse']> = {
  globalId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  body?: Resolver<ResolversTypes['MessageBody'], ParentType, ContextType>;
  header?: Resolver<ResolversTypes['MessageHeader'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ChatStateResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ChatState'] = ResolversParentTypes['ChatState']> = {
  ongoingClaim?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  showOfferScreen?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  onboardingDone?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CollectStatusResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CollectStatus'] = ResolversParentTypes['CollectStatus']> = {
  status?: Resolver<Maybe<ResolversTypes['BankIdStatus']>, ParentType, ContextType>;
  code?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ContractResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Contract'] = ResolversParentTypes['Contract']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  holderMember?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  typeOfContract?: Resolver<ResolversTypes['TypeOfContract'], ParentType, ContextType>;
  switchedFromInsuranceProvider?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['ContractStatus'], ParentType, ContextType>;
  displayName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  currentAgreement?: Resolver<ResolversTypes['Agreement'], ParentType, ContextType>;
  inception?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
  termination?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
  upcomingRenewal?: Resolver<Maybe<ResolversTypes['UpcomingRenewal']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Instant'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ContractBundleResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ContractBundle'] = ResolversParentTypes['ContractBundle']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  contracts?: Resolver<Array<ResolversTypes['Contract']>, ParentType, ContextType>;
  angelStories?: Resolver<ResolversTypes['ContractBundleAngelStories'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ContractBundleAngelStoriesResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ContractBundleAngelStories'] = ResolversParentTypes['ContractBundleAngelStories']> = {
  addressChange?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ContractStatusResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ContractStatus'] = ResolversParentTypes['ContractStatus']> = {
  __resolveType: TypeResolveFn<'PendingStatus' | 'ActiveInFutureStatus' | 'ActiveStatus' | 'ActiveInFutureAndTerminatedInFutureStatus' | 'TerminatedInFutureStatus' | 'TerminatedTodayStatus' | 'TerminatedStatus', ParentType, ContextType>;
};

export type DanishAccidentAgreementResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DanishAccidentAgreement'] = ResolversParentTypes['DanishAccidentAgreement']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  activeFrom?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
  activeTo?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
  premium?: Resolver<ResolversTypes['MonetaryAmountV2'], ParentType, ContextType>;
  certificateUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['AgreementStatus'], ParentType, ContextType>;
  address?: Resolver<ResolversTypes['Address'], ParentType, ContextType>;
  numberCoInsured?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['DanishAccidentLineOfBusiness']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DanishBankIdAuthResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DanishBankIdAuthResponse'] = ResolversParentTypes['DanishBankIdAuthResponse']> = {
  redirectUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DanishHomeContentAgreementResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DanishHomeContentAgreement'] = ResolversParentTypes['DanishHomeContentAgreement']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  activeFrom?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
  activeTo?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
  premium?: Resolver<ResolversTypes['MonetaryAmountV2'], ParentType, ContextType>;
  certificateUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['AgreementStatus'], ParentType, ContextType>;
  address?: Resolver<ResolversTypes['Address'], ParentType, ContextType>;
  numberCoInsured?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  squareMeters?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['DanishHomeContentLineOfBusiness']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DanishTravelAgreementResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DanishTravelAgreement'] = ResolversParentTypes['DanishTravelAgreement']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  activeFrom?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
  activeTo?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
  premium?: Resolver<ResolversTypes['MonetaryAmountV2'], ParentType, ContextType>;
  certificateUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['AgreementStatus'], ParentType, ContextType>;
  address?: Resolver<ResolversTypes['Address'], ParentType, ContextType>;
  numberCoInsured?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['DanishTravelLineOfBusiness']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ExtraBuildingResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ExtraBuilding'] = ResolversParentTypes['ExtraBuilding']> = {
  __resolveType: TypeResolveFn<'ExtraBuildingValue', ParentType, ContextType>;
};

export type ExtraBuildingCoreResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ExtraBuildingCore'] = ResolversParentTypes['ExtraBuildingCore']> = {
  __resolveType: TypeResolveFn<'ExtraBuildingValue', ParentType, ContextType>;
  type?: Resolver<ResolversTypes['ExtraBuildingType'], ParentType, ContextType>;
  area?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  displayName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  hasWaterConnected?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
};

export type ExtraBuildingValueResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ExtraBuildingValue'] = ResolversParentTypes['ExtraBuildingValue']> = {
  type?: Resolver<ResolversTypes['ExtraBuildingType'], ParentType, ContextType>;
  area?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  displayName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  hasWaterConnected?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FileResolvers<ContextType = Context, ParentType extends ResolversParentTypes['File'] = ResolversParentTypes['File']> = {
  signedUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  bucket?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GeoResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Geo'] = ResolversParentTypes['Geo']> = {
  countryISOCode?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GifResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Gif'] = ResolversParentTypes['Gif']> = {
  url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface InstantScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Instant'], any> {
  name: 'Instant';
}

export type InsuranceResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Insurance'] = ResolversParentTypes['Insurance']> = {
  address?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  postalNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  cost?: Resolver<Maybe<ResolversTypes['InsuranceCost']>, ParentType, ContextType>;
  personsInHousehold?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  certificateUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['InsuranceStatus'], ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['InsuranceType']>, ParentType, ContextType>;
  activeFrom?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
  insuredAtOtherCompany?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  presaleInformationUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  policyUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  currentInsurerName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  livingSpace?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  perilCategories?: Resolver<Maybe<Array<Maybe<ResolversTypes['PerilCategory']>>>, ParentType, ContextType>;
  monthlyCost?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  safetyIncreasers?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  arrangedPerilCategories?: Resolver<ResolversTypes['ArrangedPerilCategories'], ParentType, ContextType>;
  renewal?: Resolver<Maybe<ResolversTypes['Renewal']>, ParentType, ContextType>;
  previousInsurer?: Resolver<Maybe<ResolversTypes['PreviousInsurer']>, ParentType, ContextType>;
  ancillaryArea?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  yearOfConstruction?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  numberOfBathrooms?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  extraBuildings?: Resolver<Maybe<Array<ResolversTypes['ExtraBuilding']>>, ParentType, ContextType>;
  isSubleted?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InsuranceCostResolvers<ContextType = Context, ParentType extends ResolversParentTypes['InsuranceCost'] = ResolversParentTypes['InsuranceCost']> = {
  monthlyGross?: Resolver<ResolversTypes['MonetaryAmountV2'], ParentType, ContextType>;
  monthlyDiscount?: Resolver<ResolversTypes['MonetaryAmountV2'], ParentType, ContextType>;
  monthlyNet?: Resolver<ResolversTypes['MonetaryAmountV2'], ParentType, ContextType>;
  freeUntil?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface JsonObjectScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSONObject'], any> {
  name: 'JSONObject';
}

export interface LocalDateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['LocalDate'], any> {
  name: 'LocalDate';
}

export type MemberResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Member'] = ResolversParentTypes['Member']> = {
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  firstName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  lastName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  phoneNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  acceptLanguage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  features?: Resolver<Array<ResolversTypes['Feature']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MessageResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Message'] = ResolversParentTypes['Message']> = {
  globalId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  body?: Resolver<ResolversTypes['MessageBody'], ParentType, ContextType>;
  header?: Resolver<ResolversTypes['MessageHeader'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MessageBodyResolvers<ContextType = Context, ParentType extends ResolversParentTypes['MessageBody'] = ResolversParentTypes['MessageBody']> = {
  __resolveType: TypeResolveFn<'MessageBodySingleSelect' | 'MessageBodyMultipleSelect' | 'MessageBodyText' | 'MessageBodyNumber' | 'MessageBodyAudio' | 'MessageBodyBankIdCollect' | 'MessageBodyFile' | 'MessageBodyParagraph' | 'MessageBodyUndefined', ParentType, ContextType>;
};

export type MessageBodyAudioResolvers<ContextType = Context, ParentType extends ResolversParentTypes['MessageBodyAudio'] = ResolversParentTypes['MessageBodyAudio']> = {
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  text?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MessageBodyBankIdCollectResolvers<ContextType = Context, ParentType extends ResolversParentTypes['MessageBodyBankIdCollect'] = ResolversParentTypes['MessageBodyBankIdCollect']> = {
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  text?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  referenceId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MessageBodyChoicesResolvers<ContextType = Context, ParentType extends ResolversParentTypes['MessageBodyChoices'] = ResolversParentTypes['MessageBodyChoices']> = {
  __resolveType: TypeResolveFn<'MessageBodyChoicesUndefined' | 'MessageBodyChoicesSelection' | 'MessageBodyChoicesLink', ParentType, ContextType>;
};

export type MessageBodyChoicesCoreResolvers<ContextType = Context, ParentType extends ResolversParentTypes['MessageBodyChoicesCore'] = ResolversParentTypes['MessageBodyChoicesCore']> = {
  __resolveType: TypeResolveFn<'MessageBodyChoicesUndefined' | 'MessageBodyChoicesSelection' | 'MessageBodyChoicesLink', ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  text?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  selected?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
};

export type MessageBodyChoicesLinkResolvers<ContextType = Context, ParentType extends ResolversParentTypes['MessageBodyChoicesLink'] = ResolversParentTypes['MessageBodyChoicesLink']> = {
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  text?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  selected?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  view?: Resolver<Maybe<ResolversTypes['MessageBodyChoicesLinkView']>, ParentType, ContextType>;
  appUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  webUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MessageBodyChoicesSelectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['MessageBodyChoicesSelection'] = ResolversParentTypes['MessageBodyChoicesSelection']> = {
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  text?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  selected?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  clearable?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MessageBodyChoicesUndefinedResolvers<ContextType = Context, ParentType extends ResolversParentTypes['MessageBodyChoicesUndefined'] = ResolversParentTypes['MessageBodyChoicesUndefined']> = {
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  text?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  selected?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MessageBodyCoreResolvers<ContextType = Context, ParentType extends ResolversParentTypes['MessageBodyCore'] = ResolversParentTypes['MessageBodyCore']> = {
  __resolveType: TypeResolveFn<'MessageBodySingleSelect' | 'MessageBodyMultipleSelect' | 'MessageBodyText' | 'MessageBodyNumber' | 'MessageBodyAudio' | 'MessageBodyBankIdCollect' | 'MessageBodyFile' | 'MessageBodyParagraph' | 'MessageBodyUndefined', ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  text?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type MessageBodyFileResolvers<ContextType = Context, ParentType extends ResolversParentTypes['MessageBodyFile'] = ResolversParentTypes['MessageBodyFile']> = {
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  text?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  key?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  mimeType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  file?: Resolver<ResolversTypes['File'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MessageBodyMultipleSelectResolvers<ContextType = Context, ParentType extends ResolversParentTypes['MessageBodyMultipleSelect'] = ResolversParentTypes['MessageBodyMultipleSelect']> = {
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  text?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  choices?: Resolver<Maybe<Array<Maybe<ResolversTypes['MessageBodyChoices']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MessageBodyNumberResolvers<ContextType = Context, ParentType extends ResolversParentTypes['MessageBodyNumber'] = ResolversParentTypes['MessageBodyNumber']> = {
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  text?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  placeholder?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  keyboard?: Resolver<Maybe<ResolversTypes['KeyboardType']>, ParentType, ContextType>;
  textContentType?: Resolver<Maybe<ResolversTypes['TextContentType']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MessageBodyParagraphResolvers<ContextType = Context, ParentType extends ResolversParentTypes['MessageBodyParagraph'] = ResolversParentTypes['MessageBodyParagraph']> = {
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  text?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MessageBodySingleSelectResolvers<ContextType = Context, ParentType extends ResolversParentTypes['MessageBodySingleSelect'] = ResolversParentTypes['MessageBodySingleSelect']> = {
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  text?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  choices?: Resolver<Maybe<Array<Maybe<ResolversTypes['MessageBodyChoices']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MessageBodyTextResolvers<ContextType = Context, ParentType extends ResolversParentTypes['MessageBodyText'] = ResolversParentTypes['MessageBodyText']> = {
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  text?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  placeholder?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  keyboard?: Resolver<Maybe<ResolversTypes['KeyboardType']>, ParentType, ContextType>;
  textContentType?: Resolver<Maybe<ResolversTypes['TextContentType']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MessageBodyUndefinedResolvers<ContextType = Context, ParentType extends ResolversParentTypes['MessageBodyUndefined'] = ResolversParentTypes['MessageBodyUndefined']> = {
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  text?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MessageHeaderResolvers<ContextType = Context, ParentType extends ResolversParentTypes['MessageHeader'] = ResolversParentTypes['MessageHeader']> = {
  messageId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  fromMyself?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  timeStamp?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  richTextChatCompatible?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  editAllowed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  shouldRequestPushNotifications?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  pollingInterval?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  loadingIndicator?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  markedAsRead?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  statusMessage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MonetaryAmountV2Resolvers<ContextType = Context, ParentType extends ResolversParentTypes['MonetaryAmountV2'] = ResolversParentTypes['MonetaryAmountV2']> = {
  amount?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  currency?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  logout?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  createSession?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationCreateSessionArgs, never>>;
  createSessionV2?: Resolver<Maybe<ResolversTypes['SessionInformation']>, ParentType, ContextType>;
  createOffer?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationCreateOfferArgs, 'details'>>;
  signOffer?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationSignOfferArgs, 'details'>>;
  signOfferV2?: Resolver<ResolversTypes['BankIdSignResponse'], ParentType, ContextType, RequireFields<MutationSignOfferV2Args, never>>;
  uploadFile?: Resolver<ResolversTypes['File'], ParentType, ContextType, RequireFields<MutationUploadFileArgs, 'file'>>;
  uploadFiles?: Resolver<Maybe<Array<ResolversTypes['File']>>, ParentType, ContextType, RequireFields<MutationUploadFilesArgs, 'files'>>;
  selectCashbackOption?: Resolver<ResolversTypes['Cashback'], ParentType, ContextType, RequireFields<MutationSelectCashbackOptionArgs, 'id'>>;
  offerClosed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  startDirectDebitRegistration?: Resolver<ResolversTypes['URL'], ParentType, ContextType>;
  sendChatTextResponse?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationSendChatTextResponseArgs, 'input'>>;
  sendChatSingleSelectResponse?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationSendChatSingleSelectResponseArgs, 'input'>>;
  sendChatFileResponse?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationSendChatFileResponseArgs, 'input'>>;
  sendChatAudioResponse?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationSendChatAudioResponseArgs, 'input'>>;
  resetConversation?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  editLastResponse?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  updateEmail?: Resolver<ResolversTypes['Member'], ParentType, ContextType, RequireFields<MutationUpdateEmailArgs, 'input'>>;
  updatePhoneNumber?: Resolver<ResolversTypes['Member'], ParentType, ContextType, RequireFields<MutationUpdatePhoneNumberArgs, 'input'>>;
  registerPushToken?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationRegisterPushTokenArgs, 'pushToken'>>;
  triggerFreeTextChat?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  triggerClaimChat?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationTriggerClaimChatArgs, 'input'>>;
  triggerCallMeChat?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  emailSign?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  markMessageAsRead?: Resolver<ResolversTypes['Message'], ParentType, ContextType, RequireFields<MutationMarkMessageAsReadArgs, 'globalId'>>;
  log?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationLogArgs, 'input'>>;
  bankIdAuth?: Resolver<ResolversTypes['BankIdAuthResponse'], ParentType, ContextType>;
  swedishBankIdAuth?: Resolver<ResolversTypes['BankIdAuthResponse'], ParentType, ContextType>;
  norwegianBankIdAuth?: Resolver<ResolversTypes['NorwegianBankIdAuthResponse'], ParentType, ContextType, RequireFields<MutationNorwegianBankIdAuthArgs, never>>;
  danishBankIdAuth?: Resolver<ResolversTypes['DanishBankIdAuthResponse'], ParentType, ContextType, RequireFields<MutationDanishBankIdAuthArgs, 'personalNumber'>>;
  registerBranchCampaign?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationRegisterBranchCampaignArgs, 'campaign'>>;
  updateLanguage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationUpdateLanguageArgs, 'input'>>;
  updatePickedLocale?: Resolver<ResolversTypes['Member'], ParentType, ContextType, RequireFields<MutationUpdatePickedLocaleArgs, 'pickedLocale'>>;
  createAddressChangeQuotes?: Resolver<ResolversTypes['AddressChangeQuoteResult'], ParentType, ContextType, RequireFields<MutationCreateAddressChangeQuotesArgs, 'input'>>;
};

export type NorwegianBankIdAuthResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['NorwegianBankIdAuthResponse'] = ResolversParentTypes['NorwegianBankIdAuthResponse']> = {
  redirectUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NorwegianHomeContentAgreementResolvers<ContextType = Context, ParentType extends ResolversParentTypes['NorwegianHomeContentAgreement'] = ResolversParentTypes['NorwegianHomeContentAgreement']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  activeFrom?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
  activeTo?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
  premium?: Resolver<ResolversTypes['MonetaryAmountV2'], ParentType, ContextType>;
  certificateUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['AgreementStatus'], ParentType, ContextType>;
  address?: Resolver<ResolversTypes['Address'], ParentType, ContextType>;
  numberCoInsured?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  squareMeters?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['NorwegianHomeContentLineOfBusiness']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NorwegianTravelAgreementResolvers<ContextType = Context, ParentType extends ResolversParentTypes['NorwegianTravelAgreement'] = ResolversParentTypes['NorwegianTravelAgreement']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  activeFrom?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
  activeTo?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
  premium?: Resolver<ResolversTypes['MonetaryAmountV2'], ParentType, ContextType>;
  certificateUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['AgreementStatus'], ParentType, ContextType>;
  numberCoInsured?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['NorwegianTravelLineOfBusiness']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface ObjectScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Object'], any> {
  name: 'Object';
}

export type OfferEventResolvers<ContextType = Context, ParentType extends ResolversParentTypes['OfferEvent'] = ResolversParentTypes['OfferEvent']> = {
  status?: Resolver<ResolversTypes['OfferStatus'], ParentType, ContextType>;
  insurance?: Resolver<Maybe<ResolversTypes['Insurance']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PendingStatusResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PendingStatus'] = ResolversParentTypes['PendingStatus']> = {
  pendingSince?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PerilResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Peril'] = ResolversParentTypes['Peril']> = {
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  imageUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PerilCategoryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PerilCategory'] = ResolversParentTypes['PerilCategory']> = {
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  iconUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  perils?: Resolver<Maybe<Array<Maybe<ResolversTypes['Peril']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PreviousInsurerResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PreviousInsurer'] = ResolversParentTypes['PreviousInsurer']> = {
  displayName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  switchable?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  insurance?: Resolver<ResolversTypes['Insurance'], ParentType, ContextType>;
  cashback?: Resolver<Maybe<ResolversTypes['Cashback']>, ParentType, ContextType, RequireFields<QueryCashbackArgs, never>>;
  cashbackOptions?: Resolver<Array<Maybe<ResolversTypes['Cashback']>>, ParentType, ContextType, RequireFields<QueryCashbackOptionsArgs, never>>;
  signStatus?: Resolver<Maybe<ResolversTypes['SignStatus']>, ParentType, ContextType>;
  member?: Resolver<ResolversTypes['Member'], ParentType, ContextType>;
  gifs?: Resolver<Array<Maybe<ResolversTypes['Gif']>>, ParentType, ContextType, RequireFields<QueryGifsArgs, 'query'>>;
  file?: Resolver<ResolversTypes['File'], ParentType, ContextType, RequireFields<QueryFileArgs, 'key'>>;
  messages?: Resolver<Array<Maybe<ResolversTypes['Message']>>, ParentType, ContextType>;
  currentChatResponse?: Resolver<Maybe<ResolversTypes['ChatResponse']>, ParentType, ContextType>;
  chatState?: Resolver<ResolversTypes['ChatState'], ParentType, ContextType>;
  avatars?: Resolver<Maybe<Array<Maybe<ResolversTypes['Avatar']>>>, ParentType, ContextType>;
  chatActions?: Resolver<Maybe<Array<Maybe<ResolversTypes['ChatAction']>>>, ParentType, ContextType>;
  geo?: Resolver<ResolversTypes['Geo'], ParentType, ContextType>;
  angelStory?: Resolver<Maybe<ResolversTypes['AngelStory']>, ParentType, ContextType, RequireFields<QueryAngelStoryArgs, 'name'>>;
  activeContractBundles?: Resolver<Array<ResolversTypes['ContractBundle']>, ParentType, ContextType>;
  contracts?: Resolver<Array<ResolversTypes['Contract']>, ParentType, ContextType>;
  hasContract?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  selfChangeEligibility?: Resolver<ResolversTypes['SelfChangeEligibility'], ParentType, ContextType>;
  availableLocales?: Resolver<Array<ResolversTypes['Locale']>, ParentType, ContextType>;
};

export type RenewalResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Renewal'] = ResolversParentTypes['Renewal']> = {
  certificateUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  date?: Resolver<ResolversTypes['LocalDate'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SelfChangeEligibilityResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SelfChangeEligibility'] = ResolversParentTypes['SelfChangeEligibility']> = {
  blockers?: Resolver<Array<ResolversTypes['SelfChangeBlocker']>, ParentType, ContextType>;
  embarkStoryId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  addressChangeEmbarkStoryId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SessionInformationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SessionInformation'] = ResolversParentTypes['SessionInformation']> = {
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  memberId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SignEventResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SignEvent'] = ResolversParentTypes['SignEvent']> = {
  status?: Resolver<Maybe<ResolversTypes['SignStatus']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SignStatusResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SignStatus'] = ResolversParentTypes['SignStatus']> = {
  collectStatus?: Resolver<Maybe<ResolversTypes['CollectStatus']>, ParentType, ContextType>;
  signState?: Resolver<Maybe<ResolversTypes['SignState']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SubscriptionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
  offer?: SubscriptionResolver<Maybe<ResolversTypes['OfferEvent']>, "offer", ParentType, ContextType>;
  signStatus?: SubscriptionResolver<Maybe<ResolversTypes['SignEvent']>, "signStatus", ParentType, ContextType>;
  message?: SubscriptionResolver<ResolversTypes['Message'], "message", ParentType, ContextType>;
  currentChatResponse?: SubscriptionResolver<Maybe<ResolversTypes['ChatResponse']>, "currentChatResponse", ParentType, ContextType, RequireFields<SubscriptionCurrentChatResponseArgs, 'mostRecentTimestamp'>>;
  chatState?: SubscriptionResolver<ResolversTypes['ChatState'], "chatState", ParentType, ContextType, RequireFields<SubscriptionChatStateArgs, 'mostRecentTimestamp'>>;
  authStatus?: SubscriptionResolver<Maybe<ResolversTypes['AuthEvent']>, "authStatus", ParentType, ContextType>;
};

export type SwedishApartmentAgreementResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SwedishApartmentAgreement'] = ResolversParentTypes['SwedishApartmentAgreement']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  activeFrom?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
  activeTo?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
  premium?: Resolver<ResolversTypes['MonetaryAmountV2'], ParentType, ContextType>;
  certificateUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['AgreementStatus'], ParentType, ContextType>;
  address?: Resolver<ResolversTypes['Address'], ParentType, ContextType>;
  numberCoInsured?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  squareMeters?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['SwedishApartmentLineOfBusiness'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SwedishHouseAgreementResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SwedishHouseAgreement'] = ResolversParentTypes['SwedishHouseAgreement']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  activeFrom?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
  activeTo?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
  premium?: Resolver<ResolversTypes['MonetaryAmountV2'], ParentType, ContextType>;
  certificateUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['AgreementStatus'], ParentType, ContextType>;
  address?: Resolver<ResolversTypes['Address'], ParentType, ContextType>;
  numberCoInsured?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  squareMeters?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  ancillaryArea?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  yearOfConstruction?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  numberOfBathrooms?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  extraBuildings?: Resolver<Array<Maybe<ResolversTypes['ExtraBuilding']>>, ParentType, ContextType>;
  isSubleted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TerminatedInFutureStatusResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TerminatedInFutureStatus'] = ResolversParentTypes['TerminatedInFutureStatus']> = {
  futureTermination?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
  upcomingAgreementChange?: Resolver<Maybe<ResolversTypes['UpcomingAgreementChange']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TerminatedStatusResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TerminatedStatus'] = ResolversParentTypes['TerminatedStatus']> = {
  termination?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TerminatedTodayStatusResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TerminatedTodayStatus'] = ResolversParentTypes['TerminatedTodayStatus']> = {
  today?: Resolver<Maybe<ResolversTypes['LocalDate']>, ParentType, ContextType>;
  upcomingAgreementChange?: Resolver<Maybe<ResolversTypes['UpcomingAgreementChange']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface TimeStampScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['TimeStamp'], any> {
  name: 'TimeStamp';
}

export type UpcomingAgreementChangeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpcomingAgreementChange'] = ResolversParentTypes['UpcomingAgreementChange']> = {
  newAgreement?: Resolver<ResolversTypes['Agreement'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpcomingRenewalResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpcomingRenewal'] = ResolversParentTypes['UpcomingRenewal']> = {
  renewalDate?: Resolver<ResolversTypes['LocalDate'], ParentType, ContextType>;
  draftCertificateUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface UploadScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Upload'], any> {
  name: 'Upload';
}

export interface UrlScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['URL'], any> {
  name: 'URL';
}

export interface UuidScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['UUID'], any> {
  name: 'UUID';
}

export type Resolvers<ContextType = Context> = {
  ActiveInFutureAndTerminatedInFutureStatus?: ActiveInFutureAndTerminatedInFutureStatusResolvers<ContextType>;
  ActiveInFutureStatus?: ActiveInFutureStatusResolvers<ContextType>;
  ActiveStatus?: ActiveStatusResolvers<ContextType>;
  Address?: AddressResolvers<ContextType>;
  AddressChangeQuoteFailure?: AddressChangeQuoteFailureResolvers<ContextType>;
  AddressChangeQuoteResult?: AddressChangeQuoteResultResolvers<ContextType>;
  AddressChangeQuoteSuccess?: AddressChangeQuoteSuccessResolvers<ContextType>;
  Agreement?: AgreementResolvers<ContextType>;
  AgreementCore?: AgreementCoreResolvers<ContextType>;
  AngelStory?: AngelStoryResolvers<ContextType>;
  ArrangedPerilCategories?: ArrangedPerilCategoriesResolvers<ContextType>;
  AuthEvent?: AuthEventResolvers<ContextType>;
  Avatar?: AvatarResolvers<ContextType>;
  BankIdAuthResponse?: BankIdAuthResponseResolvers<ContextType>;
  BankIdSignResponse?: BankIdSignResponseResolvers<ContextType>;
  Cashback?: CashbackResolvers<ContextType>;
  ChatAction?: ChatActionResolvers<ContextType>;
  ChatResponse?: ChatResponseResolvers<ContextType>;
  ChatState?: ChatStateResolvers<ContextType>;
  CollectStatus?: CollectStatusResolvers<ContextType>;
  Contract?: ContractResolvers<ContextType>;
  ContractBundle?: ContractBundleResolvers<ContextType>;
  ContractBundleAngelStories?: ContractBundleAngelStoriesResolvers<ContextType>;
  ContractStatus?: ContractStatusResolvers<ContextType>;
  DanishAccidentAgreement?: DanishAccidentAgreementResolvers<ContextType>;
  DanishBankIdAuthResponse?: DanishBankIdAuthResponseResolvers<ContextType>;
  DanishHomeContentAgreement?: DanishHomeContentAgreementResolvers<ContextType>;
  DanishTravelAgreement?: DanishTravelAgreementResolvers<ContextType>;
  ExtraBuilding?: ExtraBuildingResolvers<ContextType>;
  ExtraBuildingCore?: ExtraBuildingCoreResolvers<ContextType>;
  ExtraBuildingValue?: ExtraBuildingValueResolvers<ContextType>;
  File?: FileResolvers<ContextType>;
  Geo?: GeoResolvers<ContextType>;
  Gif?: GifResolvers<ContextType>;
  Instant?: GraphQLScalarType;
  Insurance?: InsuranceResolvers<ContextType>;
  InsuranceCost?: InsuranceCostResolvers<ContextType>;
  JSONObject?: GraphQLScalarType;
  LocalDate?: GraphQLScalarType;
  Member?: MemberResolvers<ContextType>;
  Message?: MessageResolvers<ContextType>;
  MessageBody?: MessageBodyResolvers<ContextType>;
  MessageBodyAudio?: MessageBodyAudioResolvers<ContextType>;
  MessageBodyBankIdCollect?: MessageBodyBankIdCollectResolvers<ContextType>;
  MessageBodyChoices?: MessageBodyChoicesResolvers<ContextType>;
  MessageBodyChoicesCore?: MessageBodyChoicesCoreResolvers<ContextType>;
  MessageBodyChoicesLink?: MessageBodyChoicesLinkResolvers<ContextType>;
  MessageBodyChoicesSelection?: MessageBodyChoicesSelectionResolvers<ContextType>;
  MessageBodyChoicesUndefined?: MessageBodyChoicesUndefinedResolvers<ContextType>;
  MessageBodyCore?: MessageBodyCoreResolvers<ContextType>;
  MessageBodyFile?: MessageBodyFileResolvers<ContextType>;
  MessageBodyMultipleSelect?: MessageBodyMultipleSelectResolvers<ContextType>;
  MessageBodyNumber?: MessageBodyNumberResolvers<ContextType>;
  MessageBodyParagraph?: MessageBodyParagraphResolvers<ContextType>;
  MessageBodySingleSelect?: MessageBodySingleSelectResolvers<ContextType>;
  MessageBodyText?: MessageBodyTextResolvers<ContextType>;
  MessageBodyUndefined?: MessageBodyUndefinedResolvers<ContextType>;
  MessageHeader?: MessageHeaderResolvers<ContextType>;
  MonetaryAmountV2?: MonetaryAmountV2Resolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  NorwegianBankIdAuthResponse?: NorwegianBankIdAuthResponseResolvers<ContextType>;
  NorwegianHomeContentAgreement?: NorwegianHomeContentAgreementResolvers<ContextType>;
  NorwegianTravelAgreement?: NorwegianTravelAgreementResolvers<ContextType>;
  Object?: GraphQLScalarType;
  OfferEvent?: OfferEventResolvers<ContextType>;
  PendingStatus?: PendingStatusResolvers<ContextType>;
  Peril?: PerilResolvers<ContextType>;
  PerilCategory?: PerilCategoryResolvers<ContextType>;
  PreviousInsurer?: PreviousInsurerResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Renewal?: RenewalResolvers<ContextType>;
  SelfChangeEligibility?: SelfChangeEligibilityResolvers<ContextType>;
  SessionInformation?: SessionInformationResolvers<ContextType>;
  SignEvent?: SignEventResolvers<ContextType>;
  SignStatus?: SignStatusResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  SwedishApartmentAgreement?: SwedishApartmentAgreementResolvers<ContextType>;
  SwedishHouseAgreement?: SwedishHouseAgreementResolvers<ContextType>;
  TerminatedInFutureStatus?: TerminatedInFutureStatusResolvers<ContextType>;
  TerminatedStatus?: TerminatedStatusResolvers<ContextType>;
  TerminatedTodayStatus?: TerminatedTodayStatusResolvers<ContextType>;
  TimeStamp?: GraphQLScalarType;
  UpcomingAgreementChange?: UpcomingAgreementChangeResolvers<ContextType>;
  UpcomingRenewal?: UpcomingRenewalResolvers<ContextType>;
  Upload?: GraphQLScalarType;
  URL?: GraphQLScalarType;
  UUID?: GraphQLScalarType;
};


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = Context> = Resolvers<ContextType>;
