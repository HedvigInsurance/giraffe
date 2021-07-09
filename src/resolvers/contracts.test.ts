import { gql } from 'apollo-server-koa';
import { startApolloTesting } from './../test-utils/test-server';
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
  ExtraBuildingType,
  ContractStatus,
  Agreement
} from './../typings/generated-graphql-types'
import {
  AgreementStatusDto,
  ContractStatusDto,
} from './../api/upstreams/productPricing'
import { GraphQLResolveInfo } from 'graphql'
import { ContractDto } from '../api/upstreams/productPricing'
import { Context } from '../context'
import { activeContractBundles, contracts } from './contracts'
import {
  AgreementStatus,
  Contract,
  SwedishApartmentLineOfBusiness,
  TypeOfContract,
} from '../typings/generated-graphql-types'

const apollo = startApolloTesting()

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
        id: 'bundle-cid1',
        contracts: [
          {
            ...swedishApartmentOutput,
            id: 'cid1',
          },
        ],
        angelStories: {}
      },
      {
        id: 'bundle-cid2',
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
        id: 'bundle-cid1,cid2',
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
    const accident = {
      ...danishAccidentInput,
      id: 'cid2',
    }
    const travel = {
      ...danishTravelInput,
      id: 'cid3',
    }
    context.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([homeContent, accident, travel])

    const result = await activeContractBundles(undefined, {}, context, info)

    expect(result).toMatchObject<ContractBundle[]>([
      {
        id: 'bundle-cid1,cid2,cid3',
        contracts: [
          {
            ...danishHomeContentOutput,
            id: 'cid1',
          },
          {
            ...danishAccidentOutput,
            id: 'cid2',
          },
          {
            ...danishTravelOutput,
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
        id: 'bundle-cid1',
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

    expect(result[0].id).toBe('bundle-a,z')
  })

  it('Contracts are sorted in natural order', async () => {
    const travel = {
      ...danishTravelInput,
      id: 'cid-travel',
    }
    const homeContent = {
      ...danishHomeContentInput,
      id: 'cid-hc',
    }
    const accident = {
      ...danishAccidentInput,
      id: 'cid-accident',
    }
    context.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([travel, homeContent, accident])

    const result = await activeContractBundles(undefined, {}, context, info)

    expect(result[0].contracts[0].id).toBe('cid-hc')
    expect(result[0].contracts[1].id).toBe('cid-accident')
    expect(result[0].contracts[2].id).toBe('cid-travel')
  })

  it('Moving flow story is visible if there are no blockers', async () => {
    const apartment = {
      ...swedishApartmentInput,
      id: 'cid1',
    }
    context.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([apartment])
    context.upstream.productPricing.getSelfChangeEligibility = () => Promise.resolve({ 
      blockers: []
    })
    context.upstream.productPricing.getContractMarketInfo = () => Promise.resolve({ 
      market: 'SWEDEN',
      preferredCurrency: 'SEK'
    })

    const result = await activeContractBundles(undefined, {}, context, info)

    expect(result[0].angelStories.addressChange).toBe('moving-flow-SE?contractBundleId=bundle-cid1')
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

  it('Contracts are sorted in natural order', async () => {
    context.upstream.productPricing.getMemberContracts = () => Promise.resolve([
      { ...danishTravelInput, id: 'cid-travel' },
      { ...danishHomeContentInput, id: 'cid-hc' },
      { ...danishAccidentInput, id: 'cid-accident' }
    ])

    const result = await contracts(undefined, {}, context, info)

    expect(result).toMatchObject<Contract[]>([
      { ...danishHomeContentOutput, id: 'cid-hc' },
      { ...danishAccidentOutput, id: 'cid-accident' },
      { ...danishTravelOutput, id: 'cid-travel' },
    ])
  })

  it('Trial is turned into a fake swedish apartment contract', async () => {
    context.upstream.productPricing.getMemberContracts = () => Promise.resolve([])
    context.upstream.productPricing.getTrials = () => Promise.resolve([
      {
        id: 'tid1',
        memberId: 'mid1',
        fromDate: '2021-06-01',
        toDate: '2021-07-01',
        type: 'SE_APARTMENT_BRF',
        status: 'TERMINATED_IN_FUTURE',
        partner: 'AVY',
        address: {
          street: 'Fakestreet 123',
          zipCode: '12345',
          city: 'Atlantis',
          livingSpace: 44
        },
        createdAt: '2021-05-31T10:00:00Z',
        certificateUrl: 'https://hedvig.com/cert',
      }
    ])
    const fakeContract: Contract = {
      id: 'fakecontract:tid1',
      holderMember: 'mid1',
      typeOfContract: TypeOfContract.SE_APARTMENT_BRF,
      status: {
        __typename: 'TerminatedInFutureStatus',
        futureTermination: '2021-07-01'
      } as ContractStatus,
      displayName: 'CONTRACT_DISPLAY_NAME_SE_APARTMENT_BRF',
      createdAt: '2021-05-31T10:00:00Z',
      currentAgreement: {
        __typename: 'SwedishApartmentAgreement',
        id: 'fakeagreement:tid1',
        activeFrom: '2021-06-01',
        activeTo: '2021-07-01',
        premium: {
          amount: '0',
          currency: 'SEK'
        },
        certificateUrl: 'https://hedvig.com/cert',
        status: AgreementStatus.ACTIVE,
        address: {
          street: 'Fakestreet 123',
          postalCode: '12345'
        },
        numberCoInsured: 0,
        squareMeters: 44,
        type: SwedishApartmentLineOfBusiness.BRF,
      } as Agreement
    }

    const result = await contracts(undefined, {}, context, info)

    expect(result).toMatchObject<Contract[]>([fakeContract])
  })

})

describe('Query.hasContract', () => {
  const GQL_QUERY = gql`
  query {
    hasContract
  }
  `

  it('is false when no contracts', async () => {
    apollo.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([])

    const result = await apollo.query({ query: GQL_QUERY })

    expect(result.data.hasContract).toBe(false)
  })

  it('is true when some contracts', async () => {
    apollo.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([{ id: 'cid' } as ContractDto])

    const result = await apollo.query({ query: GQL_QUERY })

    expect(result.data.hasContract).toBe(true)
  })
})

const context: Context = ({
  upstream: {
    productPricing: {
      getMemberContracts: () => Promise.resolve([]),
      getTrials: () => Promise.resolve([]),
      getSelfChangeEligibility: () => Promise.resolve(
        { blockers: [ "FAKE" ] }
      )
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
  hasQueuedRenewal: false
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
          type: 'GARAGE',
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
        type: ExtraBuildingType.GARAGE,
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
