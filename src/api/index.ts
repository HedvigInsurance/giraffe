import fetch from 'node-fetch'
import { ForwardHeaders } from '../context'
import {
  InsuranceStatus,
  InsuranceType,
  PerilCategory,
} from '../typings/generated-graphql-types'

interface InsuranceDto {
  currentTotalPrice: number
  addressStreet: string
  certificateUrl: string
  status: InsuranceStatus
  insuranceType: InsuranceType
  activeFrom: string
  categories: PerilCategory[]
  insuredAtOtherCompany: boolean
  personsInHousehold: number
  presaleInformationUrl: string
  currentInsurerName: string
  policyUrl: string
}

interface UserDto {
  safetyIncreasers: string[]
  selectedCashback: string
  selectedCashbackImageUrl: string
}

const defaultHeaders = (token: string, forwardedHeaders?: ForwardHeaders) => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/json',
  ...forwardedHeaders,
})

const register = (baseUrl: string, headers: ForwardHeaders) => async () => {
  const data = await fetch(`${baseUrl}/helloHedvig`, {
    method: 'POST',
    headers: headers as any,
  })
  return data.text()
}

const getInsurance = (baseUrl: string, headers: ForwardHeaders) => async (
  token: string,
): Promise<InsuranceDto> => {
  const data = await fetch(`${baseUrl}/insurance`, {
    headers: defaultHeaders(token, headers),
  })
  return data.json()
}

const getUser = (baseUrl: string, headers: ForwardHeaders) => async (
  token: string,
): Promise<UserDto> => {
  const data = await fetch(`${baseUrl}/member/me`, {
    headers: defaultHeaders(token, headers),
  })
  return data.json()
}

const logoutUser = (baseUrl: string, headers: ForwardHeaders) => async (
  token: string,
) => {
  await fetch(`${baseUrl}/logout`, {
    method: 'POST',
    headers: defaultHeaders(token, headers),
  })
}

const createProduct = (baseUrl: string, headers: ForwardHeaders) => async (
  token: string,
  body: any,
) => {
  const data = await fetch(`${baseUrl}/insurance/createProductWeb`, {
    method: 'POST',
    headers: {
      ...defaultHeaders(token, headers),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  return data.json()
}

export { getInsurance, getUser, logoutUser, register, createProduct }
