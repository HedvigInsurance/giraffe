import { IResolvers } from 'graphql-tools'
import { SchemaIdentifier, Schemas } from "./index"

export const crossSchemaExtensions = `
    """An inception where quotes are conjoined and should update in tandem"""
    type ConjoinedInception {
      correspondingQuotes: [Quote!]!
      startDate: LocalDate!
    }

    """An inception that may be switchable and has a single date"""
    type SwitchableInception {
      correspondingQuote: Quote!
      startDate: LocalDate
      currentInsurer: CurrentInsurer
    }

    union IndependentInception = SwitchableInception

    """A bundle inception where each quote may have a different inception"""
    type IndependentInceptions {
      inceptions: [IndependentInception!]!
    }

    union QuoteBundleInception = ConjoinedInception | IndependentInceptions

    extend type QuoteBundle {
      inception: QuoteBundleInception!
    }
`

interface CurrentInsurer {
  id: string
  displayName: string
  switchable: string
}

interface ConjoinedInception {
  __typename: string
  startDate: string
  correspondingQuotes: {
    __typename: string
    id: string
  }[]
}

interface SwitchableInception {
  __typename: string
  startDate: string
  currentInsurer: null | CurrentInsurer
  correspondingQuote: {
    __typename: string
    id: string
  }
}

interface IndependentInceptions {
  __typename: string
  inceptions: (ConjoinedInception | SwitchableInception)[]
}

interface Quote {
  displayName: string
  typeOfContract: string
  id: string
  startDate: string
  currentInsurer: CurrentInsurer
}

interface QuoteBundle {
  quotes: Quote[]
}

function isConjoinedInception(object: any): object is ConjoinedInception {
  return object?.__typename == "ConjoinedInception"
}

function isIndependentInceptions(object: any): object is IndependentInceptions {
  return object?.__typename == "IndependentInceptions"
}

export default (schemas: Schemas): IResolvers => ({
  ConjoinedInception: {
    correspondingQuotes: {
      resolve: async (inception: ConjoinedInception, _: any, context, info) =>
        Promise.all(inception.correspondingQuotes.map((quote: any) => info.mergeInfo.delegateToSchema({
          schema: schemas(SchemaIdentifier.UNDERWRITER),
          operation: 'query',
          fieldName: 'quote',
          args: {
            id: quote.id,
          },
          context,
          info,
        })))
      }
  },
  SwitchableInception: {
    correspondingQuote: {
      resolve: (inception: SwitchableInception, _: any, context, info) => info.mergeInfo.delegateToSchema({
        schema: schemas(SchemaIdentifier.UNDERWRITER),
        operation: 'query',
        fieldName: 'quote',
        args: {
          id: inception.correspondingQuote.id,
        },
        context,
        info,
      })
    }
  },
  QuoteBundle: {
    inception: {
      fragment: `fragment QuoteBundleInceptionCrossSchemaFragment on QuoteBundle {
        quotes {
          displayName
          typeOfContract
          id
          startDate
          currentInsurer {
            id
            displayName
            switchable
          }
        }
      }`,
      resolve: async (
        quoteBundle: QuoteBundle,
      ) => {
        return quoteBundle.quotes.reduce((acc: ConjoinedInception | IndependentInceptions | null, quote: Quote) => {
          if (quote.typeOfContract.includes("DK")) {
            if (isConjoinedInception(acc)) {
              if (acc.startDate != quote.startDate) {
                throw new Error("Invalid state, danish quotes can't have independent start dates")
              }

              return {
                ...acc,
                correspondingQuotes: [
                  ...acc.correspondingQuotes,
                  {
                    __typename: "CompleteQuote",
                    id: quote.id,
                  }
                ],
              } as ConjoinedInception
            }

            return {
              __typename: "ConjoinedInception",
              correspondingQuotes: [
                {
                  __typename: "CompleteQuote",
                  id: quote.id,
                }
              ],
              startDate: quote.startDate
            } as ConjoinedInception
          }

          if (isIndependentInceptions(acc)) {
            return {
              ...acc,
              inceptions: [
                ...acc.inceptions,
                {
                  __typename: "SwitchableInception",
                  correspondingQuote: {
                    __typename: "CompleteQuote",
                    id: quote.id,
                  },
                  startDate: quote.startDate,
                  currentInsurer: quote.currentInsurer
                }
              ]
            } as IndependentInceptions
          }

          return {
            __typename: "IndependentInceptions",
            inceptions: [
              {
                __typename: "SwitchableInception",
                correspondingQuote: {
                  __typename: "CompleteQuote",
                  id: quote.id,
                },
                startDate: quote.startDate,
                currentInsurer: quote.currentInsurer
              }
            ]
          } as IndependentInceptions
        }, null);
      },
    },
  }
})