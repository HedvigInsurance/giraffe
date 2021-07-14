import { gql } from 'apollo-server-koa';
import { startApolloTesting } from './../test-utils/test-server';
import {
  AgreementStatusDto,
  ContractStatusDto,
} from './../api/upstreams/productPricing'
import { ContractDto } from '../api/upstreams/productPricing'

const apollo = startApolloTesting()
beforeEach(() => {
  apollo.upstream.productPricing.getTrials = () => Promise.resolve([])
  apollo.upstream.productPricing.getSelfChangeEligibility = () => Promise.resolve({ 
    blockers: ['FAKE']
  })
})


describe('Query.activeContractBundles', () => {
  it('works for zero contracts', async () => {
    apollo.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([])

    const result = await CALLS.activeContractBundles()

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
    apollo.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([apartment, house])

    const result = await CALLS.activeContractBundles()

    expect(result).toMatchSnapshot()
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
    apollo.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([homeContent, travel])

    const result = await CALLS.activeContractBundles()

    expect(result).toMatchSnapshot()
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
    apollo.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([homeContent, accident, travel])

    const result = await CALLS.activeContractBundles()

    expect(result).toMatchSnapshot()
  })

  it('Include ACTIVE and ACTIVE-ish contracts', async () => {
    const homeContent = {
      ...danishHomeContentInput,
      id: 'cid1',
      status: ContractStatusDto.ACTIVE
    }
    const accident = {
      ...danishAccidentInput,
      id: 'cid2',
      status: ContractStatusDto.TERMINATED_IN_FUTURE
    }
    const travel = {
      ...danishTravelInput,
      id: 'cid3',
      status: ContractStatusDto.TERMINATED
    }
    apollo.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([homeContent, accident, travel])

    const result = await CALLS.activeContractBundles()

    expect(result).toMatchSnapshot()
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
    apollo.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([homeContent, travel])

    const result = await CALLS.activeContractBundles()

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
    apollo.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([travel, homeContent, accident])

    const result = await CALLS.activeContractBundles()

    expect(result[0].contracts[0].id).toBe('cid-hc')
    expect(result[0].contracts[1].id).toBe('cid-accident')
    expect(result[0].contracts[2].id).toBe('cid-travel')
  })

  it('Moving flow story is visible if there are no blockers', async () => {
    const apartment = {
      ...swedishApartmentInput,
      id: 'cid1',
    }
    apollo.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([apartment])
    apollo.upstream.productPricing.getSelfChangeEligibility = () => Promise.resolve({ 
      blockers: []
    })
    apollo.upstream.productPricing.getContractMarketInfo = () => Promise.resolve({ 
      market: 'SWEDEN',
      preferredCurrency: 'SEK'
    })

    const result = await CALLS.activeContractBundles()

    expect(result[0].angelStories.addressChange).toBe('moving-flow-SE?contractBundleId=bundle-cid1')
  })
})

