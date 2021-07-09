
import { HttpClient } from '../httpClient'
import {ClaimFile, Instant} from "../../typings/generated-graphql-types";

export interface ClaimServiceClient {
  getMemberClaims(): Promise<ClaimDto[]>
}

export interface ClaimDto {
  id: string
  status: ClaimtStatusDto
  contractId?: string
  type?: string
  outcome?: ClaimOutcomeDto
  registrationDate: Instant
  closedAt?: Instant
  payout?: {
    amount: string,
    currency: string
  }
  files?: ClaimFile[]
}

export enum ClaimtStatusDto {
  CREATED = 'CREATED',
  IN_PROGRESS = 'IN_PROGRESS',
  CLOSED = 'CLOSED',
  REOPENED = 'REOPENED',

}

export enum ClaimOutcomeDto {
  PAID = 'PAID',
  NOT_COMPENSATED = 'NOT_COMPENSATED',
  NOT_COVERED = 'NOT_COVERED'
}


export const createClaimServiceClient = (client: HttpClient): ClaimServiceClient => {
  return {
    getMemberClaims: async () => {
      const res = await client.get(`/claims`)
      return res.json()
    }
  }
}
