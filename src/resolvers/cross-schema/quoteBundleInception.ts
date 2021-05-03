import { IResolvers } from 'graphql-tools'
import { SchemaIdentifier, Schemas } from "./index"

export const crossSchemaExtensions = `
    """An inception where all quotes need to have the same startDate and currentInsurer"""
    type ConcurrentInception {
      correspondingQuotes: [Quote!]!
      startDate: LocalDate
      currentInsurer: CurrentInsurer
    }

    """An inception that may be switchable and has a single date"""
    type IndependentInception {
      correspondingQuote: Quote!
      startDate: LocalDate
      currentInsurer: CurrentInsurer
    }

    """A bundle inception where each quote may have an inception different from the others"""
    type IndependentInceptions {
      inceptions: [IndependentInception!]!
    }

    union QuoteBundleInception = ConcurrentInception | IndependentInceptions

    extend type QuoteBundle {
      inception: QuoteBundleInception!
    }
`

interface CurrentInsurer {
  id: string
  displayName: string
  switchable: string
}

interface ConcurrentInception {
  __typename: string
  startDate: string
  correspondingQuotes: {
    __typename: string
    id: string
  }[]
  currentInsurer: null | CurrentInsurer
}

interface IndependentInception {
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
  inceptions: IndependentInception[]
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

function isConcurrentInception(object: any): object is ConcurrentInception {
  return object?.__typename == "ConcurrentInception"
}

function isIndependentInceptions(object: any): object is IndependentInceptions {
  return object?.__typename == "IndependentInceptions"
}

export default (schemas: Schemas): IResolvers => ({
  ConcurrentInception: {
    correspondingQuotes: {
      resolve: async (inception: ConcurrentInception, _: any, context, info) =>
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
  IndependentInception: {
    correspondingQuote: {
      resolve: (inception: IndependentInception, _: any, context, info) => info.mergeInfo.delegateToSchema({
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
        return quoteBundle.quotes.reduce((acc: ConcurrentInception | IndependentInceptions | null, quote: Quote) => {
          if (quote.typeOfContract.includes("DK")) {
            if (isConcurrentInception(acc)) {
              if (acc.startDate != quote.startDate) {
                throw new Error("Invalid state, DK quotes can't have independent start dates")
              } else if (acc.currentInsurer?.id != quote.currentInsurer?.id) {
                throw new Error("Invalid state, DK quotes can't have independent current insurers")
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
              } as ConcurrentInception
            }

            return {
              __typename: "ConcurrentInception",
              correspondingQuotes: [
                {
                  __typename: "CompleteQuote",
                  id: quote.id,
                }
              ],
              startDate: quote.startDate
            } as ConcurrentInception
          }

          if (isIndependentInceptions(acc)) {
            return {
              ...acc,
              inceptions: [
                ...acc.inceptions,
                {
                  __typename: "IndependentInception",
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
                __typename: "IndependentInception",
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