import { gql } from 'apollo-server-koa';
import { SchemaIdentifier, CrossSchemaExtension } from "./index"

interface Quote {
  initiatedFrom: String
  typeOfContract: String
}

interface QuoteBundle {
  quotes: Quote[]
}

export const createQuoteBundleAppConfigurationExtension = (): CrossSchemaExtension => ({
  dependencies: [SchemaIdentifier.UNDERWRITER],
  content: gql`
    enum QuoteBundleAppConfigurationTitle {
        LOGO
        UPDATE_SUMMARY
    }

    enum QuoteBundleAppConfigurationGradientOption {
        GRADIENT_ONE
        GRADIENT_TWO
        GRADIENT_THREE
    }

    type QuoteBundleAppConfiguration {
        showCampaignManagement: Boolean!
        title: QuoteBundleAppConfigurationTitle!
        gradientOption: QuoteBundleAppConfigurationGradientOption!
    }

    extend type QuoteBundle {
        appConfiguration: QuoteBundleAppConfiguration!
    }
  `,
  resolvers: () => ({
      QuoteBundle: {
        appConfiguration: {
          fragment: `fragment QuoteBundleAppConfigurationCrossSchemaFragment on QuoteBundle {
            quotes {
              initiatedFrom
              typeOfContract
            }
          }`,
          resolve: (
            quoteBundle: QuoteBundle,
          ) => {
            const firstQuote = quoteBundle.quotes[0]
            const isSelfChangeQuote = firstQuote.initiatedFrom == "SELF_CHANGE"

            const gradientOptionMap: ((quotes: Quote[]) => string | null)[] = [
              (quotes) => quotes.find(quote => quote.typeOfContract.includes("SE_HOUSE")) ? "GRADIENT_TWO" : null,
              (quotes) => quotes.find(quote => quote.typeOfContract.includes("SE_APARTMENT")) ? "GRADIENT_ONE" : null,
              (quotes) => {
                if (quotes.length > 1) {
                  return "GRADIENT_ONE"
                }

                return quotes.find(quote => quote.typeOfContract.includes("HOME_CONTENT")) ? "GRADIENT_TWO" : "GRADIENT_THREE"
              }
            ]

            const gradientOption = gradientOptionMap.map(mapper => mapper(quoteBundle.quotes)).find(item => item)

            return isSelfChangeQuote ? {
                showCampaignManagement: false,
                title: "UPDATE_SUMMARY",
                gradientOption
            } : {
                showCampaignManagement: true,
                title: "LOGO",
                gradientOption
            }
            }
        },
      }
  })
})