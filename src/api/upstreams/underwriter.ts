
import { HttpClient } from '../httpClient'

export interface UnderwriterClient {
  createQuote(body: CreateQuoteDto): Promise<CompleteQuoteResponseDto>
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

interface CompleteQuoteResponseDto {
  id: string
  price: number
  validTo: string
}

export const createUnderwriterClient = (client: HttpClient): UnderwriterClient => {
  return {
    createQuote: async (body) => {
      const res = await client.post("/quotes", body)
      return res.json()
    }
  }
}
