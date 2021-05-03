
import { HttpClient } from '../httpClient'

export interface ProductPricingClient {
  getMemberContracts(): Promise<ContractDto[]>
  getContractMarketInfo(): Promise<ContractMarketInfoDto>
  getSelfChangeEligibility(): Promise<SelfChangeEligibilityDto>
}

export interface ContractMarketInfoDto {
  market: string,
  preferredCurrency: string
}

export interface SelfChangeEligibilityDto {
  blockers: string[]
}

/*
data class Contract(
  val id: UUID,
  val holderMemberId: String,
  val switchedFrom: String?,
  val masterInception: LocalDate?,
  val status: ContractStatus,
  val typeOfContract: TypeOfContract,
  @get:JsonProperty("isTerminated")
  val isTerminated: Boolean,
  val terminationDate: LocalDate?,
  val currentAgreementId: UUID,
  val hasPendingAgreement: Boolean,
  val agreements: List<Agreement>,
  val genericAgreements: List<GenericAgreement>,
  val hasQueuedRenewal: Boolean,
  val renewal: Renewal?,
  val preferredCurrency: CurrencyUnit,
  val market: Market,
  val signSource: SignSource?,
  val contractTypeName: String,
  val createdAt: Instant
)
*/
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
  renewal?: RenewalDto
  createdAt: string
}

export interface AgreementType {
  id: string
  fromDate?: string
  toDate?: string
  basePremium: string
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
}
export interface NorwegianHomeContentAgreementDto extends AgreementType {
  type: "NorwegianHomeContent"
}
export interface NorwegianTravelAgreementDto extends AgreementType {
  type: "NorwegianTravel"
}
export interface DanishHomeContentAgreementDto extends AgreementType {
  type: "DanishHomeContent"
}
export interface DanishAccidentAgreementDto extends AgreementType {
  type: "DanishAccident"
}
export interface DanishTravelAgreementDto extends AgreementType {
  type: "DanishTravel"
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
  TERMINATED = 'TERMINATED'
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

export const createProductPricingClient = (client: HttpClient): ProductPricingClient => {
  return {
    getMemberContracts: async () => {
      const res = await client.get("/contracts")
      return res.json()
    },
    getContractMarketInfo: async () => {
      const res = await client.get("/contracts/market-info")
      return res.json()
    },
    getSelfChangeEligibility: async () => {
      const res = await client.get("/contracts/selfChange/eligibility")
      return res.json()
    }
  }
}
