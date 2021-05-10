import { Contract, ContractMarketInfoDto } from './../api/upstreams/productPricing'
import {
  AddressChangeInput,
  AddressHomeType,
  AddressOwnership,
} from './../typings/generated-graphql-types'
import { MemberDto } from './../api/upstreams/memberService'

import { CreateQuoteDto } from '../api/upstreams/underwriter'

export const convertAddressChangeToSelfChangeBody = (
  input: AddressChangeInput,
  member: MemberDto,
  contract: Contract,
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
          floor: input.numberOfFloors!!,
          subleted: input.isSubleted!!,
          extraBuildings: input.extraBuildings!!,
        },
      }
  }
}

const toNorwegianQuoteDto = (
  input: AddressChangeInput,
  dto: CreateQuoteDto,
  contract: Contract,
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
  contract: Contract,
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
