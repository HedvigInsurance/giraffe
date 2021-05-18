
import {
  ContractStatusDto,
} from './../api/upstreams/productPricing'
import {
  QueryToActiveContractBundlesResolver,
  ContractBundle,
  QueryToContractsResolver,
  Contract,
  QueryToHasContractResolver,
} from './../typings/generated-graphql-types'
import { bundleContracts, moveHomeContentsToTop, transformContract } from './helpers/contractTransformers';

const ADDRESS_CHANGE_STORIES_BY_MARKET: Record<string, string> = {
  SWEDEN: 'moving-flow-SE',
  NORWAY: 'moving-flow-NO',
}

export const activeContractBundles: QueryToActiveContractBundlesResolver = async (
  _parent,
  _args,
  { upstream, strings },
): Promise<ContractBundle[]> => {
  const [
    contracts,
    selfChangeEligibility
  ] = await Promise.all([
    upstream.productPricing.getMemberContracts(),
    upstream.productPricing.getSelfChangeEligibility()
  ])

  let addressChangeAngelStoryId: string | undefined = undefined
  if (selfChangeEligibility.blockers.length === 0) {
    const marketInfo = await upstream.productPricing.getContractMarketInfo()
    addressChangeAngelStoryId = ADDRESS_CHANGE_STORIES_BY_MARKET[marketInfo.market.toUpperCase()]
  }

  const active = contracts.filter(c => c.status == ContractStatusDto.ACTIVE)
  return bundleContracts(strings, active, addressChangeAngelStoryId)
}

export const contracts: QueryToContractsResolver = async (
  _parent,
  _args,
  { upstream, strings },
): Promise<Contract[]> => {
  const contracts = await upstream.productPricing.getMemberContracts()
  moveHomeContentsToTop(contracts)
  return contracts.map((c) => transformContract(c, strings))
}

export const hasContract: QueryToHasContractResolver = async (
  _parent,
  _args,
  { upstream },
): Promise<boolean> => {
  const contracts = await upstream.productPricing.getMemberContracts()
  return contracts.length > 0
}
