import fetch from 'node-fetch'
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
}

const headers = (token: string) => ({
  Authorization: `Bearer ${token}`,
})

const register = (baseUrl: string) => async () => {
  const data = await fetch(`${baseUrl}/helloHedvig`, { method: 'POST' })
  return data.text()
}

const getInsurance = (baseUrl: string) => async (
  token: string,
): Promise<InsuranceDto> => {
  const data = await fetch(`${baseUrl}/insurance`, {
    headers: headers(token),
  })
  return data.json()
}

const getUser = (baseUrl: string) => async (
  token: string,
): Promise<{
  safetyIncreasers: string[]
}> => {
  const data = await fetch(`${baseUrl}/member/me`, {
    headers: headers(token),
  })
  return data.json()
}

const logoutUser = (baseUrl: string) => async (token: string) => {
  await fetch(`${baseUrl}/logout`, {
    method: 'POST',
    headers: headers(token),
  })
}

const createProduct = (baseUrl: string) => async (token: string, body: any) => {
  await fetch(`${baseUrl}/insurance/createProductWeb`, {
    method: 'POST',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export { getInsurance, getUser, logoutUser, register, createProduct }
