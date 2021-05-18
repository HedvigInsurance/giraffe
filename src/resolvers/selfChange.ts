import { MemberDto } from './../api/upstreams/memberService';
import { QuoteCreationResult, CreateQuoteDto } from './../api/upstreams/underwriter';
import {
  MutationToCreateAddressChangeQuotesResolver,
  AddressChangeQuoteResult,
  PossibleAddressChangeQuoteResultTypeNames,
  AddressChangeInput,
  AddressOwnership,
  AddressHomeType,
  MutationToCommitAddressChangeQuotesResolver,
  AddressChangeCommitResult,
} from './../typings/generated-graphql-types'

import { ContractDto, ContractMarketInfoDto, ContractStatusDto } from '../api/upstreams/productPricing'
import { Typenamed } from '../utils/types';
import { bundleContracts } from './helpers/contractTransformers';

export const createAddressChangeQuotes: MutationToCreateAddressChangeQuotesResolver = async (
  _parent,
  args,
  { upstream },
): Promise<AddressChangeQuoteResult> => {
  const contractIds = args.input.contractBundleId.replace('bundle:', '').split(',')
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

export const commitAddressChangeQuotes: MutationToCommitAddressChangeQuotesResolver = async (
  _parent,
  args,
  { upstream, strings }
): Promise<AddressChangeCommitResult> => {
  const contractIds = args.contractBundleId.replace('bundle:', '').split(',')
  const result = await upstream.underwriter.changeToQuotes(contractIds, args.quoteIds)
  const [
    createdContracts,
    updatedContracts
  ] = await Promise.all([
    Promise.all(result.createdContractIds.map(upstream.productPricing.getContract)),
    Promise.all(result.updatedContractIds.map(upstream.productPricing.getContract))
  ])

  const bundle = bundleContracts(strings, createdContracts.concat(updatedContracts))
  if (bundle.length !== 1) {
    throw `Unexpected bundle size after self changed address, ids: ${bundle.map(b => b.id)}`
  }
  return {
    newContractBundle: bundle[0]
  }
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
      case AddressOwnership.OWN:
        return isStudent ? 'BRF_STUDENT' : 'BRF'
      case AddressOwnership.RENT:
        return isStudent ? 'RENT_STUDENT' : 'RENT'
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
