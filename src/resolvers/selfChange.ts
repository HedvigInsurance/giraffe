
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
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        ssn: member.ssn,
        startDate: input.startDate,
        // The GraphQL type inputs are ALMOST the same as the upstream endpoint wants
        // so we quickly massage them here to conform by "renaming" some fields
        incompleteApartmentQuoteData: input.swedishApartment ? {
            subType: input.swedishApartment.type,
            ...input.swedishApartment
        } : undefined,
        incompleteHouseQuoteData: input.swedishHouse ? {
            ancillaryArea: input.swedishHouse.ancillarySpace,
            subleted: input.swedishHouse.isSubleted,
            ...input.swedishHouse
        } : undefined,
        norwegianHomeContents: input.norwegianHomeContents ? {
            subType: input.norwegianHomeContents.type,
            youth: input.norwegianHomeContents.isYouth,
            ...input.norwegianHomeContents
        } : undefined,
        norwegianTravel: input.norwegianTravel ? {
            youth: input.norwegianTravel.isYouth,
            ...input.norwegianTravel
        } : undefined,
        danishHomeContents: input.danishHomeContents ? {
            student: input.danishHomeContents.isStudent,
            subType: input.danishHomeContents.type,
            ...input.danishHomeContents
        } : undefined,
        danishTravel: input.danishTravel ? {
            student: input.danishTravel.isStudent,
            ...input.danishTravel
        } : undefined,
        danishAccident: input.danishAccident ? {
            student: input.danishAccident.isStudent,
            ...input.danishAccident
        }: undefined
    }
}

export { createSelfChangeQuote };
