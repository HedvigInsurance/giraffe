import { gql } from 'apollo-server-koa';
import { SchemaIdentifier, CrossSchemaExtension } from "./index"

interface Quote {
  typeOfContract: String
}

interface QuoteBundle {
  quotes: Quote[]
}

export const createQuoteBundleDisplayNameExtension = (): CrossSchemaExtension => ({
    dependencies: [SchemaIdentifier.UNDERWRITER],
    content: gql`  
      extend type QuoteBundle {
          displayName(locale: Locale!): String!
      }
    `,
    resolvers: () => ({
        QuoteBundle: {
          displayName: {
            fragment: `fragment QuoteBundleDisplayNameCrossSchemaFragment on QuoteBundle {
              quotes {
                typeOfContract
              }
            }`,
            resolve: (
              quoteBundle: QuoteBundle,
              args: {
                  locale: string
              }
            ) => {
                    const textKeyMap = require(`${__dirname}/../../translations/${args.locale}.json`)

                    if (quoteBundle.quotes.length > 1) {
                        return textKeyMap["CONTRACT_BUNDLE"] ?? ""
                    }

                    const quote = quoteBundle.quotes[0]

                    return textKeyMap[`CONTRACT_DISPLAY_NAME_${quote.typeOfContract}`] ?? ""
                }
            }
        }
    })
  })