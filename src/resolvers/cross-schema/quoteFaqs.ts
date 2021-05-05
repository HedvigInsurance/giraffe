import { CrossSchemaExtension, SchemaIdentifier } from "./index"

export const createQuoteFaqsExtension = (): CrossSchemaExtension => ({
    dependencies: [SchemaIdentifier.GRAPH_CMS, SchemaIdentifier.UNDERWRITER],
    content: `
        extend type QuoteBundle {
            frequentlyAskedQuestions(locale: Locale!): [Faq!]!
        }
    `,
    resolvers: (schemas) => ({
      QuoteBundle: {
        frequentlyAskedQuestions: {
          fragment: `
            fragment QuoteFaqsCrossSchemaFragment on QuoteBundle {
              quotes { typeOfContract }
            }
          `,
          resolve: (_, args, context, info) => {
            return info.mergeInfo.delegateToSchema({
              schema: schemas(SchemaIdentifier.GRAPH_CMS),
              operation: 'query',
              fieldName: 'faqs',
              args: {
                where: {
                    language: {
                      code: args.locale
                    }
                }
              },
              context,
              info
          })
        }
      }
    }
  })
})