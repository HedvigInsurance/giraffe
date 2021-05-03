import { NorwegianHomeContentLineOfBusiness, NorwegianTravelLineOfBusiness, DanishHomeContentLineOfBusiness, DanishTravelLineOfBusiness, DanishAccidentLineOfBusiness, ActiveStatus, PendingStatus, ActiveInFutureStatus, TerminatedInFutureStatus, TerminatedStatus, ActiveInFutureAndTerminatedInFutureStatus } from './../typings/generated-graphql-types';
import {
  AgreementStatusDto,
  ContractStatusDto,
  ExtraBuildingTypeDto,
} from './../api/upstreams/productPricing'
import { GraphQLResolveInfo } from 'graphql'
import { ContractDto } from '../api/upstreams/productPricing'
import { Context } from '../context'
import { contracts, hasContract } from './contracts'
import {
  AgreementStatus,
  Contract,
  SwedishApartmentLineOfBusiness,
  TypeOfContract,
} from '../typings/generated-graphql-types'

const context: Context = ({
  upstream: {
    productPricing: {
      getMemberContracts: () => Promise.resolve([]),
    },
  },
  strings: (key: string) => key,
} as unknown) as Context
const info: GraphQLResolveInfo = ({} as unknown) as GraphQLResolveInfo

describe('Query.contracts', () => {
  it('works when no contracts', async () => {
    context.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([])

    const result = await contracts(undefined, {}, context, info)

    expect(result).toEqual([])
  })

  const baseContract = {
    id: 'cid',
    holderMemberId: 'mid',
    masterInception: '2021-03-01',
    switchedFrom: 'IF',
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
    switchedFromInsuranceProvider: 'IF',
    status: {
      pastInception: baseContract.masterInception,
    },
    inception: '2021-03-01',
    createdAt: '2020-12-01T10:00:00Z',
  }

  const baseOutputAgreement = {
    id: 'aid1',
    activeFrom: '2020-12-01',
    premium: {
      amount: '120',
      currency: 'SEK',
    },
    status: AgreementStatus.ACTIVE,
  }

  it('works for different statuses', async () => {
    const contract: ContractDto = {
      ...baseContract,
      typeOfContract: 'SE_APARTMENT_BRF',
      upcomingAgreement: {
        ...baseAgreement,
        type: 'SwedishApartment',
        lineOfBusiness: 'BRF',
        address: address,
        numberCoInsured: 2,
        squareMeters: 66,
      },
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
    context.upstream.productPricing.getMemberContracts = () => Promise.resolve([
      { ...contract, status: ContractStatusDto.ACTIVE }
    ])

    expect(
      (await contracts(undefined, {}, context, info))[0].status
    ).toMatchObject<ActiveStatus>(
      {
        pastInception: contract.masterInception,
        upcomingAgreementChange: {
          newAgreement: {
            ...baseOutputAgreement,
            address: address,
            numberCoInsured: 2,
            squareMeters: 66,
            type: SwedishApartmentLineOfBusiness.BRF
          }
        }
      }
    )

    context.upstream.productPricing.getMemberContracts = () => Promise.resolve([
      { ...contract, status: ContractStatusDto.PENDING }
    ])
    expect(
      (await contracts(undefined, {}, context, info))[0].status
    ).toMatchObject<PendingStatus>(
      {
        pendingSince: '2020-12-01'
      }
    )

    context.upstream.productPricing.getMemberContracts = () => Promise.resolve([
      { ...contract, status: ContractStatusDto.ACTIVE_IN_FUTURE }
    ])
    expect(
      (await contracts(undefined, {}, context, info))[0].status
    ).toMatchObject<ActiveInFutureStatus>(
      {
        futureInception: contract.masterInception
      }
    )

    context.upstream.productPricing.getMemberContracts = () => Promise.resolve([
      { ...contract, status: ContractStatusDto.ACTIVE_IN_FUTURE }
    ])
    expect(
      (await contracts(undefined, {}, context, info))[0].status
    ).toMatchObject<ActiveInFutureStatus>(
      {
        futureInception: contract.masterInception
      }
    )

    context.upstream.productPricing.getMemberContracts = () => Promise.resolve([
      { ...contract, terminationDate: '2022-01-01', status: ContractStatusDto.TERMINATED_IN_FUTURE }
    ])
    expect(
      (await contracts(undefined, {}, context, info))[0].status
    ).toMatchObject<TerminatedInFutureStatus>(
      {
        futureTermination: '2022-01-01'
      }
    )

    context.upstream.productPricing.getMemberContracts = () => Promise.resolve([
      { ...contract, terminationDate: '2022-01-01', status: ContractStatusDto.TERMINATED }
    ])
    expect(
      (await contracts(undefined, {}, context, info))[0].status
    ).toMatchObject<TerminatedStatus>(
      {
        termination: '2022-01-01'
      }
    )

    context.upstream.productPricing.getMemberContracts = () => Promise.resolve([
      { ...contract, terminationDate: '2022-01-01', status: ContractStatusDto.ACTIVE_IN_FUTURE_AND_TERMINATED_IN_FUTURE }
    ])
    expect(
      (await contracts(undefined, {}, context, info))[0].status
    ).toMatchObject<ActiveInFutureAndTerminatedInFutureStatus>(
      {
        futureInception: contract.masterInception,
        futureTermination: '2022-01-01'
      }
    )
  })


  it('works for swedish apartment', async () => {
    const contract: ContractDto = {
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

    context.upstream.productPricing.getMemberContracts = () => Promise.resolve([contract])

    const result = await contracts(undefined, {}, context, info)

    expect(result).toMatchObject<Contract[]>([
      {
        ...baseOutput,
        typeOfContract: TypeOfContract.SE_APARTMENT_BRF,
        displayName: 'CONTRACT_DISPLAY_NAME_SE_APARTMENT_BRF',
        currentAgreement: {
          ...baseOutputAgreement,
          address: address,
          numberCoInsured: 1,
          squareMeters: 44,
          type: SwedishApartmentLineOfBusiness.BRF,
        },
      },
    ])
  })

  it('works for swedish houses', async () => {
    const contract: ContractDto = {
      ...baseContract,
      typeOfContract: 'SE_HOUSE',
      agreements: [
        {
          ...baseAgreement,
          type: 'SwedishHouse',
          address: address,
          numberCoInsured: 1,
          squareMeters: 44,
          ancillaryArea: 15,
          numberOfBathrooms: 3,
          yearOfConstruction: 1910,
          isSubleted: true,
          extraBuildings: [
            {
              type: ExtraBuildingTypeDto.GARAGE,
              area: 14,
              displayName: 'Garage',
              hasWaterConnected: false,
            },
          ],
        },
      ],
    }

    context.upstream.productPricing.getMemberContracts = () => Promise.resolve([contract])

    const result = await contracts(undefined, {}, context, info)

    expect(result).toMatchObject<Contract[]>([
      {
        ...baseOutput,
        typeOfContract: TypeOfContract.SE_HOUSE,
        displayName: 'CONTRACT_DISPLAY_NAME_SE_HOUSE',
        currentAgreement: {
          ...baseOutputAgreement,
          address: address,
          numberCoInsured: 1,
          squareMeters: 44,
          ancillaryArea: 15,
          numberOfBathrooms: 3,
          yearOfConstruction: 1910,
          isSubleted: true,
          extraBuildings: [
            {
              area: 14,
              displayName: 'Garage',
              hasWaterConnected: false,
            },
          ],
        },
      },
    ])
  })

  it('works for norwegian home content', async () => {
    const contract: ContractDto = {
      ...baseContract,
      typeOfContract: 'NO_HOME_CONTENT_OWN',
      agreements: [
        {
          ...baseAgreement,
          type: 'NorwegianHomeContent',
          lineOfBusiness: 'RENT',
          address: address,
          numberCoInsured: 2,
          squareMeters: 77
        },
      ],
    }

    context.upstream.productPricing.getMemberContracts = () => Promise.resolve([contract])

    const result = await contracts(undefined, {}, context, info)

    expect(result).toMatchObject<Contract[]>([
      {
        ...baseOutput,
        typeOfContract: TypeOfContract.NO_HOME_CONTENT_OWN,
        displayName: 'CONTRACT_DISPLAY_NAME_NO_HOME_CONTENT_OWN',
        currentAgreement: {
          ...baseOutputAgreement,
          address: address,
          numberCoInsured: 2,
          squareMeters: 77,
          type: NorwegianHomeContentLineOfBusiness.RENT,
        },
      },
    ])
  })

  it('works for norwegian travel', async () => {
    const contract: ContractDto = {
      ...baseContract,
      typeOfContract: 'NO_TRAVEL',
      agreements: [
        {
          ...baseAgreement,
          type: 'NorwegianTravel',
          lineOfBusiness: 'REGULAR',
          numberCoInsured: 2,
        },
      ],
    }

    context.upstream.productPricing.getMemberContracts = () => Promise.resolve([contract])

    const result = await contracts(undefined, {}, context, info)

    expect(result).toMatchObject<Contract[]>([
      {
        ...baseOutput,
        typeOfContract: TypeOfContract.NO_TRAVEL,
        displayName: 'CONTRACT_DISPLAY_NAME_NO_TRAVEL',
        currentAgreement: {
          ...baseOutputAgreement,
          numberCoInsured: 2,
          type: NorwegianTravelLineOfBusiness.REGULAR
        },
      },
    ])
  })

  it('works for danish home content', async () => {
    const contract: ContractDto = {
      ...baseContract,
      typeOfContract: 'DK_HOME_CONTENT_OWN',
      agreements: [
        {
          ...baseAgreement,
          type: 'DanishHomeContent',
          address: address,
          numberCoInsured: 2,
          squareMeters: 98,
          lineOfBusiness: 'OWN'
        },
      ],
    }

    context.upstream.productPricing.getMemberContracts = () => Promise.resolve([contract])

    const result = await contracts(undefined, {}, context, info)

    expect(result).toMatchObject<Contract[]>([
      {
        ...baseOutput,
        typeOfContract: TypeOfContract.DK_HOME_CONTENT_OWN,
        displayName: 'CONTRACT_DISPLAY_NAME_DK_HOME_CONTENT_OWN',
        currentAgreement: {
          ...baseOutputAgreement,
          address: address,
          numberCoInsured: 2,
          squareMeters: 98,
          type: DanishHomeContentLineOfBusiness.OWN
        },
      },
    ])
  })

  it('works for danish travel', async () => {
    const contract: ContractDto = {
      ...baseContract,
      typeOfContract: 'DK_TRAVEL',
      agreements: [
        {
          ...baseAgreement,
          type: 'DanishTravel',
          address: address,
          numberCoInsured: 2,
          lineOfBusiness: 'REGULAR'
        },
      ],
    }

    context.upstream.productPricing.getMemberContracts = () => Promise.resolve([contract])

    const result = await contracts(undefined, {}, context, info)

    expect(result).toMatchObject<Contract[]>([
      {
        ...baseOutput,
        typeOfContract: TypeOfContract.DK_TRAVEL,
        displayName: 'CONTRACT_DISPLAY_NAME_DK_TRAVEL',
        currentAgreement: {
          ...baseOutputAgreement,
          address: address,
          numberCoInsured: 2,
          type: DanishTravelLineOfBusiness.REGULAR
        },
      },
    ])
  })

  it('works for danish accident', async () => {
    const contract: ContractDto = {
      ...baseContract,
      typeOfContract: 'DK_ACCIDENT',
      agreements: [
        {
          ...baseAgreement,
          type: 'DanishAccident',
          address: address,
          numberCoInsured: 2,
          lineOfBusiness: 'REGULAR'
        },
      ],
    }

    context.upstream.productPricing.getMemberContracts = () => Promise.resolve([contract])

    const result = await contracts(undefined, {}, context, info)

    expect(result).toMatchObject<Contract[]>([
      {
        ...baseOutput,
        typeOfContract: TypeOfContract.DK_ACCIDENT,
        displayName: 'CONTRACT_DISPLAY_NAME_DK_ACCIDENT',
        currentAgreement: {
          ...baseOutputAgreement,
          address: address,
          numberCoInsured: 2,
          type: DanishAccidentLineOfBusiness.REGULAR
        },
      },
    ])
  })
})

describe('Query.hasContract', () => {
  it('is false when no contracts', async () => {
    context.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([])

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
