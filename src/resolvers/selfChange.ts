import { QuoteCreationResult } from './../api/upstreams/underwriter';
import { convertAddressChangeToSelfChangeBody } from './selfChangeTranslator'
import {
  MutationToCreateAddressChangeQuotesResolver,
  AddressChangeQuoteResult,
  PossibleAddressChangeQuoteResultTypeNames,
} from './../typings/generated-graphql-types'

import {
  QueryToSelfChangeEligibilityResolver,
  SelfChangeEligibility,
} from '../typings/generated-graphql-types'
import { ContractStatusDto } from '../api/upstreams/productPricing'
import { Typenamed } from '../utils/types';

const ADDRESS_CHANGE_STORIES_BY_MARKET: Record<string, string> = {
  SWEDEN: 'moving-flow-SE',
  NORWAY: 'moving-flow-NO',
}

const INELIGIBLE: SelfChangeEligibility = {
  blockers: [],
}

const selfChangeEligibility: QueryToSelfChangeEligibilityResolver = async (
  _parent,
  _args,
  { upstream },
): Promise<SelfChangeEligibility> => {
  const eligibility = await upstream.productPricing.getSelfChangeEligibility()
  const isEligible = eligibility.blockers.length == 0
  if (!isEligible) {
    return INELIGIBLE
  }

  const marketInfo = await upstream.productPricing.getContractMarketInfo()
  return {
    blockers: [], // is deprecated
    addressChangeEmbarkStoryId: ADDRESS_CHANGE_STORIES_BY_MARKET[marketInfo.market.toUpperCase()],
  }
}

const createAddressChangeQuotes: MutationToCreateAddressChangeQuotesResolver = async (
  _parent,
  args,
  { upstream },
): Promise<AddressChangeQuoteResult> => {
  const contractIds = args.input.contractBundleId.replace('bundle:', '').split(',')
  const [
    member,
    contracts,
    marketInfo
  ] = await Promise.all([
    upstream.memberService.getSelfMember(),
    Promise.all(contractIds.map(upstream.productPricing.getContract)),
    upstream.productPricing.getContractMarketInfo()
  ])

  const tasks = contracts
    .filter((c) => c.status == ContractStatusDto.ACTIVE)
    .map((contract) => {
      const body = convertAddressChangeToSelfChangeBody(args.input, member, contract, marketInfo)
      return upstream.underwriter.createQuote(body)
    })

  const responses = await Promise.all(tasks)
  return transformResult(responses)
}

const transformResult = (
  responses: QuoteCreationResult[]
): Typenamed<AddressChangeQuoteResult, PossibleAddressChangeQuoteResultTypeNames> => {
  const quoteIds: string[] = []
  const breachedUnderwritingGuidelines: string[] = []
  responses.forEach(response => {
    switch (response.status) {
      case 'success':
        quoteIds.push(response.id)
        break
      case 'failure':
        response.breachedUnderwritingGuidelines.forEach(g => breachedUnderwritingGuidelines.push(g.code))
        break
    }
  })
  if (breachedUnderwritingGuidelines.length > 0) {
    return {
      __typename: 'AddressChangeQuoteFailure',
      breachedUnderwritingGuidelines: breachedUnderwritingGuidelines
    }
  }
  return {
    __typename: 'AddressChangeQuoteSuccess',
    quoteIds: quoteIds
  }
}

export { selfChangeEligibility, createAddressChangeQuotes }
