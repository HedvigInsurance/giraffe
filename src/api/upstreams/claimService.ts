import {HttpClient} from '../httpClient'

export interface ClaimServiceClient {
  getMemberClaims(onlyRecent: Boolean): Promise<ClaimDto[]>
}

export interface ClaimDto {
  id: string
  status: ClaimStatusDto
  contractId?: string
  type?: string
  outcome?: ClaimOutcomeDto
  registrationDate: string
  closedAt?: string
  payout?: {
    amount: string,
    currency: string
  }
  files: File[]
  audioURL?: string
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
    getMemberClaims: async (onlyRecent: Boolean) => {
      const res = await client.get(`/claims?onlyRecent=${onlyRecent}`)
      return res.json()
    }
  }
}
