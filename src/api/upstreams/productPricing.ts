
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
  holderMemberId: string,
  switchedFrom?: string
  masterInception?: string,
  status: ContractStatus,
  typeOfContract: string,
  isTerminated: boolean,
  terminationDate?: string,
  currentAgreementId: string,
  hasPendingAgreement: boolean,
  agreements: AgreementDto[],
  renewal?: RenewalDto,
  createdAt: string
}

export type AgreementDto = 
  SwedishApartmentAgreementDto |
  SwedishHouseAgreementDto |
  NorwegianHomeContentAgreementDto |
  NorwegianTravelAgreementDto |
  DanishHomeContentAgreementDto |
  DanishAccidentAgreementDto |
  DanishTravelAgreementDto

export interface SwedishApartmentAgreementDto {
  type: "SwedishApartment"
}
export interface SwedishHouseAgreementDto {
  type: "SwedishHouse"
}
export interface NorwegianHomeContentAgreementDto {
  type: "NorwegianHomeContent"
}
export interface NorwegianTravelAgreementDto {
  type: "NorwegianTravel"
}
export interface DanishHomeContentAgreementDto {
  type: "DanishHomeContent"
}
export interface DanishAccidentAgreementDto {
  type: "DanishAccident"
}
export interface DanishTravelAgreementDto {
  type: "DanishTravel"
}

export interface RenewalDto {
  renewalDate: string,
  draftCertificateUrl?: string,
  draftOfAgreementId?: string
}

export enum ContractStatus {
  PENDING = 'PENDING',
  ACTIVE_IN_FUTURE = 'ACTIVE_IN_FUTURE',
  ACTIVE_IN_FUTURE_AND_TERMINATED_IN_FUTURE = 'ACTIVE_IN_FUTURE_AND_TERMINATED_IN_FUTURE',
  ACTIVE = 'ACTIVE',
  TERMINATED_TODAY = 'TERMINATED_TODAY',
  TERMINATED_IN_FUTURE = 'TERMINATED_IN_FUTURE',
  TERMINATED = 'TERMINATED'
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
