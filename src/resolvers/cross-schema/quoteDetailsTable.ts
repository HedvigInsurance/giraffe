import { IResolvers } from 'graphql-tools'

export const crossSchemaExtensions = `
    type TableItem {
        label: String!
        value: String!
    }

    extend type CompleteQuote {
        detailsTable(locale: Locale!): [TableItem!]!
    }
    
    extend type BundledQuote {
        detailsTable(locale: Locale!): [TableItem!]!
    }
`

export default (quoteBaseType: string) => ({
    detailsTable: {
        fragment: `fragment CompleteQuoteCrossSchemaFragment on ${quoteBaseType} {
          quoteDetails {
            ... on SwedishApartmentQuoteDetails {
              street
              zipCode
              householdSize
              livingSpace
              swedishApartmentType: type
            }
            ... on SwedishHouseQuoteDetails {
                street
                zipCode
                householdSize
                livingSpace
                ancillarySpace
                extraBuildings {
                    ... on ExtraBuildingCore {
                        area
                        displayName
                        hasWaterConnected
                    }
                }
            }
            ... on NorwegianHomeContentsDetails {
                street
                zipCode
                coInsured
                livingSpace
                isYouth
                norwegianHomeType: type
            }
            ... on NorwegianTravelDetails {
                coInsured
                isYouth
            }
            ... on DanishHomeContentsDetails {
                street
                zipCode
                apartment
                floor
                bbrId
                city
                livingSpace
                coInsured
                isStudent
                danishHomeType: type
            }
            ... on DanishAccidentDetails {
                street
                zipCode
                coInsured
                isStudent
            }
            ... on DanishTravelDetails {
                street
                zipCode
                coInsured
                isStudent
            }
          }
        }`,
        resolve: (
          quote: any,
          args: any
        ) => {
          const textKeyMap = require(`../../translations/${args.locale}.json`)
          const labelMap: Record<string, string> = {
            "coInsured": textKeyMap["DETAILS_TABLE_COINSURED_LABEL"]
          }

          const valueRenderer: Record<string, (value: any) => string> = {
            "coInsured": (coInsured) => 
                textKeyMap["DETAILS_TABLE_COINSURED_VALUE"].replace("{coInsured}", coInsured),
          }

          return Object.keys(quote.quoteDetails).map(key => {
            let labelMapValue = labelMap[key]

            if (!labelMapValue) {
              return null
            }

            return ({
              label: labelMapValue,
              value: String(valueRenderer[key](quote.quoteDetails[key]))
            })
          }).filter(value => value)
        },
      },
} as IResolvers)