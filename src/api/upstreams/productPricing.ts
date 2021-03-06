import { HttpClient } from '../httpClient'

export interface ProductPricingClient {
  /**
   * Get a contract by ID.
   */
  getContract(id: string): Promise<ContractDto>
  /**
   * Get all the contracts tied to the user with the current session.
   */
  getMemberContracts(): Promise<ContractDto[]>
  /**
   * Get the Contract Market Info for the current user session.
   */
  getContractMarketInfo(): Promise<ContractMarketInfoDto>
  /**
   * Get the data related to whether the 'self change' functionality of contracts is available.
   */
  getSelfChangeEligibility(): Promise<SelfChangeEligibilityDto>
  /**
   * Get the "trial insurances" for this member, if there are any.
   */
  getTrials(): Promise<TrialDto[]>
}

export interface ContractMarketInfoDto {
  market: string
  preferredCurrency: string
}

export interface SelfChangeEligibilityDto {
  blockers: string[]
}

export interface ContractDto {
  id: string
  holderMemberId: string
  switchedFrom?: string
  masterInception?: string
  status: ContractStatusDto
  typeOfContract: string
  isTerminated: boolean
  terminationDate?: string
  currentAgreementId: string
  hasPendingAgreement: boolean
  agreements: AgreementDto[]
  upcomingAgreement?: AgreementDto
  hasQueuedRenewal: boolean
  renewal?: RenewalDto
  createdAt: string
}

export interface AgreementType {
  id: string
  fromDate?: string
  toDate?: string
  basePremium: {
    amount: string,
    currency: string
  }
  certificateUrl?: string
  status: AgreementStatusDto
}

export type AgreementDto = 
  SwedishApartmentAgreementDto |
  SwedishHouseAgreementDto |
  NorwegianHomeContentAgreementDto |
  NorwegianTravelAgreementDto |
  DanishHomeContentAgreementDto |
  DanishAccidentAgreementDto |
  DanishTravelAgreementDto

export interface SwedishApartmentAgreementDto extends AgreementType {
  type: "SwedishApartment"
  lineOfBusiness: string
  address: AddressDto
  numberCoInsured: number
  squareMeters: number
}
export interface SwedishHouseAgreementDto extends AgreementType {
  type: "SwedishHouse"
  address: AddressDto,
  numberCoInsured: number,
  squareMeters: number,
  ancillaryArea: number,
  yearOfConstruction: number,
  numberOfBathrooms: number,
  extraBuildings: ExtraBuildingDto[],
  isSubleted: boolean
}
export interface NorwegianHomeContentAgreementDto extends AgreementType {
  type: "NorwegianHomeContent"
  lineOfBusiness: string
  address: AddressDto
  numberCoInsured: number
  squareMeters: number
}
export interface NorwegianTravelAgreementDto extends AgreementType {
  type: "NorwegianTravel"
  lineOfBusiness: string
  numberCoInsured: number
}
export interface DanishHomeContentAgreementDto extends AgreementType {
  type: "DanishHomeContent"
  address: AddressDto,
  numberCoInsured: number,
  squareMeters: number,
  lineOfBusiness: string
}
export interface DanishAccidentAgreementDto extends AgreementType {
  type: "DanishAccident"
  address: AddressDto,
  numberCoInsured: number,
  lineOfBusiness: string
}
export interface DanishTravelAgreementDto extends AgreementType {
  type: "DanishTravel"
  address: AddressDto,
  numberCoInsured: number,
  lineOfBusiness: string
}

export interface RenewalDto {
  renewalDate: string
  draftCertificateUrl?: string
  draftOfAgreementId?: string
}

export enum ContractStatusDto {
  PENDING = 'PENDING',
  ACTIVE_IN_FUTURE = 'ACTIVE_IN_FUTURE',
  ACTIVE_IN_FUTURE_AND_TERMINATED_IN_FUTURE = 'ACTIVE_IN_FUTURE_AND_TERMINATED_IN_FUTURE',
  ACTIVE = 'ACTIVE',
  TERMINATED_TODAY = 'TERMINATED_TODAY',
  TERMINATED_IN_FUTURE = 'TERMINATED_IN_FUTURE',
  TERMINATED = 'TERMINATED',
}

export enum AgreementStatusDto {
  PENDING = 'PENDING',
  ACTIVE_IN_FUTURE = 'ACTIVE_IN_FUTURE',
  ACTIVE = 'ACTIVE',
  ACTIVE_IN_PAST = 'ACTIVE_IN_PAST',
  TERMINATED = 'TERMINATED'
}

export interface AddressDto {
  street: string
  coLine?: string
  postalCode: string
  city?: string
  country: string
  apartment?: string
  floor?: string
}

export interface ExtraBuildingDto {
  type: string
  area: number
  displayName: string
  hasWaterConnected: boolean
}

export interface TrialDto {
  id: string
  memberId: string
  fromDate: string
  toDate: string
  type: string
  status: string
  partner: string
  address: TrialAddressDto
  createdAt: string
  certificateUrl?: string
}

export interface TrialAddressDto {
  street: string
  city: string
  zipCode: string
  livingSpace?: number
  apartmentNo?: string
  floor?: string
}

export const createProductPricingClient = (
  client: HttpClient,
): ProductPricingClient => {
  return {
    getContract: async (id) => {
      const res = await client.get(`/contracts/${id}`)
      return res.json()
    },
    getMemberContracts: async () => {
      const res = await client.get('/contracts')
      return res.json()
    },
    getContractMarketInfo: async () => {
      const res = await client.get('/contracts/market-info')
      return res.json()
    },
    getSelfChangeEligibility: async () => {
      const res = await client.get('/contracts/selfChange/eligibility')
      return res.json()
    },
    getTrials: async () => {
      const res = await client.get('/trial')
      return res.json()
    },
  }
}
