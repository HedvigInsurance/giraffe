import { IResolvers } from 'graphql-tools'

export const crossSchemaExtensions = `
    extend type CompleteQuote {
        displayName(locale: Locale!): String!
    }
    
    extend type BundledQuote {
        displayName(locale: Locale!): String!
    }
`

export default (quoteBaseType: string) => ({
    displayName: {
        fragment: `
            fragment QuoteDisplayNameCrossSchemaFragment on ${quoteBaseType} {
                typeOfContract
            }
        `,
        resolve: (
          quote: any,
          args: any
        ) => {
          const textKeyMap = require(`${process.cwd()}/src/translations/${args.locale}.json`)
          return textKeyMap[`CONTRACT_DISPLAY_NAME_${quote.typeOfContract}`] ?? ""
        },
      },
} as IResolvers)