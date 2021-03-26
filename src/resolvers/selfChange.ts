
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
    _context,
): Promise<SelfChangeEligibility> => {
    return {
        blockers: [],
        embarkStoryId: "Web Onboarding - Swedish Needer" // TODO use the correct one, but this is at least a real Embark story
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
