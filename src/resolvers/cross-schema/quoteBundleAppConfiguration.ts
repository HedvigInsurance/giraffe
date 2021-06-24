import { gql } from 'apollo-server-koa';
import { SchemaIdentifier, CrossSchemaExtension } from "./index"

interface Quote {
  initiatedFrom: String
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

    type QuoteBundleAppConfiguration {
        showCampaignManagement: Boolean!
        title: QuoteBundleAppConfigurationTitle!
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
            }
          }`,
          resolve: (
            quoteBundle: QuoteBundle,
          ) => {
            const firstQuote = quoteBundle.quotes[0]
            const isSelfChangeQuote = firstQuote.initiatedFrom == "SELF_CHANGE"

            return isSelfChangeQuote ? {
                showCampaignManagement: false,
                title: "UPDATE_SUMMARY"
            } : {
                showCampaignManagement: true,
                title: "LOGO"
            }
            }
        },
      }
  })
})