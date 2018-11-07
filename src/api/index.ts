import { ApolloError } from 'apollo-server-errors'
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
  zipCode: string
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
  firstName: string
  lastName: string
  memberId: string
  safetyIncreasers: string[]
  selectedCashback: string
  selectedCashbackImageUrl: string
  ssn: string
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

interface CashbackDto {
  id: string
  name: string
  title: string
  description: string
  imageUrl: string
  selectedUrl: string
  paragraph: string
}

interface RegisterDirectDebitDto {
  firstName: string
  lastName: string
  personalNumber: string
}

interface DirectDebitOrderInfoDto {
  url: string
  orderId: string
}

interface TrackingDto {
  utmSource?: string
  utmMedium?: string
  utmContent?: string[]
  utmCampaign?: string
  utmTerm?: string[]
}

class ClientError extends ApolloError {
  constructor(message: string, code: string) {
    super(message, code)
    Object.defineProperty(this, 'name', { value: 'ClientError' })
  }
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
    validateStatus: (res) => {
      if (res.status === 403) {
        throw new ClientError('Already a member', 'ALREADY_MEMBER')
      }

      checkStatus(res)
    },
    token,
  })
}

const signStatus = async (
  token: string,
  headers: ForwardHeaders,
): Promise<SignStatusDto | null> => {
  const data = await callApi('/v2/member/sign/signStatus', {
    mergeOptions: {
      headers: (headers as any) as RequestInit['headers'],
    },
    token,
    validateStatus: (response) =>
      response.status <= 400 || response.status === 404,
  })

  if (data.status === 404) {
    return null
  }

  return data.json()
}

const getDirectDebitStatus = async (
  token: string,
  headers: ForwardHeaders,
): Promise<number> => {
  const data = await callApi('/directDebit/status', {
    mergeOptions: {
      headers: (headers as any) as RequestInit['headers'],
    },
    token,
    validateStatus: () => true,
  })
  return data.status
}

const setSelectedCashbackOption = async (
  token: string,
  headers: ForwardHeaders,
  cashbackOptionId: string,
): Promise<number> => {
  const data = await callApi(`/cashback?optionId=${cashbackOptionId}`, {
    mergeOptions: {
      headers: (headers as any) as RequestInit['headers'],
      method: 'POST',
    },
    token,
    validateStatus: () => true,
  })
  return data.status
}

const getCashbackOptions = async (
  token: string,
  headers: ForwardHeaders,
): Promise<CashbackDto[]> => {
  const data = await callApi('/cashback/options', {
    mergeOptions: {
      headers: (headers as any) as RequestInit['headers'],
    },
    token,
  })
  return data.json()
}

const setOfferClosed = async (token: string, headers: ForwardHeaders) =>
  callApi('/hedvig/onboarding/offerClosed', {
    mergeOptions: {
      headers: (headers as any) as RequestInit['headers'],
      method: 'POST',
    },
    token,
  })

const registerDirectDebit = async (
  token: string,
  headers: ForwardHeaders,
  body: RegisterDirectDebitDto,
): Promise<DirectDebitOrderInfoDto> => {
  const data = await callApi('/directDebit/register', {
    mergeOptions: {
      headers: (headers as any) as RequestInit['headers'],
      method: 'POST',
      body: JSON.stringify(body),
    },
    token,
  })
  return data.json()
}

const registerCampaign = (
  token: string,
  headers: ForwardHeaders,
  body: TrackingDto,
) =>
  callApi('/hedvig/register_campaign', {
    mergeOptions: {
      headers: (headers as any) as RequestInit['headers'],
      method: 'POST',
      body: JSON.stringify(body),
    },
    token,
  })

const assignTrackingId = (
  token: string,
  headers: ForwardHeaders,
  body: { trackingId: string },
) =>
  callApi('/member/trackingId', {
    mergeOptions: {
      headers: (headers as any) as RequestInit['headers'],
      method: 'POST',
      body: JSON.stringify(body),
    },
    token,
  })

export {
  getInsurance,
  getUser,
  logoutUser,
  register,
  createProduct,
  websign,
  signStatus,
  getDirectDebitStatus,
  setSelectedCashbackOption,
  getCashbackOptions,
  setOfferClosed,
  registerDirectDebit,
  registerCampaign,
  assignTrackingId,
}
