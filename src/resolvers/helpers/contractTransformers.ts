import { ContractDto } from '../../api/upstreams/productPricing'
import {
  AgreementDto,
  AgreementStatusDto,
  ContractStatusDto,
} from './../../api/upstreams/productPricing'
import { LocalizedStrings } from './../../translations/LocalizedStrings'
import {
  Agreement,
  AgreementStatus,
  Contract,
  ContractStatus,
  PossibleAgreementTypeNames,
  PossibleContractStatusTypeNames,
  SwedishApartmentLineOfBusiness,
  TypeOfContract,
  NorwegianHomeContentLineOfBusiness,
  NorwegianTravelLineOfBusiness,
  DanishHomeContentLineOfBusiness,
  DanishTravelLineOfBusiness,
  DanishAccidentLineOfBusiness,
  ContractBundle,
} from './../../typings/generated-graphql-types'
import { Typenamed } from './../../utils/types'

export const bundleContracts = (
  strings: LocalizedStrings,
  contracts: ContractDto[],
  addressChangeAngelStoryId?: string,
): ContractBundle[] => {
    moveHomeContentsToTop(contracts)

    const norwegianBundle = [] as ContractDto[]
    const danishBundle = [] as ContractDto[]
    const individual = [] as ContractDto[]
    contracts.forEach((contract) => {
      const agreement = contract.agreements.find(
        (ag) => ag.id === contract.currentAgreementId,
      )!
      switch (agreement.type) {
        case 'NorwegianHomeContent':
        case 'NorwegianTravel':
          norwegianBundle.push(contract)
          break
        case 'DanishHomeContent':
        case 'DanishTravel':
        case 'DanishAccident':
          danishBundle.push(contract)
          break
        default:
          individual.push(contract)
      }
    })
  
    const bundle = (contracts: ContractDto[]): ContractBundle => {
      const bundleId = `bundle:${contracts.map(c => c.id).sort((id1, id2) => id1 < id2 ? -1 : 1).join(',')}`
      return {
        id: bundleId,
        contracts: contracts.map((c) => transformContract(c, strings)),
        angelStories: {
          addressChange: addressChangeAngelStoryId && `${addressChangeAngelStoryId}?contractBundleId=${bundleId}`
        }
      }
    }
  
    const bundles = [] as ContractBundle[]
    if (norwegianBundle.length) {
      bundles.push(bundle(norwegianBundle))
    }
    if (danishBundle.length) {
      bundles.push(bundle(danishBundle))
    }
    individual.forEach((contract) => {
      bundles.push(bundle([contract]))
    })
  
    return bundles
}

export const transformContract = (
  contract: ContractDto,
  strings: LocalizedStrings,
): Contract => {
  const hasUpcomingRenewal =
    contract.hasQueuedRenewal &&
    contract.renewal &&
    new Date(contract.renewal.renewalDate) > new Date()
  return {
    id: contract.id,
    holderMember: contract.holderMemberId,
    switchedFromInsuranceProvider: contract.switchedFrom,
    status: transformContractStatus(contract),
    displayName: strings(`CONTRACT_DISPLAY_NAME_${contract.typeOfContract}`),
    currentAgreement: transformAgreement(
      contract.agreements.find((ag) => ag.id === contract.currentAgreementId)!,
    ),
    inception: contract.masterInception,
    termination: contract.terminationDate,
    upcomingRenewal: hasUpcomingRenewal
      ? {
          renewalDate: contract.renewal!.renewalDate,
          draftCertificateUrl:
            contract.renewal!.draftCertificateUrl || 'http://null', // this is nullable in the API but non-null in the Schema
        }
      : undefined,
    typeOfContract: contract.typeOfContract as TypeOfContract,
    createdAt: contract.createdAt,
  }
}

