
import { getUser, UserDto, postSelfChangeQuote, CreateQuoteDto } from '../api'
import { SelfChangeQuoteOutput, MutationToCreateSelfChangeQuoteResolver, SelfChangeQuoteInput } from '../typings/generated-graphql-types'

const createSelfChangeQuote: MutationToCreateSelfChangeQuoteResolver = async (
    _parent,
    _args,
    { getToken, headers },
): Promise<SelfChangeQuoteOutput> => {
    const input = _args.quoteInput
    const token = getToken()
    const member = await getUser(token, headers)
    console.log(member);
    const result = await postSelfChangeQuote(
        buildUpstreamBody(member, input),
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

export { createSelfChangeQuote };
