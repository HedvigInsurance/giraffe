import {
  AgreementStatusDto,
  ContractStatusDto,
} from './../api/upstreams/productPricing'
import { GraphQLResolveInfo } from 'graphql'
import { ContractDto } from '../api/upstreams/productPricing'
import { Context } from '../context'
import { contracts, hasContract } from './contracts'
import { AgreementStatus, Contract, SwedishApartmentLineOfBusiness, TypeOfContract } from '../typings/generated-graphql-types'

const context: Context = {
  upstream: {
    productPricing: {
      getMemberContracts: () => Promise.resolve([]),
    },
  },
  strings: (key: string) => key,
} as unknown as Context
const info: GraphQLResolveInfo = ({} as unknown) as GraphQLResolveInfo

describe('Query.contracts', () => {
  it('works when no contracts', async () => {
    context.upstream.productPricing.getMemberContracts = () => Promise.resolve([])

    const result = await contracts(undefined, {}, context, info)

    expect(result).toEqual([])
  })

  const baseContract = {
    id: 'cid',
    holderMemberId: 'mid',
    masterInception: '2021-03-01',
    status: ContractStatusDto.ACTIVE,
    isTerminated: false,
    currentAgreementId: 'aid1',
    hasPendingAgreement: false,
    createdAt: '2020-12-01T10:00:00Z',
  }

  const baseAgreement = {
    id: 'aid1',
    fromDate: '2020-12-01',
    basePremium: { amount: '120', currency: 'SEK' },
    status: AgreementStatusDto.ACTIVE,
  }

  const address = {
    street: 'Fakestreet 123',
    postalCode: '12345',
    country: 'SE',
  }

  const baseOutput = {
    id: 'cid',
    holderMember: 'mid',
    status: {},
    inception: '2021-03-01',
    createdAt: '2020-12-01T10:00:00Z',
  }

  it('works for swedish apartment', async () => {
    const swedishApartment: ContractDto = {
      ...baseContract,
      typeOfContract: 'SE_APARTMENT_BRF',
      agreements: [
        {
          ...baseAgreement,
          type: 'SwedishApartment',
          lineOfBusiness: 'BRF',
          address: address,
          numberCoInsured: 1,
          squareMeters: 44,
        },
      ],
    }
    
    context.upstream.productPricing.getMemberContracts = () => Promise.resolve([swedishApartment])

    const result = await contracts(undefined, {}, context, info)

    expect(result).toMatchObject<Contract[]>([
      {
        ...baseOutput,
        typeOfContract: TypeOfContract.SE_APARTMENT_BRF,
        displayName: 'CONTRACT_DISPLAY_NAME_SE_APARTMENT_BRF',
        currentAgreement: {
            id: "aid1",
            activeFrom: '2020-12-01',
            premium: {
                amount: "120",
                currency: 'SEK'
            },
            status: AgreementStatus.ACTIVE,
            address: address,
            numberCoInsured: 1,
            squareMeters: 44,
            type: SwedishApartmentLineOfBusiness.BRF
        },
        status: {
          pastInception: swedishApartment.masterInception
        }
      }
    ])
  })
})

describe('Query.hasContract', () => {
  it('is false when no contracts', async () => {
    context.upstream.productPricing.getMemberContracts = () => Promise.resolve([])

    const result = await hasContract(undefined, {}, context, info)

    expect(result).toBe(false)
  })

  it('is true when some contracts', async () => {
    context.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([{ id: 'cid' } as ContractDto])

    const result = await hasContract(undefined, {}, context, info)

    expect(result).toBe(true)
  })
})
