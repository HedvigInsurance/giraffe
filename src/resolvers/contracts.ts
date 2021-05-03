import { LocalizedStrings } from '../translations/LocalizedStrings';
import { ContractDto, ContractStatusDto, AgreementDto, AgreementStatusDto } from './../api/upstreams/productPricing';
import { QueryToContractBundlesResolver, ContractBundle, QueryToContractsResolver, Contract, QueryToHasContractResolver, ContractStatus, Agreement, TypeOfContract, AgreementStatus, SwedishApartmentLineOfBusiness, SwedishApartmentAgreement } from './../typings/generated-graphql-types';


export const contractBundles: QueryToContractBundlesResolver = async (
    _parent,
    _args,
    _context
): Promise<ContractBundle[]> => {
    throw "Nope"
}

export const contracts: QueryToContractsResolver = async (
    _parent,
    _args,
    { upstream, strings }
): Promise<Contract[]> => {
    const contracts = await upstream.productPricing.getMemberContracts()
    return contracts.map(c => transformContract(c, strings))
}

export const hasContract: QueryToHasContractResolver = async (
    _parent,
    _args,
    { upstream }
): Promise<boolean> => {
    const contracts = await upstream.productPricing.getMemberContracts()
    return contracts.length > 0
}

const transformContract = (
    contract: ContractDto,
    strings: LocalizedStrings
): Contract => {
    return {
        id: contract.id,
        holderMember: contract.holderMemberId,
        switchedFromInsuranceProvider: contract.switchedFrom,
        status: transformContractStatus(contract),
        displayName: strings(`CONTRACT_DISPLAY_NAME_${contract.typeOfContract}`),
        currentAgreement: transformAgreement(contract.agreements.find(ag => ag.id === contract.currentAgreementId)!),
        inception: contract.masterInception,
        termination: contract.terminationDate,
        upcomingRenewal: contract.renewal
            ? { 
                renewalDate: contract.renewal.renewalDate,
                draftCertificateUrl: contract.renewal.draftCertificateUrl! // this is nullable in the API but non-null in the Schema
            }
            : undefined,
        typeOfContract: contract.typeOfContract as TypeOfContract,
        createdAt: contract.createdAt
    }
}

const transformContractStatus = (
    contract: ContractDto
): ContractStatus => {
    switch (contract.status) {
        case ContractStatusDto.ACTIVE: return {
            pastInception: contract.masterInception,
            upcomingAgreementChange: contract.upcomingAgreement
                ? { newAgreement: transformAgreement(contract.upcomingAgreement) }
                : undefined
        }
    }
    throw "Unhandled status: " + contract.status
}

const transformAgreement = (
    agreement: AgreementDto
): Agreement => {
    const statusMap = {
        [AgreementStatusDto.ACTIVE]: AgreementStatus.ACTIVE,
        [AgreementStatusDto.ACTIVE_IN_FUTURE]: AgreementStatus.ACTIVE_IN_FUTURE,
        [AgreementStatusDto.ACTIVE_IN_PAST]: AgreementStatus.ACTIVE,
        [AgreementStatusDto.PENDING]: AgreementStatus.PENDING,
        [AgreementStatusDto.TERMINATED]: AgreementStatus.TERMINATED
    }
    const core = {
        id: agreement.id,
        status: statusMap[agreement.status],
        activeFrom: agreement.fromDate,
        activeTo: agreement.toDate,
        premium: agreement.basePremium,
        certificateUrl: agreement.certificateUrl,
        termsAndConditions: undefined // TODO help???
    }
    switch (agreement.type) {
        case "SwedishApartment": return <SwedishApartmentAgreement> {
            ...core,
            address: agreement.address,
            numberCoInsured: agreement.numberCoInsured,
            squareMeters: agreement.squareMeters,
            type: agreement.lineOfBusiness as SwedishApartmentLineOfBusiness
        }
    }
    throw "Unhandled type: " + agreement.type
}