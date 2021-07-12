import {HttpClient} from '../httpClient'
import {Scalars} from "../../generated/graphql";

export interface ClaimServiceClient {
  getMemberClaims(): Promise<ClaimDto[]>
}

export interface ClaimDto {
  id: string
  status: ClaimStatusDto
  contractId?: string
  type?: string
  outcome?: ClaimOutcomeDto
  registrationDate: Scalars['Instant']
  closedAt?: Scalars['Instant']
  payout?: {
    amount: string,
    currency: string
  }
  files?: File[]
}

export type File = {
  signedUrl: string
  key: string
  bucket: string
};

export enum ClaimStatusDto {
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
