import { LocalizedStrings } from '../translations/LocalizedStrings'
import {
  ContractDto,
  ContractStatusDto,
  AgreementDto,
  AgreementStatusDto,
} from './../api/upstreams/productPricing'
import {
  QueryToContractBundlesResolver,
  ContractBundle,
  QueryToContractsResolver,
  Contract,
  QueryToHasContractResolver,
  ContractStatus,
  Agreement,
  TypeOfContract,
  AgreementStatus,
  SwedishApartmentLineOfBusiness,
  SwedishApartmentAgreement,
  SwedishHouseAgreement,
  NorwegianHomeContentAgreement,
  NorwegianHomeContentLineOfBusiness,
  NorwegianTravelAgreement,
  NorwegianTravelLineOfBusiness,
  DanishHomeContentAgreement,
  DanishHomeContentLineOfBusiness,
  DanishTravelAgreement,
  DanishTravelLineOfBusiness,
  DanishAccidentAgreement,
  DanishAccidentLineOfBusiness,
} from './../typings/generated-graphql-types'

export const contractBundles: QueryToContractBundlesResolver = async (
  _parent,
  _args,
  { upstream, strings },
): Promise<ContractBundle[]> => {
  const contracts = await upstream.productPricing.getMemberContracts()
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
    return {
      id: `bundle:${contracts.map(c => c.id).sort((id1, id2) => id1 < id2 ? -1 : 1).join(',')}`,
      contracts: contracts.map((c) => transformContract(c, strings)),
      angelStories: {}
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

export const contracts: QueryToContractsResolver = async (
  _parent,
  _args,
  { upstream, strings },
): Promise<Contract[]> => {
  const contracts = await upstream.productPricing.getMemberContracts()
  moveHomeContentsToTop(contracts)
  return contracts.map((c) => transformContract(c, strings))
}

export const hasContract: QueryToHasContractResolver = async (
  _parent,
  _args,
  { upstream },
): Promise<boolean> => {
  const contracts = await upstream.productPricing.getMemberContracts()
  return contracts.length > 0
}

const transformContract = (
  contract: ContractDto,
  strings: LocalizedStrings,
): Contract => {
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
    upcomingRenewal: contract.renewal
      ? {
          renewalDate: contract.renewal.renewalDate,
          draftCertificateUrl: contract.renewal.draftCertificateUrl!, // this is nullable in the API but non-null in the Schema
        }
      : undefined,
    typeOfContract: contract.typeOfContract as TypeOfContract,
    createdAt: contract.createdAt,
  }
}

const transformContractStatus = (contract: ContractDto): ContractStatus => {
  const upcomingAgreementChange = contract.upcomingAgreement
    ? { newAgreement: transformAgreement(contract.upcomingAgreement) }
    : undefined
  switch (contract.status) {
    case ContractStatusDto.PENDING:
      return {
        pendingSince: contract.createdAt.split('T')[0], // Ugly Instant to Date transformation
      }
    case ContractStatusDto.ACTIVE_IN_FUTURE:
      return {
        futureInception: contract.masterInception,
      }
    case ContractStatusDto.ACTIVE_IN_FUTURE_AND_TERMINATED_IN_FUTURE:
      return {
        futureInception: contract.masterInception,
        futureTermination: contract.terminationDate,
      }
    case ContractStatusDto.ACTIVE:
      return {
        pastInception: contract.masterInception,
        upcomingAgreementChange: upcomingAgreementChange,
      }
    case ContractStatusDto.TERMINATED_TODAY: {
      const now = new Date()
      return {
        today: `${now.getFullYear}-${now.getMonth}-${now.getDay}`,
      }
    }
    case ContractStatusDto.TERMINATED_IN_FUTURE:
      return {
        futureTermination: contract.terminationDate,
      }
    case ContractStatusDto.TERMINATED:
      return {
        termination: contract.terminationDate,
      }
  }
}

const transformAgreement = (agreement: AgreementDto): Agreement => {
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
    termsAndConditions: undefined, // TODO help???
  }
  switch (agreement.type) {
    case 'SwedishApartment': {
      const result: SwedishApartmentAgreement = {
        ...core,
        address: agreement.address,
        numberCoInsured: agreement.numberCoInsured,
        squareMeters: agreement.squareMeters,
        type: agreement.lineOfBusiness as SwedishApartmentLineOfBusiness,
      }
      return result
    }
    case 'SwedishHouse': {
      const result: SwedishHouseAgreement = {
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
      return result
    }
    case 'NorwegianHomeContent': {
      const result: NorwegianHomeContentAgreement = {
        ...core,
        address: agreement.address,
        numberCoInsured: agreement.numberCoInsured,
        squareMeters: agreement.squareMeters,
        type: agreement.lineOfBusiness as NorwegianHomeContentLineOfBusiness,
      }
      return result
    }
    case 'NorwegianTravel': {
      const result: NorwegianTravelAgreement = {
        ...core,
        numberCoInsured: agreement.numberCoInsured,
        type: agreement.lineOfBusiness as NorwegianTravelLineOfBusiness,
      }
      return result
    }
    case 'DanishHomeContent': {
      const result: DanishHomeContentAgreement = {
        ...core,
        address: agreement.address,
        numberCoInsured: agreement.numberCoInsured,
        squareMeters: agreement.squareMeters,
        type: agreement.lineOfBusiness as DanishHomeContentLineOfBusiness,
      }
      return result
    }
    case 'DanishTravel': {
      const result: DanishTravelAgreement = {
        ...core,
        address: agreement.address,
        numberCoInsured: agreement.numberCoInsured,
        type: agreement.lineOfBusiness as DanishTravelLineOfBusiness,
      }
      return result
    }
    case 'DanishAccident': {
      const result: DanishAccidentAgreement = {
        ...core,
        address: agreement.address,
        numberCoInsured: agreement.numberCoInsured,
        type: agreement.lineOfBusiness as DanishAccidentLineOfBusiness,
      }
      return result
    }
  }
}

const moveHomeContentsToTop = (
  contracts: ContractDto[]
) => {
  contracts.sort((c1, c2) => {
    if (c1.typeOfContract.includes('HOME_CONTENT')) return -1
    if (c2.typeOfContract.includes('HOME_CONTENT')) return 1
    return 0
  })
}