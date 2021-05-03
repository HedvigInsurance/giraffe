import { GraphQLResolveInfo } from 'graphql';
import { Contract } from '../api/upstreams/productPricing';
import { Context } from '../context';
import { hasContract } from './contracts';

const context: Context = {
    upstream: {
        productPricing: {
            getMemberContracts: () => Promise.resolve([])
        }
    }
} as unknown as Context
const info: GraphQLResolveInfo = {} as unknown as GraphQLResolveInfo

describe('Can determine if has contracts', () => {

    it('works when no contracts', async () => {
        context.upstream.productPricing.getMemberContracts = () => Promise.resolve([])

        const result = await hasContract(undefined, {}, context, info)

        expect(result).toBe(false)
    })

    it('works when some contracts', async () => {
        context.upstream.productPricing.getMemberContracts = () => Promise.resolve([
            { id: "cid" } as Contract
        ])

        const result = await hasContract(undefined, {}, context, info)

        expect(result).toBe(true)
    })
})