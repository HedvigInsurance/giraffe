
import { getUser } from '../api'
import { Member, MutationToCreateSelfChangeQuoteResolver } from '../typings/generated-graphql-types'

const createSelfChangeQuote: MutationToCreateSelfChangeQuoteResolver = async (
    _parent,
    _args,
    { getToken, headers },
): Promise<Member> => {
    console.log("it worked");
    const token = await getToken()
    const member = await getUser(token, headers)
    return {
        id: member.memberId,
        firstName: member.firstName,
        lastName: member.lastName,
        email: _args.quoteInput.email,
        phoneNumber: member.phoneNumber,
        features: []
    }
}

export { createSelfChangeQuote };
