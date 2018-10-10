import fetch, { Response } from 'node-fetch'
import { ForwardHeaders } from '../context'
import {
  BankIdStatus,
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
  memberId: string
  safetyIncreasers: string[]
  selectedCashback: string
  selectedCashbackImageUrl: string
}

interface SignDto {
  email: string
  ssn: string
  ipAddress: string
}

interface SignStatusDto {
  collectData: {
    status: BankIdStatus
    hintCode: string
  }
}

interface CreateProductDto {
  firstName: string
  lastName: string
  age: number
  address: {
    street: string
    city: string
    zipCode: string
  }
  productType: InsuranceType
  currentInsurer?: string
  houseHoldSize: number
  livingSpace: number
}

const checkStatus = (res: Response) => {
  if (res.status > 300) {
    throw new Error(`Failed to fetch, status: ${res.status}`)
  }
}

const defaultHeaders = (token: string, forwardedHeaders: ForwardHeaders) => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/json',
  ...forwardedHeaders,
})

const register = (baseUrl: string, headers: ForwardHeaders) => async () => {
  const data = await fetch(`${baseUrl}/helloHedvig`, {
    method: 'POST',
    headers: headers as any,
  })
  checkStatus(data)
  return data.text()
}

const getInsurance = (baseUrl: string, headers: ForwardHeaders) => async (
  token: string,
): Promise<InsuranceDto> => {
  const data = await fetch(`${baseUrl}/insurance`, {
    headers: defaultHeaders(token, headers),
  })
  checkStatus(data)
  return data.json()
}

const getUser = (baseUrl: string, headers: ForwardHeaders) => async (
  token: string,
): Promise<UserDto> => {
  const data = await fetch(`${baseUrl}/member/me`, {
    headers: defaultHeaders(token, headers),
  })
  checkStatus(data)
  return data.json()
}

const logoutUser = (baseUrl: string, headers: ForwardHeaders) => async (
  token: string,
) => {
  const data = await fetch(`${baseUrl}/logout`, {
    method: 'POST',
    headers: defaultHeaders(token, headers),
  })
  checkStatus(data)
}

const createProduct = (baseUrl: string, headers: ForwardHeaders) => async (
  token: string,
  body: CreateProductDto,
) => {
  const data = await fetch(`${baseUrl}/insurance/createProductWeb`, {
    method: 'POST',
    headers: {
      ...defaultHeaders(token, headers),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  checkStatus(data)
  return data.json()
}

const websign = (baseUrl: string, headers: ForwardHeaders) => async (
  token: string,
  body: SignDto,
) => {
  const data = await fetch(`${baseUrl}/v2/member/sign/websign`, {
    method: 'POST',
    headers: { ...defaultHeaders(token, headers) },
    body: JSON.stringify(body),
  })
  checkStatus(data)
}

const signStatus = (baseUrl: string, headers: ForwardHeaders) => async (
  token: string,
): Promise<SignStatusDto> => {
  const data = await fetch(`${baseUrl}/v2/member/sign/signStatus`, {
    headers: { ...defaultHeaders(token, headers) },
  })
  checkStatus(data)
  return data.json()
}

export {
  getInsurance,
  getUser,
  logoutUser,
  register,
  createProduct,
  websign,
  signStatus,
}