describe('Query.contracts', () => {
  it('works when no contracts', async () => {
    apollo.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([])

    const result = await CALLS.contracts()

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
    apollo.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([{ ...contract, status: ContractStatusDto.ACTIVE }])

    expect(
      (await CALLS.contracts())[0].status,
    ).toMatchSnapshot()

    apollo.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([{ ...contract, status: ContractStatusDto.PENDING }])
    expect(
      (await CALLS.contracts())[0].status,
    ).toMatchSnapshot()

    apollo.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([
        { ...contract, status: ContractStatusDto.ACTIVE_IN_FUTURE },
      ])
    expect(
      (await CALLS.contracts())[0].status,
    ).toMatchSnapshot()

    apollo.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([
        { ...contract, status: ContractStatusDto.ACTIVE_IN_FUTURE },
      ])
    expect(
      (await CALLS.contracts())[0].status,
    ).toMatchSnapshot()

    apollo.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([
        {
          ...contract,
          terminationDate: '2022-01-01',
          status: ContractStatusDto.TERMINATED_IN_FUTURE,
        },
      ])
    expect(
      (await CALLS.contracts())[0].status,
    ).toMatchSnapshot()

    apollo.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([
        {
          ...contract,
          terminationDate: '2022-01-01',
          status: ContractStatusDto.TERMINATED,
        },
      ])
    expect(
      (await CALLS.contracts())[0].status,
    ).toMatchSnapshot()

    apollo.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([
        {
          ...contract,
          terminationDate: '2022-01-01',
          status: ContractStatusDto.ACTIVE_IN_FUTURE_AND_TERMINATED_IN_FUTURE,
        },
      ])
    expect(
      (await CALLS.contracts())[0].status,
    ).toMatchSnapshot()
  })

  it('SwedishApartment', async () => {
    apollo.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([swedishApartmentInput])

    const result = await CALLS.contracts()

    expect(result).toMatchSnapshot()
  })

  it('SwedishHouse', async () => {
    apollo.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([swedishHouseInput])

    const result = await CALLS.contracts()

    expect(result).toMatchSnapshot()
  })

  it('NorwegianHomeContent', async () => {
    apollo.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([norwegianHomeContentInput])

    const result = await CALLS.contracts()

    expect(result).toMatchSnapshot()
  })

  it('NorwegianTravel', async () => {
    apollo.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([norwegianTravelInput])

    const result = await CALLS.contracts()

    expect(result).toMatchSnapshot()
  })

  it('DanishHomeContent', async () => {
    apollo.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([danishHomeContentInput])

    const result = await CALLS.contracts()

    expect(result).toMatchSnapshot()
  })

  it('DanishTravel', async () => {
    apollo.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([danishTravelInput])

    const result = await CALLS.contracts()

    expect(result).toMatchSnapshot()
  })

  it('DanishAccident', async () => {
    apollo.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([danishAccidentInput])

    const result = await CALLS.contracts()

    expect(result).toMatchSnapshot()
  })

  it('Contracts are sorted in natural order', async () => {
    apollo.upstream.productPricing.getMemberContracts = () => Promise.resolve([
      { ...danishTravelInput, id: 'cid-travel' },
      { ...danishHomeContentInput, id: 'cid-hc' },
      { ...danishAccidentInput, id: 'cid-accident' }
    ])

    const result = await CALLS.contracts()

    expect(result[0].id).toBe('cid-hc')
    expect(result[1].id).toBe('cid-accident')
    expect(result[2].id).toBe('cid-travel')
  })

  it('Trial is turned into a fake swedish apartment contract', async () => {
    apollo.upstream.productPricing.getMemberContracts = () => Promise.resolve([])
    apollo.upstream.productPricing.getTrials = () => Promise.resolve([
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

    const result = await CALLS.contracts()

    expect(result).toMatchSnapshot()
  })

})

describe('Query.hasContract', () => {
  it('is false when no contracts', async () => {
    apollo.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([])

    const result = await CALLS.hasContract()

    expect(result).toBe(false)
  })

  it('is true when some contracts', async () => {
    apollo.upstream.productPricing.getMemberContracts = () =>
      Promise.resolve([{ id: 'cid' } as ContractDto])

    const result = await CALLS.hasContract()

    expect(result).toBe(true)
  })
})

const CALLS = {
  activeContractBundles: async () => {
    const result = await apollo.query({
      query: gql`
      ${contractFields}
      query {
        activeContractBundles {
          id
          contracts {
            ...contractFields
          }
          angelStories {
            addressChange
          }
        }
      }
      `
    })
    return result.activeContractBundles
  },
  contracts: async () => {
    const result = await apollo.query({
      query: gql`
      ${contractFields}
      query {
        contracts {
          ...contractFields
        }
      }
      `
    })
    return result.contracts
  },
  hasContract: async () => {
    const result = await apollo.query({
      query: gql`
      query {
        hasContract
      }
      `
    })
    return result.hasContract
  }
}

const contractFields = gql`
  fragment contractFields on Contract {
    id
    holderMember
    inception
    createdAt
    typeOfContract
    switchedFromInsuranceProvider
    displayName
    status {
      __typename
      ... on PendingStatus {
        pendingSince
      }
      ... on ActiveInFutureStatus {
        futureInception
      }
      ... on ActiveInFutureAndTerminatedInFutureStatus {
        futureInception
        futureTermination
      }
      ... on TerminatedTodayStatus {
        today
      }
      ... on ActiveStatus {
        pastInception
      }
      ... on TerminatedInFutureStatus {
        futureTermination
      }
      ... on TerminatedStatus {
        termination
      }
    }
    currentAgreement {
      __typename
      ... on AgreementCore {
        id
        status
        activeFrom
        activeTo
        certificateUrl
        premium {
          amount
          currency
        }
      }
      ... on SwedishApartmentAgreement {
        numberCoInsured
        squareMeters
        address {
          postalCode
          street
        }
      }
      ... on SwedishHouseAgreement {
        numberCoInsured
        squareMeters
        address {
          postalCode
          street
        }
      }
      ... on NorwegianHomeContentAgreement {
        numberCoInsured
        squareMeters
        address {
          postalCode
          street
        }
      }
      ... on NorwegianTravelAgreement {
        numberCoInsured
      }
      ... on DanishHomeContentAgreement {
        numberCoInsured
        address {
          postalCode
          street
        }
      }
      ... on DanishAccidentAgreement {
        numberCoInsured
        address {
          postalCode
          street
        }
      }
      ... on DanishTravelAgreement {
        numberCoInsured
        address {
          postalCode
          street
        }
      }
    }
  }
`

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
  country: 'XX',
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
