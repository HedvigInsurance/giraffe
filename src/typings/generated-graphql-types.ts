import { Context } from '../context'
/* tslint:disable */
import { GraphQLResolveInfo, GraphQLScalarType } from 'graphql';
/**
 * This file is auto-generated by @hedviginsurance/graphql-schema-typescript
 * Please note that any changes in this file may be overwritten
 */
 

/*******************************
 *                             *
 *          TYPE DEFS          *
 *                             *
 *******************************/
export interface Query {
  insurance: Insurance;
  cashback: Cashback;
  signStatus: SignStatus;
  gifs: Array<Gif | null>;
}

export interface Insurance {
  address?: string;
  monthlyCost?: number;
  safetyIncreasers?: Array<string>;
  personsInHousehold?: number;
  certificateUrl?: string;
  status: InsuranceStatus;
  type?: InsuranceType;
  activeFrom?: LocalDate;
  insuredAtOtherCompany?: boolean;
  presaleInformationUrl?: string;
  policyUrl?: string;
  currentInsurerName?: string;
  perilCategories?: Array<PerilCategory | null>;
}

export enum InsuranceStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  INACTIVE_WITH_START_DATE = 'INACTIVE_WITH_START_DATE',
  TERMINATED = 'TERMINATED'
}

export enum InsuranceType {
  RENT = 'RENT',
  BRF = 'BRF',
  STUDENT_RENT = 'STUDENT_RENT',
  STUDENT_BRF = 'STUDENT_BRF'
}

export type LocalDate = any;

export interface PerilCategory {
  title?: string;
  description?: string;
  iconUrl?: string;
  perils?: Array<Peril | null>;
}

export interface Peril {
  id?: string;
  title?: string;
  imageUrl?: string;
  description?: string;
}

export interface Cashback {
  id?: string;
  name?: string;
  imageUrl?: string;
}

export interface SignStatus {
  collectStatus?: CollectStatus;
  signState?: SignState;
}

export interface CollectStatus {
  status?: BankIdStatus;
  code?: string;
}

export enum BankIdStatus {
  pending = 'pending',
  failed = 'failed',
  complete = 'complete'
}

export enum SignState {
  INITIATED = 'INITIATED',
  IN_PROGRESS = 'IN_PROGRESS',
  FAILED = 'FAILED',
  COMPLETE = 'COMPLETE'
}

export interface Gif {
  url?: string;
}

export interface Mutation {
  logout: boolean;
  createSession: string;
  createOffer?: boolean;
  signOffer?: boolean;
  uploadFile: File;
}

export interface OfferInput {
  firstName: string;
  lastName: string;
  age: number;
  address: string;
  postalNumber: string;
  city?: string;
  insuranceType: InsuranceType;
  squareMeters: number;
  personsInHousehold: number;
  previousInsurer?: string;
}

export interface SignInput {
  personalNumber: string;
  email: string;
}

export type Upload = any;

export interface File {
  
  /**
   * signedUrl is valid for 30 minutes after upload, don't hang on to this.
   */
  signedUrl: string;
  
  /**
   * S3 key that can be used to retreive new signed urls in the future.
   */
  key: string;
}

export interface Subscription {
  offer?: OfferEvent;
  signStatus?: SignEvent;
}

export interface OfferEvent {
  status: OfferStatus;
  insurance?: Insurance;
}

export enum OfferStatus {
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL'
}

export interface SignEvent {
  status?: SignStatus;
}

/*********************************
 *                               *
 *         TYPE RESOLVERS        *
 *                               *
 *********************************/
/**
 * This interface define the shape of your resolver
 * Note that this type is designed to be compatible with graphql-tools resolvers
 * However, you can still use other generated interfaces to make your resolver type-safed
 */
export interface Resolver {
  Query?: QueryTypeResolver;
  Insurance?: InsuranceTypeResolver;
  LocalDate?: GraphQLScalarType;
  PerilCategory?: PerilCategoryTypeResolver;
  Peril?: PerilTypeResolver;
  Cashback?: CashbackTypeResolver;
  SignStatus?: SignStatusTypeResolver;
  CollectStatus?: CollectStatusTypeResolver;
  Gif?: GifTypeResolver;
  Mutation?: MutationTypeResolver;
  Upload?: GraphQLScalarType;
  File?: FileTypeResolver;
  Subscription?: SubscriptionTypeResolver;
  OfferEvent?: OfferEventTypeResolver;
  SignEvent?: SignEventTypeResolver;
}
export interface QueryTypeResolver<TParent = undefined> {
  insurance?: QueryToInsuranceResolver<TParent>;
  cashback?: QueryToCashbackResolver<TParent>;
  signStatus?: QueryToSignStatusResolver<TParent>;
  gifs?: QueryToGifsResolver<TParent>;
}

