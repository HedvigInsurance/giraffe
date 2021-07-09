import { gql } from 'apollo-server-koa';
import { ExtractField } from "graphql-tools"
import { SchemaIdentifier, CrossSchemaExtension } from "./index"

export const createSignOrApproveQuotesExtension = (): CrossSchemaExtension => ({
  dependencies: [SchemaIdentifier.UNDERWRITER],
  content: gql`
      union SignOrApprove = SignQuoteResponse | ApproveQuoteResponse

      type SignQuoteResponse {
        signResponse: StartSignResponse!
      }

      type ApproveQuoteResponse {
        approved: Boolean!
      }

      extend type Mutation {
          signOrApproveQuotes(quoteIds: [ID!]!): SignOrApprove!
      }
    `,
  resolvers: (schemas) => ({
    Mutation: {
      signOrApproveQuotes: {
        resolve: (
          _,
          args: {
            quoteIds: string[]
          },
          context,
          info
        ) => {
          const underwriterSchema = schemas(SchemaIdentifier.UNDERWRITER)

          return info.mergeInfo.delegateToSchema({
            schema: underwriterSchema,
            operation: 'query',
            fieldName: 'signMethodForQuotes',
            args: {
              input: args.quoteIds,
            },
            context,
            info: info,
            transforms: [
              {
                transformRequest: (originalRequest: any) => {
                  return {
                    ...originalRequest, document: gql`
                    query ($input: [ID!]!) {
                      signMethodForQuotes(input: $input)
                    }
                  ` }
                }
              }
            ]
          }).then((signMethod: string) => {
            switch (signMethod) {
              case "APPROVE_ONLY":
                return info.mergeInfo.delegateToSchema({
                  schema: underwriterSchema,
                  operation: 'mutation',
                  fieldName: 'approveQuotes',
                  args: {
                    quoteIds: args.quoteIds,
                  },
                  context,
                  info,
                  transforms: [
                    {
                      transformRequest: (originalRequest: any) => {
                        return {
                          ...originalRequest, document: gql`
                          mutation ($quoteIds: [ID!]!) {
                            approveQuotes(quoteIds: $quoteIds)
                          }
                        ` }
                      }
                    }
                  ]
                }).then((approved: boolean) => ({
                  __typename: "ApproveQuoteResponse",
                  approved
                }))
              default:
                return info.mergeInfo.delegateToSchema({
                  schema: underwriterSchema,
                  operation: 'mutation',
                  fieldName: 'signQuotes',
                  args: {
                    input: {
                      quoteIds: args.quoteIds,
                    }
                  },
                  context,
                  info,
                  transforms: [
                    new ExtractField({
                      from: ['signQuotes', 'signResponse'],
                      to: ['signQuotes']
                    })
                  ]
                }).then((startSignResponse: any) => ({
                  __typename: "SignQuoteResponse",
                  signResponse: startSignResponse
                }))
            }
          })

        }
      }
    }
  })
})