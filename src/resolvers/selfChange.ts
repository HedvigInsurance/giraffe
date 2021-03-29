
import { getUser, UserDto, postSelfChangeQuote, CreateQuoteDto } from '../api'
import {
    SelfChangeQuoteOutput,
    MutationToCreateSelfChangeQuoteResolver,
    QueryToSelfChangeEligibilityResolver,
    SelfChangeQuoteInput,
    SelfChangeEligibility
} from '../typings/generated-graphql-types'

const selfChangeEligibility: QueryToSelfChangeEligibilityResolver = async (
    _parent,
    _args,
    { upstream },
): Promise<SelfChangeEligibility> => {
    const eligibility = await upstream.productPricing.getSelfChangeEligibility()
    const isEligible = eligibility.blockers.length == 0
    if (!isEligible) {
        return { blockers: [], embarkStoryId: undefined }
    }

    const marketInfo = await upstream.productPricing.getContractMarketInfo()
    const storiesByMarket = new Map<String, string>()
        .set("SWEDEN", "moving-flow-SE")
        .set("NORWAY", "moving-flow-NO")

    return {
        blockers: [], // is deprecated
        embarkStoryId: storiesByMarket.get(marketInfo.market.toUpperCase())
    }
}

const createSelfChangeQuote: MutationToCreateSelfChangeQuoteResolver = async (
    _parent,
    args,
    { getToken, headers },
): Promise<SelfChangeQuoteOutput> => {
    const token = getToken()
    const member = await getUser(token, headers)
    const result = await postSelfChangeQuote(
        buildUpstreamBody(member, args.quoteInput),
        token,
        headers
    )

    return {
        id: result.id,
        price: result.price,
        validTo: result.validTo
    }
}

const buildUpstreamBody = (member: UserDto, input: SelfChangeQuoteInput): CreateQuoteDto => {
    return {
        memberId: member.memberId,
        firstName: member.firstName,
        lastName: member.lastName,
        ssn: member.ssn,
        birthDate: member.birthDate,
        startDate: input.startDate,
        // The GraphQL type inputs are ALMOST the same as the upstream endpoint wants
        // so we quickly massage them here to conform by "renaming" some fields
        swedishApartmentData: input.swedishApartment ? {
            subType: input.swedishApartment.type,
            ...input.swedishApartment
        } : undefined,
        swedishHouseData: input.swedishHouse ? {
            ancillaryArea: input.swedishHouse.ancillarySpace,
            subleted: input.swedishHouse.isSubleted,
            ...input.swedishHouse
        } : undefined,
        norwegianHomeContentsData: input.norwegianHomeContents ? {
            subType: input.norwegianHomeContents.type,
            youth: input.norwegianHomeContents.isYouth,
            ...input.norwegianHomeContents
        } : undefined,
        norwegianTravelData: input.norwegianTravel ? {
            youth: input.norwegianTravel.isYouth,
            ...input.norwegianTravel
        } : undefined,
        danishHomeContentsData: input.danishHomeContents ? {
            student: input.danishHomeContents.isStudent,
            subType: input.danishHomeContents.type,
            ...input.danishHomeContents
        } : undefined,
        danishTravelData: input.danishTravel ? {
            student: input.danishTravel.isStudent,
            ...input.danishTravel
        } : undefined,
        danishAccidentData: input.danishAccident ? {
            student: input.danishAccident.isStudent,
            ...input.danishAccident
        }: undefined
    }
}

export { selfChangeEligibility, createSelfChangeQuote };
