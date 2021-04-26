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
        fragment: `fragment QuoteDetailsCrossSchemaFragment on ${quoteBaseType} {
          quoteDetails {
            ... on SwedishApartmentQuoteDetails {
                street
                zipCode
                householdSize
                livingSpace
            }
            ... on SwedishHouseQuoteDetails {
                street
                zipCode
                householdSize
                livingSpace
            }
            ... on NorwegianHomeContentsDetails {
                street
                zipCode
                coInsured
                livingSpace
            }
            ... on NorwegianTravelDetails {
                coInsured
            }
            ... on DanishHomeContentsDetails {
                street
                zipCode
                city
                livingSpace
                coInsured
            }
            ... on DanishAccidentDetails {
                street
                zipCode
                coInsured
            }
            ... on DanishTravelDetails {
                street
                zipCode
                coInsured
            }
          }
        }`,
        resolve: (
          quote: any,
          args: any
        ) => {
          const textKeyMap = require(`${__dirname}/../../translations/${args.locale}.json`)
          const labelMap: Record<string, string> = {
            "coInsured": textKeyMap["DETAILS_TABLE_COINSURED_LABEL"],
            "street": textKeyMap["DETAILS_TABLE_STREET_LABEL"],
            "zipCode": textKeyMap["DETAILS_TABLE_ZIP_CODE_LABEL"],
            "householdSize": textKeyMap["DETAILS_TABLE_COINSURED_LABEL"],
            "city": textKeyMap["DETAILS_TABLE_CITY_LABEL"],
            "livingSpace": textKeyMap["DETAILS_TABLE_LIVING_SPACE_LABEL"],
          }

          const valueRenderer: Record<string, (value: any) => string> = {
            "coInsured": (coInsured) => 
                textKeyMap["DETAILS_TABLE_COINSURED_VALUE"].replace("{coInsured}", coInsured),
            "street": (street) => street,
            "zipCode": (zipCode) => zipCode,
            "householdSize": (householdSize) => 
                textKeyMap["DETAILS_TABLE_COINSURED_VALUE"].replace("{coInsured}", householdSize - 1),
            "city": (city) => city,
            "livingSpace": (livingSpace) => String(livingSpace)
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