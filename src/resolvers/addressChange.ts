import { MemberDto } from './../api/upstreams/memberService';
import { QuoteCreationResult, CreateQuoteDto, QuoteInitiatedFromDto } from './../api/upstreams/underwriter';
import {
  MutationToCreateAddressChangeQuotesResolver,
  AddressChangeQuoteResult,
  PossibleAddressChangeQuoteResultTypeNames,
  AddressChangeInput,
  AddressOwnership,
  AddressHomeType
} from './../typings/generated-graphql-types'

import { ContractDto, ContractMarketInfoDto, ContractStatusDto } from '../api/upstreams/productPricing'
import { Typenamed } from '../utils/types';

export const createAddressChangeQuotes: MutationToCreateAddressChangeQuotesResolver = async (
  _parent,
  args,
  { upstream },
): Promise<AddressChangeQuoteResult> => {
  const contractIds = args.input.contractBundleId.replace('bundle-', '').split(',')
  const [
    member,
    contracts,
    marketInfo
  ] = await Promise.all([
    upstream.memberService.getSelfMember(),
    Promise.all(contractIds.map(upstream.productPricing.getContract)),
    upstream.productPricing.getContractMarketInfo()
  ])

  const tasks = contracts
    .filter((c) => c.status == ContractStatusDto.ACTIVE)
    .map((contract) => {
      const body = convertAddressChangeToSelfChangeBody(args.input, member, contract, marketInfo)
      return upstream.underwriter.createQuote(body)
    })

  const responses = await Promise.all(tasks)
  return transformResult(responses)
}

const convertAddressChangeToSelfChangeBody = (
  input: AddressChangeInput,
  member: MemberDto,
  contract: ContractDto,
  marketInfo: ContractMarketInfoDto
): CreateQuoteDto => {
  const dtoBase: CreateQuoteDto = {
    memberId: member.memberId,
    firstName: member.firstName,
    lastName: member.lastName,
    ssn: member.ssn,
    birthDate: member.birthDate,
    startDate: input.startDate,
    initiatedFrom: QuoteInitiatedFromDto.SelfChange
  }

  switch (marketInfo.market) {
    case 'SWEDEN':
      return toSwedishQuoteDto(input, dtoBase)
    case 'NORWAY':
      return toNorwegianQuoteDto(input, dtoBase, contract)
    case 'DENMARK':
      return toDanishQuoteDto(input, dtoBase, contract)
  }

  throw `Unhandled market: ${marketInfo.market}`
}

const toSwedishQuoteDto = (
  input: AddressChangeInput,
  dto: CreateQuoteDto,
): CreateQuoteDto => {
  const subtypeMapper = (
    ownership: AddressOwnership,
    isStudent: boolean,
  ): string => {
    switch (ownership) {
      case AddressOwnership.BRF:
        return isStudent ? 'BRF_STUDENT' : 'BRF'
      case AddressOwnership.RENT:
        return isStudent ? 'RENT_STUDENT' : 'RENT'
      case AddressOwnership.OWN:
        throw Error("OWN is illegal Ownership for Swedish Apartments")
    }
  }

  switch (input.type) {
    case AddressHomeType.APARTMENT:
      return {
        ...dto,
        swedishApartmentData: {
          street: input.street,
          zipCode: input.zip,
          householdSize: input.numberCoInsured + 1,
          livingSpace: input.livingSpace,
          subType: subtypeMapper(input.ownership, input.isStudent!!),
        },
      }
    case AddressHomeType.HOUSE:
      return {
        ...dto,
        swedishHouseData: {
          street: input.street,
          zipCode: input.zip,
          householdSize: input.numberCoInsured + 1,
          livingSpace: input.livingSpace,
          ancillaryArea: input.ancillaryArea!!,
          yearOfConstruction: input.yearOfConstruction!!,
          numberOfBathrooms: input.numberOfBathrooms!!,
          subleted: input.isSubleted!!,
          extraBuildings: input.extraBuildings!!,
        },
      }
  }
}

const toNorwegianQuoteDto = (
  input: AddressChangeInput,
  dto: CreateQuoteDto,
  contract: ContractDto,
): CreateQuoteDto => {
  const isHomeContent = contract.typeOfContract.startsWith('NO_HOME_CONTENT')
  const isTravel = contract.typeOfContract.startsWith('NO_TRAVEL')
  if (isHomeContent) {
    if (input.ownership === AddressOwnership.BRF) {
      throw Error("BRF is illegal Ownership for Norwegian Home Content")
    }
    return {
      ...dto,
      norwegianHomeContentsData: {
        street: input.street,
        zipCode: input.zip,
        coInsured: input.numberCoInsured,
        livingSpace: input.livingSpace,
        subType: input.ownership,
        youth: input.isYouth!,
      },
    }
  }
  if (isTravel) {
    return {
      ...dto,
      norwegianTravelData: {
        coInsured: input.numberCoInsured,
        youth: input.isYouth!,
      },
    }
  }

  throw `Unhandled type of contract: ${contract.typeOfContract}`
}

const toDanishQuoteDto = (
  input: AddressChangeInput,
  dto: CreateQuoteDto,
  contract: ContractDto,
): CreateQuoteDto => {
  const isHomeContent = contract.typeOfContract.startsWith('DK_HOME_CONTENT')
  const isTravel = contract.typeOfContract.startsWith('DK_TRAVEL')
  const isAccident = contract.typeOfContract.startsWith('DK_ACCIDENT')

  if (isHomeContent) {
    if (input.ownership === AddressOwnership.BRF) {
      throw Error("BRF is illegal Ownership for Danish Home Content")
    }
    return {
      ...dto,
      danishHomeContentsData: {
        street: input.street,
        zipCode: input.zip,
        coInsured: input.numberCoInsured,
        livingSpace: input.livingSpace,
        subType: input.ownership,
        student: input.isStudent!,
      },
    }
  }
  if (isTravel) {
    return {
      ...dto,
      danishTravelData: {
        street: input.street,
        zipCode: input.zip,
        coInsured: input.numberCoInsured,
        student: input.isStudent!,
      },
    }
  }
  if (isAccident) {
    return {
      ...dto,
      danishAccidentData: {
        street: input.street,
        zipCode: input.zip,
        coInsured: input.numberCoInsured,
        student: input.isStudent!,
      },
    }
  }

  throw `Unhandled type of contract: ${contract.typeOfContract}`
}

const transformResult = (
  responses: QuoteCreationResult[]
): Typenamed<AddressChangeQuoteResult, PossibleAddressChangeQuoteResultTypeNames> => {
  const quoteIds: string[] = []
  const breachedUnderwritingGuidelines: string[] = []
  responses.forEach(response => {
    switch (response.status) {
      case 'success':
        quoteIds.push(response.id)
        break
      case 'failure':
        response.breachedUnderwritingGuidelines.forEach(g => breachedUnderwritingGuidelines.push(g.code))
        break
    }
  })
  if (breachedUnderwritingGuidelines.length > 0) {
    return {
      __typename: 'AddressChangeQuoteFailure',
      breachedUnderwritingGuidelines: breachedUnderwritingGuidelines
    }
  }
  return {
    __typename: 'AddressChangeQuoteSuccess',
    quoteIds: quoteIds
  }
}
