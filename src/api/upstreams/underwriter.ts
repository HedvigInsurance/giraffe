
import { HttpClient } from '../httpClient'

export interface UnderwriterClient {
  createQuote(body: CreateQuoteDto): Promise<QuoteCreationResult>
}

export interface CreateQuoteDto {
  memberId: String
  firstName: string
  lastName: string
  ssn: string
  birthDate: string
  startDate: string
  swedishApartmentData?: {
    street: string
    zipCode: string
    householdSize: number
    livingSpace: number
    subType: string
  }
  swedishHouseData?: {
    street: string
    zipCode: string
    householdSize: number
    livingSpace: number
    ancillaryArea: number
    yearOfConstruction: number
    numberOfBathrooms: number
    floor: number
    subleted: boolean
    extraBuildings: {
      type: string
      area: number
      hasWaterConnected: boolean
    }[]
  }
  norwegianHomeContentsData?: {
    street: string
    zipCode: string
    coInsured: number
    livingSpace: number
    youth: boolean
    subType: string
  }
  norwegianTravelData?: {
    coInsured: number
    youth: boolean
  }
  danishHomeContentsData?: {
    street: string
    zipCode: string
    livingSpace: number
    coInsured: number
    student: boolean
    subType: string
  }
  danishAccidentData?: {
    street: string
    zipCode: string
    coInsured: number
    student: boolean
  }
  danishTravelData?: {
    street: string
    zipCode: string
    coInsured: number
    student: boolean
  }
}

export type QuoteCreationResult = QuoteCreationSuccessDto | QuoteCreationFailureDto

export interface QuoteCreationSuccessDto {
  status: 'success',
  id: string
  price: number
  validTo: string
}

export interface QuoteCreationFailureDto {
  status: 'failure',
  breachedUnderwritingGuidelines: BreachedGuidelineDto[]
}

export interface BreachedGuidelineDto {
  code: string
}

export const createUnderwriterClient = (client: HttpClient): UnderwriterClient => {
  return {
    createQuote: async (body) => {
      // 422 means underwriting guidelines breached, and we should read the body
      const res = await client.post("/quotes", body, { validStatusCodes: [422] })
      const result = await res.json()
      if (res.status === 422) {
        return { status: 'failure', ...result}
      }
      return { status: 'success', ...result}
    }
  }
}
