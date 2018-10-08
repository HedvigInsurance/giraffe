import { Context } from '../context'
/* tslint:disable */
import { GraphQLResolveInfo, GraphQLScalarType } from 'graphql';
/**
 * This file is auto-generated by graphql-schema-typescript
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
}

export interface Insurance {
  address?: string;
  monthlyCost?: number;
  safetyIncreasers?: Array<string>;
  personsInHousehold?: number;
  certificateUrl?: string;
  status?: InsuranceStatus;
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

export interface Mutation {
  logout: boolean;
  createSession: string;
  createOffer: string;
}

export interface OfferInput {
  firstName: string;
  lastName: string;
  age: number;
  address: string;
  postalNumber: string;
  city: string;
  insuranceType: InsuranceType;
  squareMeters: number;
  personsInHousehold: number;
  previousInsurer?: string;
}

export interface Subscription {
  offer: OfferEvent;
}

export interface OfferEvent {
  insuranceId: string;
  success: boolean;
  insurance: Insurance;
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
  Mutation?: MutationTypeResolver;
  Subscription?: SubscriptionTypeResolver;
  OfferEvent?: OfferEventTypeResolver;
}
export interface QueryTypeResolver<TParent = undefined> {
  insurance?: QueryToInsuranceResolver<TParent>;
  cashback?: QueryToCashbackResolver<TParent>;
}

export interface QueryToInsuranceResolver<TParent = undefined, TResult = Insurance> {
  (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface QueryToCashbackResolver<TParent = undefined, TResult = Cashback> {
  (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
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

export interface InsuranceToStatusResolver<TParent = Insurance, TResult = InsuranceStatus | null> {
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

export interface MutationTypeResolver<TParent = undefined> {
  logout?: MutationToLogoutResolver<TParent>;
  createSession?: MutationToCreateSessionResolver<TParent>;
  createOffer?: MutationToCreateOfferResolver<TParent>;
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
export interface MutationToCreateOfferResolver<TParent = undefined, TResult = string> {
  (parent: TParent, args: MutationToCreateOfferArgs, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface SubscriptionTypeResolver<TParent = undefined> {
  offer?: SubscriptionToOfferResolver<TParent>;
}

export interface SubscriptionToOfferArgs {
  insuranceId: string;
}
export interface SubscriptionToOfferResolver<TParent = undefined, TResult = OfferEvent> {
  resolve?: (parent: TParent, args: SubscriptionToOfferArgs, context: Context, info: GraphQLResolveInfo) => TResult | Promise<TResult>;
  subscribe: (parent: TParent, args: SubscriptionToOfferArgs, context: Context, info: GraphQLResolveInfo) => AsyncIterator<TResult>;
}

export interface OfferEventTypeResolver<TParent = OfferEvent> {
  insuranceId?: OfferEventToInsuranceIdResolver<TParent>;
  success?: OfferEventToSuccessResolver<TParent>;
  insurance?: OfferEventToInsuranceResolver<TParent>;
}

export interface OfferEventToInsuranceIdResolver<TParent = OfferEvent, TResult = string> {
  (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface OfferEventToSuccessResolver<TParent = OfferEvent, TResult = boolean> {
  (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}

export interface OfferEventToInsuranceResolver<TParent = OfferEvent, TResult = Insurance> {
  (parent: TParent, args: {}, context: Context, info: GraphQLResolveInfo): TResult | Promise<TResult>;
}
