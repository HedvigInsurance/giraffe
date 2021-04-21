
import { HttpClient } from '../httpClient'

export interface ProductPricingClient {
  getContractMarketInfo(): Promise<ContractMarketInfoDto>
  getSelfChangeEligibility(): Promise<SelfChangeEligibilityDto>
}

interface ContractMarketInfoDto {
  market: string,
  preferredCurrency: string
}

interface SelfChangeEligibilityDto {
  blockers: string[]
}

export const createProductPricingClient = (client: HttpClient): ProductPricingClient => {
  return {
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
