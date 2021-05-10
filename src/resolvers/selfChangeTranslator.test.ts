import { Contract, ContractMarketInfoDto, ContractStatus } from './../api/upstreams/productPricing'
import {
  AddressHomeType,
  AddressOwnership,
} from './../typings/generated-graphql-types'
import { MemberDto } from './../api/upstreams/memberService'

import { AddressChangeInput } from '../typings/generated-graphql-types'
import { convertAddressChangeToSelfChangeBody } from './selfChangeTranslator'

describe('convertAddressChangeToSelfChangeBody', () => {
  const member: MemberDto = {
    firstName: 'Test',
    lastName: 'Testsson',
    memberId: '123',
    email: 'test@test.com',
    phoneNumber: '070123456789',
    ssn: '201212121212',
    birthDate: '1991-07-27',
  }

  const marketInfo: ContractMarketInfoDto = {
    market: 'UNKNOWN',
    preferredCurrency: 'UNKNOWN'
  }

  const baseInput = {
    startDate: '2021-06-01',
    street: 'Fakestreet 123',
    zip: '12345',
    numberCoInsured: 2,
    livingSpace: 44,
  }

  const baseOutput = {
    memberId: member.memberId,
    firstName: member.firstName,
    lastName: member.lastName,
    ssn: member.ssn,
    birthDate: member.birthDate,
    startDate: baseInput.startDate,
  }

  it('should be able to translate a swedish apartment', () => {
    const contract: Contract = {
      id: 'cid',
      status: ContractStatus.ACTIVE,
      typeOfContract: 'SE_APARTMENT',
    }

    const seBaseInput = {
      ...baseInput,
      type: AddressHomeType.APARTMENT,
    }

    const seBaseOutput = {
      ...baseOutput,
      swedishApartmentData: {
        street: baseInput.street,
        zipCode: baseInput.zip,
        householdSize: baseInput.numberCoInsured + 1,
        livingSpace: baseInput.livingSpace,
      },
    }

    const nonStudentRental: AddressChangeInput = {
      ...seBaseInput,
      ownership: AddressOwnership.RENT,
      isStudent: false,
    }

    expect(
      convertAddressChangeToSelfChangeBody(nonStudentRental, member, contract, {...marketInfo, market: 'SWEDEN'}),
    ).toEqual({
      ...seBaseOutput,
      swedishApartmentData: {
        ...seBaseOutput.swedishApartmentData,
        subType: 'RENT',
      },
    })

    const studentRental: AddressChangeInput = {
      ...seBaseInput,
      ownership: AddressOwnership.RENT,
      isStudent: true,
    }

    expect(
      convertAddressChangeToSelfChangeBody(studentRental, member, contract, {...marketInfo, market: 'SWEDEN'}),
    ).toEqual({
      ...seBaseOutput,
      swedishApartmentData: {
        ...seBaseOutput.swedishApartmentData,
        subType: 'RENT_STUDENT',
      },
    })

    const nonStudentOwned: AddressChangeInput = {
      ...seBaseInput,
      ownership: AddressOwnership.OWN,
      isStudent: false,
    }

    expect(
      convertAddressChangeToSelfChangeBody(nonStudentOwned, member, contract, {...marketInfo, market: 'SWEDEN'}),
    ).toEqual({
      ...seBaseOutput,
      swedishApartmentData: {
        ...seBaseOutput.swedishApartmentData,
        subType: 'BRF',
      },
    })

    const studentOwned: AddressChangeInput = {
      ...seBaseInput,
      ownership: AddressOwnership.OWN,
      isStudent: true,
    }

    expect(
      convertAddressChangeToSelfChangeBody(studentOwned, member, contract, {...marketInfo, market: 'SWEDEN'}),
    ).toEqual({
      ...seBaseOutput,
      swedishApartmentData: {
        ...seBaseOutput.swedishApartmentData,
        subType: 'BRF_STUDENT',
      },
    })
  })

  it('should be able to translate a swedish house', () => {
    const contract: Contract = {
      id: 'cid',
      status: ContractStatus.ACTIVE,
      typeOfContract: 'SE_APARTMENT',
    }

    const input: AddressChangeInput = {
      ...baseInput,
      type: AddressHomeType.HOUSE,
      ancillaryArea: 28,
      yearOfConstruction: 1912,
      numberOfBathrooms: 3,
      numberOfFloors: 2,
      isSubleted: true,
      extraBuildings: [
        {
          type: 'GARAGE',
          area: 12,
          hasWaterConnected: false,
        },
      ],
      ownership: AddressOwnership.OWN,
      isStudent: false,
    }

    const output = {
      ...baseOutput,
      swedishHouseData: {
        street: input.street,
        zipCode: input.zip,
        householdSize: input.numberCoInsured + 1,
        livingSpace: input.livingSpace,
        ancillaryArea: input.ancillaryArea,
        yearOfConstruction: input.yearOfConstruction,
        numberOfBathrooms: input.numberOfBathrooms,
        floor: input.numberOfFloors,
        subleted: input.isSubleted,
        extraBuildings: input.extraBuildings,
      },
    }

    expect(
      convertAddressChangeToSelfChangeBody(input, member, contract, {...marketInfo, market: 'SWEDEN'}),
    ).toEqual(output)
  })

  it('should be able to translate norwegian home contents', () => {
    const contract: Contract = {
      id: 'cid',
      status: ContractStatus.ACTIVE,
      typeOfContract: 'NO_HOME_CONTENT_OWN',
    }

    const input: AddressChangeInput = {
      ...baseInput,
      type: AddressHomeType.APARTMENT,
      ownership: AddressOwnership.OWN,
      isYouth: true,
    }

    const output = {
      ...baseOutput,
      norwegianHomeContentsData: {
        street: baseInput.street,
        zipCode: baseInput.zip,
        coInsured: baseInput.numberCoInsured,
        livingSpace: baseInput.livingSpace,
        youth: true,
        subType: 'OWN',
      },
    }

    expect(
      convertAddressChangeToSelfChangeBody(input, member, contract, {...marketInfo, market: 'NORWAY'}),
    ).toEqual(output)
  })

  it('should be able to translate norwegian travel', () => {
    const contract: Contract = {
      id: 'cid',
      status: ContractStatus.ACTIVE,
      typeOfContract: 'NO_TRAVEL_YOUTH',
    }

    const input: AddressChangeInput = {
      ...baseInput,
      type: AddressHomeType.APARTMENT,
      ownership: AddressOwnership.OWN,
      isYouth: true,
    }

    const output = {
      ...baseOutput,
      norwegianTravelData: {
        coInsured: baseInput.numberCoInsured,
        youth: true,
      },
    }

    expect(
      convertAddressChangeToSelfChangeBody(input, member, contract, {...marketInfo, market: 'NORWAY'}),
    ).toEqual(output)
  })

  it('should be able to translate danish home contents', () => {
    const contract: Contract = {
      id: 'cid',
      status: ContractStatus.ACTIVE,
      typeOfContract: 'DK_HOME_CONTENT_STUDENT_OWN',
    }

    const input: AddressChangeInput = {
      ...baseInput,
      type: AddressHomeType.APARTMENT,
      ownership: AddressOwnership.OWN,
      isStudent: true,
    }

    const output = {
      ...baseOutput,
      danishHomeContentsData: {
        street: baseInput.street,
        zipCode: baseInput.zip,
        coInsured: baseInput.numberCoInsured,
        livingSpace: baseInput.livingSpace,
        student: true,
        subType: 'OWN',
      },
    }

    expect(
      convertAddressChangeToSelfChangeBody(input, member, contract, {...marketInfo, market: 'DENMARK'}),
    ).toEqual(output)
  })

  it('should be able to translate danish travel', () => {
    const contract: Contract = {
      id: 'cid',
      status: ContractStatus.ACTIVE,
      typeOfContract: 'DK_TRAVEL_STUDENT',
    }

    const input: AddressChangeInput = {
      ...baseInput,
      type: AddressHomeType.APARTMENT,
      ownership: AddressOwnership.OWN,
      isStudent: true,
    }

    const output = {
      ...baseOutput,
      danishTravelData: {
        street: baseInput.street,
        zipCode: baseInput.zip,
        coInsured: baseInput.numberCoInsured,
        student: true,
      },
    }

    expect(
      convertAddressChangeToSelfChangeBody(input, member, contract, {...marketInfo, market: 'DENMARK'}),
    ).toEqual(output)
  })

  it('should be able to translate danish accident', () => {
    const contract: Contract = {
      id: 'cid',
      status: ContractStatus.ACTIVE,
      typeOfContract: 'DK_ACCIDENT',
    }

    const input: AddressChangeInput = {
      ...baseInput,
      type: AddressHomeType.APARTMENT,
      ownership: AddressOwnership.OWN,
      isStudent: false,
    }

    const output = {
      ...baseOutput,
      danishAccidentData: {
        street: baseInput.street,
        zipCode: baseInput.zip,
        coInsured: baseInput.numberCoInsured,
        student: false,
      },
    }

    expect(
      convertAddressChangeToSelfChangeBody(input, member, contract, {...marketInfo, market: 'DENMARK'}),
    ).toEqual(output)
  })
})
