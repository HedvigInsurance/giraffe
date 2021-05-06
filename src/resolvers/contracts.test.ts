import {
  NorwegianHomeContentLineOfBusiness,
  NorwegianTravelLineOfBusiness,
  DanishHomeContentLineOfBusiness,
  DanishTravelLineOfBusiness,
  DanishAccidentLineOfBusiness,
  ActiveStatus,
  PendingStatus,
  ActiveInFutureStatus,
  TerminatedInFutureStatus,
  TerminatedStatus,
  ActiveInFutureAndTerminatedInFutureStatus,
  ContractBundle,
} from './../typings/generated-graphql-types'
import {
  AgreementStatusDto,
  ContractStatusDto,
  ExtraBuildingTypeDto,
} from './../api/upstreams/productPricing'
import { GraphQLResolveInfo } from 'graphql'
import { ContractDto } from '../api/upstreams/productPricing'
import { Context } from '../context'
import { activeContractBundles, contracts, hasContract } from './contracts'
import {
  AgreementStatus,
  Contract,
  SwedishApartmentLineOfBusiness,
  TypeOfContract,
} from '../typings/generated-graphql-types'

describe('Query.activeContractBundles', () => {
  it('works for zero contracts', async () => {
    context.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([])

    const result = await activeContractBundles(undefined, {}, context, info)

    expect(result).toEqual([])
  })

  it('becomes two bundles for two swedish contracts', async () => {
    const apartment = {
      ...swedishApartmentInput,
      id: 'cid1',
    }
    const house = {
      ...swedishHouseInput,
      id: 'cid2',
    }
    context.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([apartment, house])

    const result = await activeContractBundles(undefined, {}, context, info)

    expect(result).toMatchObject<ContractBundle[]>([
      {
        id: 'bundle:cid1',
        contracts: [
          {
            ...swedishApartmentOutput,
            id: 'cid1',
          },
        ],
        angelStories: {}
      },
      {
        id: 'bundle:cid2',
        contracts: [
          {
            ...swedishHouseOutput,
            id: 'cid2',
          },
        ],
        angelStories: {}
      },
    ])
  })

  it('becomes a single bundle for norwegian contracts', async () => {
    const homeContent = {
      ...norwegianHomeContentInput,
      id: 'cid1',
    }
    const travel = {
      ...norwegianTravelInput,
      id: 'cid2',
    }
    context.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([homeContent, travel])

    const result = await activeContractBundles(undefined, {}, context, info)

    expect(result).toMatchObject<ContractBundle[]>([
      {
        id: 'bundle:cid1,cid2',
        contracts: [
          {
            ...norwegianHomeContentOutput,
            id: 'cid1',
          },
          {
            ...norwegianTravelOutput,
            id: 'cid2',
          },
        ],
        angelStories: {}
      },
    ])
  })

  it('becomes a single bundle for danish contracts', async () => {
    const homeContent = {
      ...danishHomeContentInput,
      id: 'cid1',
    }
    const travel = {
      ...danishTravelInput,
      id: 'cid2',
    }
    const accident = {
      ...danishAccidentInput,
      id: 'cid3',
    }
    context.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([homeContent, travel, accident])

    const result = await activeContractBundles(undefined, {}, context, info)

    expect(result).toMatchObject<ContractBundle[]>([
      {
        id: 'bundle:cid1,cid2,cid3',
        contracts: [
          {
            ...danishHomeContentOutput,
            id: 'cid1',
          },
          {
            ...danishTravelOutput,
            id: 'cid2',
          },
          {
            ...danishAccidentOutput,
            id: 'cid3',
          },
        ],
        angelStories: {}
      },
    ])
  })

  it('non-active contracts are ignored', async () => {
    const homeContent = {
      ...norwegianHomeContentInput,
      id: 'cid1',
      status: ContractStatusDto.ACTIVE
    }
    const travel = {
      ...norwegianTravelInput,
      id: 'cid2',
      status: ContractStatusDto.TERMINATED
    }
    context.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([homeContent, travel])

    const result = await activeContractBundles(undefined, {}, context, info)

    expect(result).toMatchObject<ContractBundle[]>([
      {
        id: 'bundle:cid1',
        contracts: [
          {
            ...norwegianHomeContentOutput,
            id: 'cid1',
          }
        ],
        angelStories: {}
      }
    ])
  })

  it('compound bundle ID is sorted alphabetically', async () => {
    const homeContent = {
      ...norwegianHomeContentInput,
      id: 'z',
    }
    const travel = {
      ...norwegianTravelInput,
      id: 'a',
    }
    context.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([homeContent, travel])

    const result = await activeContractBundles(undefined, {}, context, info)

    expect(result[0].id).toBe('bundle:a,z')
  })

  it('HomeContent contracts are moved to the top', async () => {
    const travel = {
      ...norwegianTravelInput,
      id: 'cid1',
    }
    const homeContent = {
      ...norwegianHomeContentInput,
      id: 'cid2',
    }
    context.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([homeContent, travel])

    const result = await activeContractBundles(undefined, {}, context, info)

    expect(result[0].contracts[0].id).toBe('cid2')
    expect(result[0].contracts[1].id).toBe('cid1')
  })

  it('HomeContent contracts are moved to the top', async () => {
    const travel = {
      ...norwegianTravelInput,
      id: 'cid1',
    }
    const homeContent = {
      ...norwegianHomeContentInput,
      id: 'cid2',
    }
    context.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([homeContent, travel])

    const result = await activeContractBundles(undefined, {}, context, info)

    expect(result[0].contracts[0].id).toBe('cid2')
    expect(result[0].contracts[1].id).toBe('cid1')
  })
})