const transformContractStatus = (
  contract: ContractDto,
): Typenamed<ContractStatus, PossibleContractStatusTypeNames> => {
  const upcomingAgreementChange = contract.upcomingAgreement
    ? { newAgreement: transformAgreement(contract.upcomingAgreement) }
    : undefined
  switch (contract.status) {
    case ContractStatusDto.PENDING:
      return {
        __typename: 'PendingStatus',
        pendingSince: contract.createdAt.split('T')[0], // Ugly Instant to Date transformation
      }
    case ContractStatusDto.ACTIVE_IN_FUTURE:
      return {
        __typename: 'ActiveInFutureStatus',
        futureInception: contract.masterInception,
      }
    case ContractStatusDto.ACTIVE_IN_FUTURE_AND_TERMINATED_IN_FUTURE:
      return {
        __typename: 'ActiveInFutureAndTerminatedInFutureStatus',
        futureInception: contract.masterInception,
        futureTermination: contract.terminationDate,
      }
    case ContractStatusDto.ACTIVE:
      return {
        __typename: 'ActiveStatus',
        pastInception: contract.masterInception,
        upcomingAgreementChange: upcomingAgreementChange,
      }
    case ContractStatusDto.TERMINATED_TODAY: {
      const now = new Date()
      return {
        __typename: 'TerminatedTodayStatus',
        today: `${now.getFullYear}-${now.getMonth}-${now.getDay}`,
      }
    }
    case ContractStatusDto.TERMINATED_IN_FUTURE:
      return {
        __typename: 'TerminatedInFutureStatus',
        futureTermination: contract.terminationDate,
      }
    case ContractStatusDto.TERMINATED:
      return {
        __typename: 'TerminatedStatus',
        termination: contract.terminationDate,
      }
  }
}

const transformAgreement = (
  agreement: AgreementDto,
): Typenamed<Agreement, PossibleAgreementTypeNames> => {
  const statusMap = {
    [AgreementStatusDto.ACTIVE]: AgreementStatus.ACTIVE,
    [AgreementStatusDto.ACTIVE_IN_FUTURE]: AgreementStatus.ACTIVE_IN_FUTURE,
    [AgreementStatusDto.ACTIVE_IN_PAST]: AgreementStatus.ACTIVE,
    [AgreementStatusDto.PENDING]: AgreementStatus.PENDING,
    [AgreementStatusDto.TERMINATED]: AgreementStatus.TERMINATED,
  }
  const core = {
    id: agreement.id,
    status: statusMap[agreement.status],
    activeFrom: agreement.fromDate,
    activeTo: agreement.toDate,
    premium: agreement.basePremium,
    certificateUrl: agreement.certificateUrl,
  }
  switch (agreement.type) {
    case 'SwedishApartment': {
      return {
        __typename: 'SwedishApartmentAgreement',
        ...core,
        address: agreement.address,
        numberCoInsured: agreement.numberCoInsured,
        squareMeters: agreement.squareMeters,
        type: agreement.lineOfBusiness as SwedishApartmentLineOfBusiness,
      }
    }
    case 'SwedishHouse': {
      return {
        __typename: 'SwedishHouseAgreement',
        ...core,
        address: agreement.address,
        numberCoInsured: agreement.numberCoInsured,
        squareMeters: agreement.squareMeters,
        ancillaryArea: agreement.ancillaryArea,
        yearOfConstruction: agreement.yearOfConstruction,
        numberOfBathrooms: agreement.numberOfBathrooms,
        isSubleted: agreement.isSubleted,
        extraBuildings: agreement.extraBuildings,
      }
    }
    case 'NorwegianHomeContent': {
      return {
        __typename: 'NorwegianHomeContentAgreement',
        ...core,
        address: agreement.address,
        numberCoInsured: agreement.numberCoInsured,
        squareMeters: agreement.squareMeters,
        type: agreement.lineOfBusiness as NorwegianHomeContentLineOfBusiness,
      }
    }
    case 'NorwegianTravel': {
      return {
        __typename: 'NorwegianTravelAgreement',
        ...core,
        numberCoInsured: agreement.numberCoInsured,
        type: agreement.lineOfBusiness as NorwegianTravelLineOfBusiness,
      }
    }
    case 'DanishHomeContent': {
      return {
        __typename: 'DanishHomeContentAgreement',
        ...core,
        address: agreement.address,
        numberCoInsured: agreement.numberCoInsured,
        squareMeters: agreement.squareMeters,
        type: agreement.lineOfBusiness as DanishHomeContentLineOfBusiness,
      }
    }
    case 'DanishTravel': {
      return {
        __typename: 'DanishTravelAgreement',
        ...core,
        address: agreement.address,
        numberCoInsured: agreement.numberCoInsured,
        type: agreement.lineOfBusiness as DanishTravelLineOfBusiness,
      }
    }
    case 'DanishAccident': {
      return {
        __typename: 'DanishAccidentAgreement',
        ...core,
        address: agreement.address,
        numberCoInsured: agreement.numberCoInsured,
        type: agreement.lineOfBusiness as DanishAccidentLineOfBusiness,
      }
    }
  }
}

export const moveHomeContentsToTop = (contracts: ContractDto[]) => {
  contracts.sort((c1, c2) => {
    if (c1.typeOfContract.includes('HOME_CONTENT')) return -1
    if (c2.typeOfContract.includes('HOME_CONTENT')) return 1
    return 0
  })
}
