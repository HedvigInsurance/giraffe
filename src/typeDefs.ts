const typeDefs = `
  type Query {
    insurance: Insurance!
    cashback: Cashback!
  }

  type Mutation {
    logout: Boolean
    createSession: String
    createOffer(details: OfferInput!): Insurance!
  }

  input OfferInput {
    firstName: String!
    lastName: String!
    age: Int!
    address: String!
    postalNumber: String!
    insuranceType: InsuranceType!
    sqm: Int!
    personsInHousehold: Int!
    previouslyInsured: Boolean!
  }

  type Insurance {
    address: String
    monthlyCost: Int
    safetyIncreasers: [String!]
    certificateUrl: String
    status: InsuranceStatus
    type: InsuranceType
    activeFrom: LocalDate

    perilCategories: [PerilCategory]
  }

  type PerilCategory {
    title: String
    description: String
    iconUrl: String
    perils: [Peril]
  }

  type Peril {
    id: ID
    title: String
    imageUrl: String
    description: String
  }

  enum InsuranceStatus {
    PENDING
    ACTIVE
    INACTIVE
    INACTIVE_WITH_START_DATE
    TERMINATED
  }

  enum InsuranceType {
    RENT
    BRF
    STUDENT_RENT
    STUDENT_BRF
  }

  type Cashback {
    id: ID
    name: String
    imageUrl: String
  }

  scalar LocalDate
`

export { typeDefs }
