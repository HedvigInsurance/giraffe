import { GraphQLResolveInfo } from 'graphql';
import { ContractDto } from '../api/upstreams/productPricing';
import { Context } from '../context';
import { contracts, hasContract } from './contracts';

const context: Context = {
    upstream: {
        productPricing: {
            getMemberContracts: () => Promise.resolve([])
        }
    }
} as unknown as Context
const info: GraphQLResolveInfo = {} as unknown as GraphQLResolveInfo

describe('Query.contracts', () => {
    it('works when no contracts', async () => {
        context.upstream.productPricing.getMemberContracts = () => Promise.resolve([])

        const result = await contracts(undefined, {}, context, info)

        expect(result).toEqual([])
    })
})

describe('Query.hasContract', () => {

    it('is false when no contracts', async () => {
        context.upstream.productPricing.getMemberContracts = () => Promise.resolve([])

        const result = await hasContract(undefined, {}, context, info)

        expect(result).toBe(false)
    })

    it('is true when some contracts', async () => {
        context.upstream.productPricing.getMemberContracts = () => Promise.resolve([
            { id: "cid" } as ContractDto
        ])

        const result = await hasContract(undefined, {}, context, info)

        expect(result).toBe(true)
    })
})