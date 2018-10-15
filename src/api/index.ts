import fetch, { RequestInit, Response } from 'node-fetch'
import * as config from '../config'
import { ForwardHeaders } from '../context'
import {
  BankIdStatus,
  InsuranceStatus,
  InsuranceType,
  PerilCategory,
  SignState,
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
  collectData?: {
    status: BankIdStatus
    hintCode: string
  }
  status: SignState
}

interface CreateProductDto {
  firstName: string
  lastName: string
  age: number
  address: {
    street: string
    city?: string
    zipCode: string
  }
  productType: InsuranceType
  currentInsurer?: string
  houseHoldSize: number
  livingSpace: number
}

type CallApi = (
  url: string,
  options?: {
    mergeOptions?: RequestInit
    validateStatus?: (response: Response) => void
    token?: string
  },
) => Promise<Response>

const callApi: CallApi = async (url, options = {}) => {
  const { mergeOptions, token, validateStatus = checkStatus } = options
  const headers: { [key: string]: string } = {
    Accept: 'application/json',
  }
  if (mergeOptions!.method === 'POST') {
    headers['Content-Type'] = 'application/json'
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const requestOptions: RequestInit = {
    ...mergeOptions,
    headers: { ...headers, ...mergeOptions!.headers },
  }

  const res = await fetch(`${config.BASE_URL}${url}`, requestOptions)
  validateStatus(res)
  return res
}

const checkStatus = (res: Response) => {
  if (res.status > 300) {
    throw new Error(`Failed to fetch, status: ${res.status}`)
  }
}

const register = async (headers: ForwardHeaders) => {
  const data = await callApi('/helloHedvig', {
    mergeOptions: {
      method: 'POST',
      headers: (headers as any) as RequestInit['headers'],
    },
  })
  return data.text()
}

const getInsurance = async (
  token: string,
  headers: ForwardHeaders,
): Promise<InsuranceDto> => {
  const data = await callApi('/insurance', {
    mergeOptions: {
      headers: (headers as any) as RequestInit['headers'],
    },
    token,
  })
  return data.json()
}

const getUser = async (
  token: string,
  headers: ForwardHeaders,
): Promise<UserDto> => {
  const data = await callApi('/member/me', {
    mergeOptions: {
      headers: (headers as any) as RequestInit['headers'],
    },
    token,
  })
  return data.json()
}

const logoutUser = async (token: string, headers: ForwardHeaders) => {
  await callApi('/logout', {
    mergeOptions: {
      method: 'POST',
      headers: (headers as any) as RequestInit['headers'],
    },
    token,
  })
}

const createProduct = async (
  token: string,
  headers: ForwardHeaders,
  body: CreateProductDto,
) => {
  const data = await callApi('/insurance/createProductWeb', {
    mergeOptions: {
      method: 'POST',
      headers: (headers as any) as RequestInit['headers'],
      body: JSON.stringify(body),
    },
    token,
  })
  return data.json()
}

const websign = async (
  token: string,
  headers: ForwardHeaders,
  body: SignDto,
) => {
  await callApi('/v2/member/sign/websign', {
    mergeOptions: {
      method: 'POST',
      headers: (headers as any) as RequestInit['headers'],
      body: JSON.stringify(body),
    },
    token,
  })
}

const signStatus = async (
  token: string,
  headers: ForwardHeaders,
): Promise<SignStatusDto> => {
  const data = await callApi('/v2/member/sign/signStatus', {
    mergeOptions: {
      headers: (headers as any) as RequestInit['headers'],
    },
    token,
  })
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