describe('Query.contracts', () => {
  it('works when no contracts', async () => {
    context.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([])

    const result = await contracts(undefined, {}, context, info)

    expect(result).toEqual([])
  })

  it('works for different statuses', async () => {
    const contract: ContractDto = {
      ...swedishApartmentInput,
      upcomingAgreement: {
        ...baseAgreement,
        type: 'SwedishApartment',
        lineOfBusiness: 'BRF',
        address: address,
        numberCoInsured: 2,
        squareMeters: 66,
      },
    }
    context.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([{ ...contract, status: ContractStatusDto.ACTIVE }])

    expect(
      (await contracts(undefined, {}, context, info))[0].status,
    ).toMatchObject<ActiveStatus>({
      pastInception: contract.masterInception,
      upcomingAgreementChange: {
        newAgreement: {
          ...baseOutputAgreement,
          address: address,
          numberCoInsured: 2,
          squareMeters: 66,
          type: SwedishApartmentLineOfBusiness.BRF,
        },
      },
    })

    context.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([{ ...contract, status: ContractStatusDto.PENDING }])
    expect(
      (await contracts(undefined, {}, context, info))[0].status,
    ).toMatchObject<PendingStatus>({
      pendingSince: '2020-12-01',
    })

    context.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([
        { ...contract, status: ContractStatusDto.ACTIVE_IN_FUTURE },
      ])
    expect(
      (await contracts(undefined, {}, context, info))[0].status,
    ).toMatchObject<ActiveInFutureStatus>({
      futureInception: contract.masterInception,
    })

    context.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([
        { ...contract, status: ContractStatusDto.ACTIVE_IN_FUTURE },
      ])
    expect(
      (await contracts(undefined, {}, context, info))[0].status,
    ).toMatchObject<ActiveInFutureStatus>({
      futureInception: contract.masterInception,
    })

    context.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([
        {
          ...contract,
          terminationDate: '2022-01-01',
          status: ContractStatusDto.TERMINATED_IN_FUTURE,
        },
      ])
    expect(
      (await contracts(undefined, {}, context, info))[0].status,
    ).toMatchObject<TerminatedInFutureStatus>({
      futureTermination: '2022-01-01',
    })

    context.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([
        {
          ...contract,
          terminationDate: '2022-01-01',
          status: ContractStatusDto.TERMINATED,
        },
      ])
    expect(
      (await contracts(undefined, {}, context, info))[0].status,
    ).toMatchObject<TerminatedStatus>({
      termination: '2022-01-01',
    })

    context.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([
        {
          ...contract,
          terminationDate: '2022-01-01',
          status: ContractStatusDto.ACTIVE_IN_FUTURE_AND_TERMINATED_IN_FUTURE,
        },
      ])
    expect(
      (await contracts(undefined, {}, context, info))[0].status,
    ).toMatchObject<ActiveInFutureAndTerminatedInFutureStatus>({
      futureInception: contract.masterInception,
      futureTermination: '2022-01-01',
    })
  })

  it('SwedishApartment', async () => {
    context.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([swedishApartmentInput])

    const result = await contracts(undefined, {}, context, info)

    expect(result).toMatchObject([swedishApartmentOutput])
  })

  it('SwedishHouse', async () => {
    context.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([swedishHouseInput])

    const result = await contracts(undefined, {}, context, info)

    expect(result).toMatchObject([swedishHouseOutput])
  })

  it('NorwegianHomeContent', async () => {
    context.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([norwegianHomeContentInput])

    const result = await contracts(undefined, {}, context, info)

    expect(result).toMatchObject<Contract[]>([norwegianHomeContentOutput])
  })

  it('NorwegianTravel', async () => {
    context.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([norwegianTravelInput])

    const result = await contracts(undefined, {}, context, info)

    expect(result).toMatchObject<Contract[]>([norwegianTravelOutput])
  })

  it('DanishHomeContent', async () => {
    context.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([danishHomeContentInput])

    const result = await contracts(undefined, {}, context, info)

    expect(result).toMatchObject<Contract[]>([danishHomeContentOutput])
  })

  it('DanishTravel', async () => {
    context.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([danishTravelInput])

    const result = await contracts(undefined, {}, context, info)

    expect(result).toMatchObject<Contract[]>([danishTravelOutput])
  })

  it('DanishAccident', async () => {
    context.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([danishAccidentInput])

    const result = await contracts(undefined, {}, context, info)

    expect(result).toMatchObject<Contract[]>([danishAccidentOutput])
  })

  it('HomeContent contracts are moved to the top', async () => {
    context.upstream.productPricing.getMemberContracts = () => Promise.resolve([
      { ...norwegianTravelInput, id: 'cid-travel' },
      { ...norwegianHomeContentInput, id: 'cid-hc' }
    ])

    const result = await contracts(undefined, {}, context, info)

    expect(result).toMatchObject<Contract[]>([
      { ...norwegianHomeContentOutput, id: 'cid-hc' },
      { ...norwegianTravelOutput, id: 'cid-travel' }
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

const context: Context = ({
  upstream: {
    productPricing: {
      getMemberContracts: () => Promise.resolve([]),
    },
  },
  strings: (key: string) => key,
} as unknown) as Context
const info: GraphQLResolveInfo = ({} as unknown) as GraphQLResolveInfo

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

const swedishApartmentInput: ContractDto = {
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
const swedishApartmentOutput: Contract = {
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
}

const swedishHouseInput: ContractDto = {
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
const swedishHouseOutput: Contract = {
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
}

const norwegianHomeContentInput: ContractDto = {
  ...baseContract,
  typeOfContract: 'NO_HOME_CONTENT_OWN',
  agreements: [
    {
      ...baseAgreement,
      type: 'NorwegianHomeContent',
      lineOfBusiness: 'RENT',
      address: address,
      numberCoInsured: 2,
      squareMeters: 77,
    },
  ],
}
const norwegianHomeContentOutput: Contract = {
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
}

const norwegianTravelInput: ContractDto = {
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
const norwegianTravelOutput: Contract = {
  ...baseOutput,
  typeOfContract: TypeOfContract.NO_TRAVEL,
  displayName: 'CONTRACT_DISPLAY_NAME_NO_TRAVEL',
  currentAgreement: {
    ...baseOutputAgreement,
    numberCoInsured: 2,
    type: NorwegianTravelLineOfBusiness.REGULAR,
  },
}

const danishHomeContentInput: ContractDto = {
  ...baseContract,
  typeOfContract: 'DK_HOME_CONTENT_OWN',
  agreements: [
    {
      ...baseAgreement,
      type: 'DanishHomeContent',
      address: address,
      numberCoInsured: 2,
      squareMeters: 98,
      lineOfBusiness: 'OWN',
    },
  ],
}
const danishHomeContentOutput: Contract = {
  ...baseOutput,
  typeOfContract: TypeOfContract.DK_HOME_CONTENT_OWN,
  displayName: 'CONTRACT_DISPLAY_NAME_DK_HOME_CONTENT_OWN',
  currentAgreement: {
    ...baseOutputAgreement,
    address: address,
    numberCoInsured: 2,
    squareMeters: 98,
    type: DanishHomeContentLineOfBusiness.OWN,
  },
}

const danishTravelInput: ContractDto = {
  ...baseContract,
  typeOfContract: 'DK_TRAVEL',
  agreements: [
    {
      ...baseAgreement,
      type: 'DanishTravel',
      address: address,
      numberCoInsured: 2,
      lineOfBusiness: 'REGULAR',
    },
  ],
}
const danishTravelOutput: Contract = {
  ...baseOutput,
  typeOfContract: TypeOfContract.DK_TRAVEL,
  displayName: 'CONTRACT_DISPLAY_NAME_DK_TRAVEL',
  currentAgreement: {
    ...baseOutputAgreement,
    address: address,
    numberCoInsured: 2,
    type: DanishTravelLineOfBusiness.REGULAR,
  },
}

const danishAccidentInput: ContractDto = {
  ...baseContract,
  typeOfContract: 'DK_ACCIDENT',
  agreements: [
    {
      ...baseAgreement,
      type: 'DanishAccident',
      address: address,
      numberCoInsured: 2,
      lineOfBusiness: 'REGULAR',
    },
  ],
}
const danishAccidentOutput: Contract = {
  ...baseOutput,
  typeOfContract: TypeOfContract.DK_ACCIDENT,
  displayName: 'CONTRACT_DISPLAY_NAME_DK_ACCIDENT',
  currentAgreement: {
    ...baseOutputAgreement,
    address: address,
    numberCoInsured: 2,
    type: DanishAccidentLineOfBusiness.REGULAR,
  },
}
