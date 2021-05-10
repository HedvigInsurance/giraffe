import { convertAddressChangeToSelfChangeBody } from './selfChangeTranslator'
import {
  MutationToCreateAddressChangeQuotesResolver,
  AddressChangeOutput,
} from './../typings/generated-graphql-types'

import {
  QueryToSelfChangeEligibilityResolver,
  SelfChangeEligibility,
} from '../typings/generated-graphql-types'
import { ContractStatusDto } from '../api/upstreams/productPricing'

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
): Promise<AddressChangeOutput> => {
  const [
    member,
    contracts,
    marketInfo
  ] = await Promise.all([
    upstream.memberService.getSelfMember(),
    upstream.productPricing.getMemberContracts(),
    upstream.productPricing.getContractMarketInfo()
  ])

  const tasks = contracts
    .filter((c) => c.status == ContractStatusDto.ACTIVE)
    .map((contract) => {
      const body = convertAddressChangeToSelfChangeBody(args.input, member, contract, marketInfo)
      return upstream.underwriter.createQuote(body)
    })

  const responses = await Promise.all(tasks)
  return {
    quoteIds: responses.map((response) => response.id),
  }
}

export { selfChangeEligibility, createAddressChangeQuotes }
