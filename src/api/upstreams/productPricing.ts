import { HttpClient } from '../httpClient'

export interface ProductPricingClient {
  /**
   * Get a contract by ID.
   */
  getContract(id: string): Promise<Contract>
  /**
   * Get all the contracts tied to the user with the current session.
   */
  getMemberContracts(): Promise<Contract[]>
  /**
   * Get the Contract Market Info for the current user session.
   */
  getContractMarketInfo(): Promise<ContractMarketInfoDto>
  /**
   * Get the data related to whether the 'self change' functionality of contracts is available.
   */
  getSelfChangeEligibility(): Promise<SelfChangeEligibilityDto>
}

export interface ContractMarketInfoDto {
  market: string
  preferredCurrency: string
}

export interface SelfChangeEligibilityDto {
  blockers: string[]
}

export interface Contract {
  id: string
  status: ContractStatus
  typeOfContract: string
}

export enum ContractStatus {
  PENDING = 'PENDING',
  ACTIVE_IN_FUTURE = 'ACTIVE_IN_FUTURE',
  ACTIVE_IN_FUTURE_AND_TERMINATED_IN_FUTURE = 'ACTIVE_IN_FUTURE_AND_TERMINATED_IN_FUTURE',
  ACTIVE = 'ACTIVE',
  TERMINATED_TODAY = 'TERMINATED_TODAY',
  TERMINATED_IN_FUTURE = 'TERMINATED_IN_FUTURE',
  TERMINATED = 'TERMINATED',
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
  }
}
