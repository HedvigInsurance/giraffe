import { QueryToContractBundlesResolver, ContractBundle, QueryToContractsResolver, Contract, QueryToHasContractResolver } from './../typings/generated-graphql-types';


export const contractBundles: QueryToContractBundlesResolver = async (
    _parent,
    _args,
    _context
): Promise<ContractBundle[]> => {
    throw "Nope"
}

export const contracts: QueryToContractsResolver = async (
    _parent,
    _args,
    _context
): Promise<Contract[]> => {
    throw "Nope"
}

export const hasContract: QueryToHasContractResolver = async (
    _parent,
    _args,
    { upstream }
): Promise<boolean> => {
    const contracts = await upstream.productPricing.getMemberContracts()
    return contracts.length > 0
}
