import { ContractStatusDto } from '../api/upstreams/productPricing'
import gql from 'graphql-tag'
import { ContractMarketInfoDto } from '../api/upstreams/productPricing'
import { MemberDto } from '../api/upstreams/memberService'
import { startApolloTesting } from '../test-utils/test-server'

const { mutate, upstream } = startApolloTesting()

const createQuote = jest.fn().mockResolvedValue('qid1')
beforeEach(() => {
  createQuote.mockClear()
  createQuote.mockResolvedValue('qid1')

  upstream.memberService.getSelfMember = () => Promise.resolve(member)
  upstream.underwriter.createQuote = createQuote
})

// Tests

describe('createAddressChangeQuotes - SE_APARTMENT', () => {
  beforeEach(() => {
    mockMarket('SWEDEN')
    mockContracts(['SE_APARTMENT'])
  })

  it('non student rental', async () => {
    await MUTATIONS.createAddressChangeQuotes(seNonStudentRental)
    expect(createQuote.mock.calls).toMatchSnapshot()
  })
  it('student rental', async () => {
    await MUTATIONS.createAddressChangeQuotes(seStudentRental)
    expect(createQuote.mock.calls).toMatchSnapshot()
  })
  it('non student owned', async () => {
    await MUTATIONS.createAddressChangeQuotes(seNonStudentOwned)
    expect(createQuote.mock.calls).toMatchSnapshot()
  })
  it('student owned', async () => {
    await MUTATIONS.createAddressChangeQuotes(seStudentOwned)
    expect(createQuote.mock.calls).toMatchSnapshot()
  })
})

describe('createAddressChangeQuotes - SE_HOUSE', () => {
  beforeEach(() => {
    mockMarket('SWEDEN')
    mockContracts(['SE_HOUSE'])
  })

  it('works', async () => {
    await MUTATIONS.createAddressChangeQuotes(seHouse)
    expect(createQuote.mock.calls).toMatchSnapshot()
  })
})

describe('createAddressChangeQuotes - Norway', () => {
  beforeEach(() => {
    mockMarket('NORWAY')
    mockContracts(['NO_HOME_CONTENT_YOUTH_OWN', 'NO_TRAVEL_YOUTH'])
  })

  it('works', async () => {
    await MUTATIONS.createAddressChangeQuotes(noHomeContent)
    expect(createQuote.mock.calls).toMatchSnapshot()
  })
})

describe('createAddressChangeQuotes - Denmark', () => {
  beforeEach(() => {
    mockMarket('DENMARK')
    mockContracts(['DK_HOME_CONTENT_OWN', 'DK_TRAVEL', 'DK_ACCIDENT'])
  })

  it('works', async () => {
    await MUTATIONS.createAddressChangeQuotes(dkHomeContent)
    expect(createQuote.mock.calls).toMatchSnapshot()
  })
})

// Helpers

const MUTATIONS = {
  createAddressChangeQuotes: async (input: any) =>
    await mutate({
      mutation: gql`
        mutation($input: AddressChangeInput!) {
          createAddressChangeQuotes(input: $input) {
            ... on AddressChangeQuoteSuccess {
              quoteIds
            }
            ... on AddressChangeQuoteFailure {
              breachedUnderwritingGuidelines
            }
          }
        }
      `,
      variables: { input },
    }),
}

const mockMarket = (market: string) => {
  upstream.productPricing.getContractMarketInfo = () => Promise.resolve({
    ...marketInfo,
    market,
  })
}
  
const mockContracts = (typesOfContract: string[]) => {
  const mock = jest.fn()
  typesOfContract.forEach((typeOfContract, index) =>
    mock.mockResolvedValueOnce({
      id: `cid${index}`,
      status: ContractStatusDto.ACTIVE,
      typeOfContract,
    })
  )
  upstream.productPricing.getContract = mock
}

const member: MemberDto = {
  firstName: 'Test',
  lastName: 'Testsson',
  memberId: '123',
  email: 'test@test.com',
  phoneNumber: '070123456789',
  ssn: '201212121212',
  birthDate: '1991-07-27',
}

const marketInfo: ContractMarketInfoDto = {
  market: 'UNKNOWN',
  preferredCurrency: 'UNKNOWN',
}

const baseInput = {
  contractBundleId: 'bundle-abc',
  startDate: '2021-06-01',
  street: 'Fakestreet 123',
  zip: '12345',
  numberCoInsured: 2,
  livingSpace: 44,
}

const seNonStudentRental = {
  ...baseInput,
  type: 'APARTMENT',
  ownership: 'RENT',
  isStudent: false,
}

const seStudentRental = {
  ...baseInput,
  type: 'APARTMENT',
  ownership: 'RENT',
  isStudent: true,
}

const seNonStudentOwned = {
  ...baseInput,
  type: 'APARTMENT',
  ownership: 'BRF',
  isStudent: false,
}

const seStudentOwned = {
  ...baseInput,
  type: 'APARTMENT',
  ownership: 'BRF',
  isStudent: true,
}

const seHouse = {
  ...baseInput,
  type: 'HOUSE',
  ancillaryArea: 28,
  yearOfConstruction: 1912,
  numberOfBathrooms: 3,
  isSubleted: true,
  extraBuildings: [
    {
      type: 'GARAGE',
      area: 12,
      hasWaterConnected: false,
    },
  ],
  ownership: 'OWN',
  isStudent: false,
}

const noHomeContent = {
  ...baseInput,
  contractBundleId: 'bundle-abc,def', // two contracts
  type: 'APARTMENT',
  ownership: 'OWN',
  isYouth: true,
}

const dkHomeContent = {
  ...baseInput,
  contractBundleId: 'bundle-abc,def,ghi', // three contracts
  type: 'APARTMENT',
  ownership: 'OWN',
  isStudent: false,
}
