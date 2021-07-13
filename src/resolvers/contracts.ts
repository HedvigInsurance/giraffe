import {
  AgreementDto,
  AgreementStatusDto,
  ContractDto,
  ContractStatusDto,
  TrialDto
} from './../api/upstreams/productPricing';
import {LocalizedStrings} from './../translations/LocalizedStrings';
import {
  Agreement,
  AgreementStatus,
  Contract,
  ContractBundle,
  ContractStatus,
  DanishAccidentLineOfBusiness,
  DanishHomeContentLineOfBusiness,
  DanishTravelLineOfBusiness,
  ExtraBuildingType,
  NorwegianHomeContentLineOfBusiness,
  NorwegianTravelLineOfBusiness,
  QueryResolvers,
  SwedishApartmentLineOfBusiness,
  TypeOfContract
} from '../generated/graphql'
import {format} from 'date-fns'


const ADDRESS_CHANGE_STORIES_BY_MARKET: Record<string, string> = {
  SWEDEN: 'moving-flow-SE',
  NORWAY: 'moving-flow-NO',
}

export const activeContractBundles: QueryResolvers['activeContractBundles'] = async (
  _parent,
  _args,
  {upstream, strings},
): Promise<ContractBundle[]> => {
  const [
    contracts,
    selfChangeEligibility
  ] = await Promise.all([
    upstream.productPricing.getMemberContracts(),
    upstream.productPricing.getSelfChangeEligibility()
  ])

  let addressChangeAngelStoryId: string | undefined = undefined
  if (selfChangeEligibility.blockers.length === 0) {
    const marketInfo = await upstream.productPricing.getContractMarketInfo()
    addressChangeAngelStoryId = ADDRESS_CHANGE_STORIES_BY_MARKET[marketInfo.market.toUpperCase()]
  }

  const active = contracts.filter(c => c.status == ContractStatusDto.ACTIVE)
  return bundleContracts(strings, active, addressChangeAngelStoryId)
}

export const contracts: QueryResolvers['contracts'] = async (
  _parent,
  _args,
  {upstream, strings},
): Promise<Contract[]> => {
  const [contracts, trials] = await Promise.all([
    upstream.productPricing.getMemberContracts(),
    upstream.productPricing.getTrials()
  ])
  sortContractsInNaturalOrder(contracts)
  const mappedContracts = contracts.map((c) => transformContract(c, strings))
  const fakeContracts = trials.map((t) => transformTrialToFakeContract(t, strings))
  return mappedContracts.concat(fakeContracts)
}

export const hasContract: QueryResolvers['hasContract'] = async (
  _parent,
  _args,
  {upstream},
): Promise<boolean> => {
  const contracts = await upstream.productPricing.getMemberContracts()
  return contracts.length > 0
}


// helpers

export const bundleContracts = (
  strings: LocalizedStrings,
  contracts: ContractDto[],
  addressChangeAngelStoryId?: string,
): ContractBundle[] => {
  sortContractsInNaturalOrder(contracts)

  const norwegianBundle = [] as ContractDto[]
  const danishBundle = [] as ContractDto[]
  const individual = [] as ContractDto[]
  contracts.forEach((contract) => {
    const agreement = contract.agreements.find(
      (agreement) => agreement.id === contract.currentAgreementId,
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
    const bundleId = `bundle-${contracts.map(c => c.id).sort((id1, id2) => id1 < id2 ? -1 : 1).join(',')}`
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

const transformContract = (
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
      contract.agreements.find((agreement) => agreement.id === contract.currentAgreementId)!,
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
): ContractStatus => {
  const upcomingAgreementChange = contract.upcomingAgreement
    ? {newAgreement: transformAgreement(contract.upcomingAgreement)}
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
        today: format(now, 'YYYY-MM-DD'),
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
): Agreement => {
  const statusMap = {
    [AgreementStatusDto.ACTIVE]: AgreementStatus.Active,
    [AgreementStatusDto.ACTIVE_IN_FUTURE]: AgreementStatus.ActiveInFuture,
    [AgreementStatusDto.ACTIVE_IN_PAST]: AgreementStatus.Active,
    [AgreementStatusDto.PENDING]: AgreementStatus.Pending,
    [AgreementStatusDto.TERMINATED]: AgreementStatus.Terminated,
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
        extraBuildings: agreement.extraBuildings.map(building => ({
          ...building,
          type: building.type as ExtraBuildingType,
          __typename: 'ExtraBuildingValue'
        })),
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

const sortContractsInNaturalOrder = (contracts: ContractDto[]) => {
  const priority = (contract: ContractDto): number =>
    contract.typeOfContract.includes('HOME_CONTENT') ? 0
    : contract.typeOfContract.includes('ACCIDENT') ? 1
    : 2

  contracts.sort((c1, c2) => priority(c1) - priority(c2))
}

const transformTrialToFakeContract = (trial: TrialDto, strings: LocalizedStrings): Contract => {
  const typeTransformation: Record<string, TypeOfContract> = {
    'SE_APARTMENT_BRF': TypeOfContract.SeApartmentBrf,
    'SE_APARTMENT_RENT': TypeOfContract.SeApartmentRent,
  }
  const lineOfBusinessTransformation: Record<string, SwedishApartmentLineOfBusiness> = {
    'SE_APARTMENT_BRF': SwedishApartmentLineOfBusiness.Brf,
    'SE_APARTMENT_RENT': SwedishApartmentLineOfBusiness.Rent,
  }
  const agreementStatusTransformation: Record<string, AgreementStatus> = {
    'ACTIVE_IN_FUTURE_AND_TERMINATED_IN_FUTURE': AgreementStatus.ActiveInFuture,
    'TERMINATED_IN_FUTURE': AgreementStatus.Active,
    'TERMINATED_TODAY': AgreementStatus.Active,
    'TERMINATED': AgreementStatus.Terminated,
  }
  const contractStatusTransformation: Record<string, ContractStatus> = {
    'ACTIVE_IN_FUTURE_AND_TERMINATED_IN_FUTURE': {
      __typename: 'ActiveInFutureAndTerminatedInFutureStatus',
      futureInception: trial.fromDate,
      futureTermination: trial.toDate
    },
    'TERMINATED_IN_FUTURE': {
      __typename: 'TerminatedInFutureStatus',
      futureTermination: trial.toDate
    },
    'TERMINATED_TODAY': {
      __typename: 'TerminatedTodayStatus',
      today: trial.toDate
    },
    'TERMINATED': {
      __typename: 'TerminatedStatus',
      termination: trial.toDate
    }
  }

  const typeOfContract = typeTransformation[trial.type]
  return {
    id: `fakecontract:${trial.id}`,
    holderMember: trial.memberId,
    typeOfContract,
    status: contractStatusTransformation[trial.status],
    displayName: strings(`CONTRACT_DISPLAY_NAME_${typeOfContract}`),
    createdAt: trial.createdAt,
    currentAgreement: {
      __typename: 'SwedishApartmentAgreement',
      id: `fakeagreement:${trial.id}`,
      activeFrom: trial.fromDate,
      activeTo: trial.toDate,

      premium: {
        amount: '0',
        currency: 'SEK'
      },
      status: agreementStatusTransformation[trial.status],
      address: {
        street: trial.address.street,
        postalCode: trial.address.zipCode,
      },
      squareMeters: trial.address.livingSpace ?? 0,
      numberCoInsured: 0,
      type: lineOfBusinessTransformation[trial.type],
      certificateUrl: trial.certificateUrl
    } as Agreement
  }
}
