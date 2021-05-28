
import { HttpClient } from '../httpClient'

export interface MemberServiceClient {
  getSelfMember(): Promise<MemberDto>
}

export interface MemberDto {
  firstName: string
  lastName: string
  memberId: string
  email: string
  phoneNumber: string
  ssn: string
  birthDate: string
}

export const createMemberServiceClient = (client: HttpClient): MemberServiceClient => {
  return {
    getSelfMember: async () => {
      const res = await client.get("/me")
      return res.json()
    }
  }
}
