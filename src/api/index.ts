import { format } from 'date-fns'
import fetch, { RequestInit, Response } from 'node-fetch'
import * as config from '../config'
import { ForwardHeaders } from '../context'
import {
  BankIdStatus,
  ChatResponseFileInput,
  InsuranceCost,
  InsuranceStatus,
  InsuranceType,
  MessageBodyChoicesCore,
  MessageBodySingleSelect,
  PerilCategory,
  SignState,
} from '../typings/generated-graphql-types'
import {
  ChatResponseSingleSelectInput,
  ChatResponseTextInput,
  ChatState,
  MessageBody,
} from './../typings/generated-graphql-types'

interface InsuranceDto {
  cost: InsuranceCost
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
  livingSpace: number
}

interface UserDto {
  firstName: string
  lastName: string
  memberId: string
  email: string
  phoneNumber: string
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

interface MessageHeaderDto {
  messageId: string
  fromId: number
  timeStamp: string
  richTextChatCompatible: boolean
  editAllowed: boolean
  shouldRequestPushNotifications: boolean
  pollingInterval: number
  loadingIndicator: string
  markedAsRead: boolean
  statusMessage?: string
}

interface AvatarDto {
  name: string
  URL: string
  width: number
  height: number
  duration: number
}

export interface MessageDto {
  id: string
  globalId: string
  header: MessageHeaderDto
  body: MessageBody
}

export interface ChatDto {
  state: ChatState
  messages: MessageDto[]
  fabOptions: FABOption[]
}

interface FABOption {
  text: string
  triggerUrl: string
  enabled: boolean
}

interface TrackingDto {
  utmSource?: string
  utmMedium?: string
  utmContent?: string[]
  utmCampaign?: string
  utmTerm?: string[]
}

interface PushTokenDto {
  token: string
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
  await validateStatus(res)
  return res
}

const checkStatus = async (res: Response) => {
  if (res.status > 300) {
    throw new Error(
      `Failed to fetch, status: ${res.status} ${JSON.stringify(
        await res.text(),
        null,
        4,
      )}`,
    )
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

  const json = await data.json()

  return {
    ...json,
    activeFrom: format(json.activeFrom, 'YYYY-MM-DDTHH:mm:ss'),
  }
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

const getChat = async (
  token: string,
  headers: ForwardHeaders,
): Promise<ChatDto> => {
  const data = await callApi('/v2/app', {
    mergeOptions: {
      headers: (headers as any) as RequestInit['headers'],
      method: 'GET',
    },
    token,
  })
  return data.json()
}

const setChatResponse = async (
  token: string,
  headers: ForwardHeaders,
  responseInput: ChatResponseTextInput,
): Promise<boolean> => {
  const { messages } = await getChat(token, headers)

  const responseMessage = messages.find(
    (message) => String(message.globalId) === String(responseInput.globalId),
  )

  if (!responseMessage) {
    throw new Error("Tried to respond to a message that doesn't exist")
  }

  const responseMessageWithText = {
    ...responseMessage,
    body: {
      ...responseMessage.body,
      text: responseInput.body.text,
    },
  }

  const data = await callApi('/response', {
    mergeOptions: {
      headers: (headers as any) as RequestInit['headers'],
      method: 'POST',
      body: JSON.stringify(responseMessageWithText, null, 4),
    },
    token,
  })

  return data.status === 204
}

export const setChatSingleSelectResponse = async (
  token: string,
  headers: ForwardHeaders,
  responseInput: ChatResponseSingleSelectInput,
): Promise<boolean> => {
  const { messages } = await getChat(token, headers)

  const responseMessage = messages.find(
    (message) => String(message.globalId) === String(responseInput.globalId),
  )

  if (!responseMessage) {
    throw new Error("Tried to respond to a message that doesn't exist")
  }

  const responseBody = responseMessage.body as MessageBodySingleSelect
  const selectedChoice = responseBody.choices!.find(
    (choice) => choice!.value === responseInput.body.selectedValue,
  ) as MessageBodyChoicesCore

  selectedChoice.selected = true

  const otherChoices = responseBody.choices!.filter(
    (choice) => choice!.value === responseInput.body.selectedValue,
  )

  const responseMessageWithSelectedChoice = {
    ...responseMessage,
    body: {
      ...responseMessage.body,
      choices: [selectedChoice, ...otherChoices],
    },
  }

  const data = await callApi('/response', {
    mergeOptions: {
      headers: (headers as any) as RequestInit['headers'],
      method: 'POST',
      body: JSON.stringify(responseMessageWithSelectedChoice, null, 4),
    },
    token,
  })

  return data.status === 204
}

export const setChatFileResponse = async (
  token: string,
  headers: ForwardHeaders,
  responseInput: ChatResponseFileInput,
): Promise<boolean> => {
  const { messages } = await getChat(token, headers)

  const responseMessage = messages.find(
    (message) => String(message.globalId) === String(responseInput.globalId),
  )

  if (!responseMessage) {
    throw new Error("Tried to respond to a message that doesn't exist")
  }

  const responseMessageWithFile = {
    ...responseMessage,
    body: {
      ...responseMessage.body,
      ...responseInput.body,
      type: 'file_upload',
    },
  }

  const data = await callApi('/response', {
    mergeOptions: {
      headers: (headers as any) as RequestInit['headers'],
      method: 'POST',
      body: JSON.stringify(responseMessageWithFile, null, 4),
    },
    token,
  })

  return data.status === 204
}

export const setChatAudioResponse = async (
  token: string,
  headers: ForwardHeaders,
  responseInput: { globalId: string; url: string },
): Promise<boolean> => {
  const { messages } = await getChat(token, headers)

  const responseMessage = messages.find(
    (message) => String(message.globalId) === String(responseInput.globalId),
  )

  if (!responseMessage) {
    throw new Error("Tried to respond to a message that doesn't exist")
  }

  const responseMessageWithAudio = {
    ...responseMessage,
    body: {
      ...responseMessage.body,
      type: 'audio',
      url: responseInput.url,
    },
  }

  const data = await callApi('/response', {
    mergeOptions: {
      headers: (headers as any) as RequestInit['headers'],
      method: 'POST',
      body: JSON.stringify(responseMessageWithAudio, null, 4),
    },
    token,
  })

  return data.status === 204
}

const resetConversation = async (token: string, headers: ForwardHeaders) => {
  await callApi('/chat/reset', {
    mergeOptions: {
      method: 'POST',
      headers: (headers as any) as RequestInit['headers'],
    },
    token,
  })
}

const editLastResponse = async (token: string, headers: ForwardHeaders) => {
  await callApi('/chat/edit', {
    mergeOptions: {
      method: 'POST',
      headers: (headers as any) as RequestInit['headers'],
    },
    token,
  })
}

const getAvatars = async (
  token: string,
  headers: ForwardHeaders,
): Promise<AvatarDto[]> => {
  const res = await callApi('/avatars', {
    mergeOptions: {
      method: 'GET',
      headers: (headers as any) as RequestInit['headers'],
    },
    token,
  })
  return res.json()
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

const postEmail = (
  token: string,
  headers: ForwardHeaders,
  body: { email: string },
) =>
  callApi('/member/email', {
    mergeOptions: {
      headers: (headers as any) as RequestInit['headers'],
      method: 'POST',
      body: JSON.stringify(body),
    },
    token,
  })

const postPhoneNumber = (
  token: string,
  headers: ForwardHeaders,
  body: { phoneNumber: string },
) =>
  callApi('/member/phonenumber', {
    mergeOptions: {
      headers: (headers as any) as RequestInit['headers'],
      method: 'POST',
      body: JSON.stringify(body),
    },
    token,
  })

const registerPushToken = (
  token: string,
  headers: ForwardHeaders,
  body: PushTokenDto,
) =>
  callApi('/v2/app/push-token', {
    mergeOptions: {
      headers: (headers as any) as RequestInit['headers'],
      method: 'POST',
      body: JSON.stringify(body),
    },
    token,
  })

const triggerFreeTextChat = (token: string, headers: ForwardHeaders) =>
  callApi('/v2/app/fabTrigger/CHAT', {
    mergeOptions: {
      headers: (headers as any) as RequestInit['headers'],
      method: 'POST',
    },
    token,
  })

const triggerClaimChat = (token: string, headers: ForwardHeaders) =>
  callApi('/v2/app/fabTrigger/REPORT_CLAIM', {
    mergeOptions: {
      headers: (headers as any) as RequestInit['headers'],
      method: 'POST',
    },
    token,
  })

const triggerCallMeChat = (token: string, headers: ForwardHeaders) =>
  callApi('/v2/app/fabTrigger/CALL_ME', {
    mergeOptions: {
      headers: (headers as any) as RequestInit['headers'],
      method: 'POST',
    },
    token,
  })

const performEmailSign = (token: string, headers: ForwardHeaders) =>
  callApi('/hedvig/emailSign', {
    mergeOptions: {
      headers: (headers as any) as RequestInit['headers'],
      method: 'POST',
    },
    token,
  })

const markMessageAsRead = (
  globalId: string,
  token: string,
  headers: ForwardHeaders,
): Promise<MessageDto> =>
  callApi('/v2/app/markAsRead', {
    mergeOptions: {
      headers: (headers as any) as RequestInit['headers'],
      method: 'POST',
      body: JSON.stringify({
        globalId,
      }),
    },
    token,
  }).then((res) => res.json())


export interface BankIdAuthDto {
  autoStartToken: string
}

const authMember = (
  token: string,
  headers: ForwardHeaders,
): Promise<BankIdAuthDto> =>
  callApi('/v2/member/bankId/auth', {
    mergeOptions: {
      headers: (headers as any) as RequestInit['headers'],
      method: 'POST',
    },
    token,
  }).then((res) => res.json())

export {
  setChatResponse,
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
  getChat,
  getAvatars,
  resetConversation,
  editLastResponse,
  registerCampaign,
  assignTrackingId,
  postEmail,
  postPhoneNumber,
  registerPushToken,
  triggerFreeTextChat,
  triggerClaimChat,
  triggerCallMeChat,
  performEmailSign,
  markMessageAsRead,
  authMember,
}