export interface QueryToInsuranceResolver<TParent = undefined, TResult = Insurance> {
  (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface QueryToCashbackResolver<TParent = undefined, TResult = Cashback> {
  (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface QueryToSignStatusResolver<TParent = undefined, TResult = SignStatus> {
  (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface QueryToGifsArgs {
  query?: string;
}
export interface QueryToGifsResolver<TParent = undefined, TResult = Array<Gif | null>> {
  (parent: TParent, args: QueryToGifsArgs, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface InsuranceTypeResolver<TParent = Insurance> {
  address?: InsuranceToAddressResolver<TParent>;
  monthlyCost?: InsuranceToMonthlyCostResolver<TParent>;
  safetyIncreasers?: InsuranceToSafetyIncreasersResolver<TParent>;
  personsInHousehold?: InsuranceToPersonsInHouseholdResolver<TParent>;
  certificateUrl?: InsuranceToCertificateUrlResolver<TParent>;
  status?: InsuranceToStatusResolver<TParent>;
  type?: InsuranceToTypeResolver<TParent>;
  activeFrom?: InsuranceToActiveFromResolver<TParent>;
  insuredAtOtherCompany?: InsuranceToInsuredAtOtherCompanyResolver<TParent>;
  presaleInformationUrl?: InsuranceToPresaleInformationUrlResolver<TParent>;
  policyUrl?: InsuranceToPolicyUrlResolver<TParent>;
  currentInsurerName?: InsuranceToCurrentInsurerNameResolver<TParent>;
  perilCategories?: InsuranceToPerilCategoriesResolver<TParent>;
}

export interface InsuranceToAddressResolver<TParent = Insurance, TResult = string | null> {
  (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface InsuranceToMonthlyCostResolver<TParent = Insurance, TResult = number | null> {
  (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface InsuranceToSafetyIncreasersResolver<TParent = Insurance, TResult = Array<string> | null> {
  (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface InsuranceToPersonsInHouseholdResolver<TParent = Insurance, TResult = number | null> {
  (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface InsuranceToCertificateUrlResolver<TParent = Insurance, TResult = string | null> {
  (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface InsuranceToStatusResolver<TParent = Insurance, TResult = InsuranceStatus> {
  (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface InsuranceToTypeResolver<TParent = Insurance, TResult = InsuranceType | null> {
  (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface InsuranceToActiveFromResolver<TParent = Insurance, TResult = LocalDate | null> {
  (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface InsuranceToInsuredAtOtherCompanyResolver<TParent = Insurance, TResult = boolean | null> {
  (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface InsuranceToPresaleInformationUrlResolver<TParent = Insurance, TResult = string | null> {
  (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface InsuranceToPolicyUrlResolver<TParent = Insurance, TResult = string | null> {
  (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface InsuranceToCurrentInsurerNameResolver<TParent = Insurance, TResult = string | null> {
  (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface InsuranceToPerilCategoriesResolver<TParent = Insurance, TResult = Array<PerilCategory | null> | null> {
  (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface PerilCategoryTypeResolver<TParent = PerilCategory> {
  title?: PerilCategoryToTitleResolver<TParent>;
  description?: PerilCategoryToDescriptionResolver<TParent>;
  iconUrl?: PerilCategoryToIconUrlResolver<TParent>;
  perils?: PerilCategoryToPerilsResolver<TParent>;
}

export interface PerilCategoryToTitleResolver<TParent = PerilCategory, TResult = string | null> {
  (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface PerilCategoryToDescriptionResolver<TParent = PerilCategory, TResult = string | null> {
  (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface PerilCategoryToIconUrlResolver<TParent = PerilCategory, TResult = string | null> {
  (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface PerilCategoryToPerilsResolver<TParent = PerilCategory, TResult = Array<Peril | null> | null> {
  (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface PerilTypeResolver<TParent = Peril> {
  id?: PerilToIdResolver<TParent>;
  title?: PerilToTitleResolver<TParent>;
  imageUrl?: PerilToImageUrlResolver<TParent>;
  description?: PerilToDescriptionResolver<TParent>;
}

export interface PerilToIdResolver<TParent = Peril, TResult = string | null> {
  (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface PerilToTitleResolver<TParent = Peril, TResult = string | null> {
  (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface PerilToImageUrlResolver<TParent = Peril, TResult = string | null> {
  (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface PerilToDescriptionResolver<TParent = Peril, TResult = string | null> {
  (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface CashbackTypeResolver<TParent = Cashback> {
  id?: CashbackToIdResolver<TParent>;
  name?: CashbackToNameResolver<TParent>;
  imageUrl?: CashbackToImageUrlResolver<TParent>;
}

export interface CashbackToIdResolver<TParent = Cashback, TResult = string | null> {
  (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface CashbackToNameResolver<TParent = Cashback, TResult = string | null> {
  (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface CashbackToImageUrlResolver<TParent = Cashback, TResult = string | null> {
  (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface SignStatusTypeResolver<TParent = SignStatus> {
  collectStatus?: SignStatusToCollectStatusResolver<TParent>;
  signState?: SignStatusToSignStateResolver<TParent>;
}

export interface SignStatusToCollectStatusResolver<TParent = SignStatus, TResult = CollectStatus | null> {
  (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface SignStatusToSignStateResolver<TParent = SignStatus, TResult = SignState | null> {
  (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface CollectStatusTypeResolver<TParent = CollectStatus> {
  status?: CollectStatusToStatusResolver<TParent>;
  code?: CollectStatusToCodeResolver<TParent>;
}

export interface CollectStatusToStatusResolver<TParent = CollectStatus, TResult = BankIdStatus | null> {
  (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface CollectStatusToCodeResolver<TParent = CollectStatus, TResult = string | null> {
  (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface GifTypeResolver<TParent = Gif> {
  url?: GifToUrlResolver<TParent>;
}

export interface GifToUrlResolver<TParent = Gif, TResult = string | null> {
  (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface MutationTypeResolver<TParent = undefined> {
  logout?: MutationToLogoutResolver<TParent>;
  createSession?: MutationToCreateSessionResolver<TParent>;
  createOffer?: MutationToCreateOfferResolver<TParent>;
  signOffer?: MutationToSignOfferResolver<TParent>;
  uploadFile?: MutationToUploadFileResolver<TParent>;
}

export interface MutationToLogoutResolver<TParent = undefined, TResult = boolean> {
  (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface MutationToCreateSessionResolver<TParent = undefined, TResult = string> {
  (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface MutationToCreateOfferArgs {
  details: OfferInput;
}
export interface MutationToCreateOfferResolver<TParent = undefined, TResult = boolean | null> {
  (parent: TParent, args: MutationToCreateOfferArgs, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface MutationToSignOfferArgs {
  details: SignInput;
}
export interface MutationToSignOfferResolver<TParent = undefined, TResult = boolean | null> {
  (parent: TParent, args: MutationToSignOfferArgs, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface MutationToUploadFileArgs {
  file: Upload;
}
export interface MutationToUploadFileResolver<TParent = undefined, TResult = File> {
  (parent: TParent, args: MutationToUploadFileArgs, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface FileTypeResolver<TParent = File> {
  signedUrl?: FileToSignedUrlResolver<TParent>;
  key?: FileToKeyResolver<TParent>;
}

export interface FileToSignedUrlResolver<TParent = File, TResult = string> {
  (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface FileToKeyResolver<TParent = File, TResult = string> {
  (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface SubscriptionTypeResolver<TParent = undefined> {
  offer?: SubscriptionToOfferResolver<TParent>;
  signStatus?: SubscriptionToSignStatusResolver<TParent>;
}

export interface SubscriptionToOfferResolver<TParent = undefined, TResult = OfferEvent | null> {
  resolve?: (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo) => TResult | Promise<TResult>;
  subscribe: (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;
}

export interface SubscriptionToSignStatusResolver<TParent = undefined, TResult = SignEvent | null> {
  resolve?: (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo) => TResult | Promise<TResult>;
  subscribe: (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;
}

export interface OfferEventTypeResolver<TParent = OfferEvent> {
  status?: OfferEventToStatusResolver<TParent>;
  insurance?: OfferEventToInsuranceResolver<TParent>;
}

export interface OfferEventToStatusResolver<TParent = OfferEvent, TResult = OfferStatus> {
  (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface OfferEventToInsuranceResolver<TParent = OfferEvent, TResult = Insurance | null> {
  (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface SignEventTypeResolver<TParent = SignEvent> {
  status?: SignEventToStatusResolver<TParent>;
}

export interface SignEventToStatusResolver<TParent = SignEvent, TResult = SignStatus | null> {
  (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}
