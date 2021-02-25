
import { getUser, postSelfChangeQuote } from '../api'
import { SelfChangeQuoteOutput, MutationToCreateSelfChangeQuoteResolver } from '../typings/generated-graphql-types'


const createSelfChangeQuote: MutationToCreateSelfChangeQuoteResolver = async (
    _parent,
    _args,
    { getToken, headers },
): Promise<SelfChangeQuoteOutput> => {
    const input = _args.quoteInput
    const token = await getToken()
    const member = await getUser(token, headers)

    const result = await postSelfChangeQuote(
        {
            firstName: member.firstName,
            lastName: member.lastName,
            email: member.email,
            ssn: member.ssn,
            startDate: input.startDate,
            swedishApartment: input.swedishApartment,
            swedishHouse: input.swedishHouse,
            norwegianHomeContents: input.norwegianHomeContents,
            norwegianTravel: input.norwegianTravel,
            danishHomeContents: input.danishHomeContents,
            danishTravel: input.danishTravel,
            danishAccident: input.danishAccident
        },
        headers
    )

    return {
        id: result.id,
        price: result.price,
        validTo: result.validTo
    }
}

export { createSelfChangeQuote };
