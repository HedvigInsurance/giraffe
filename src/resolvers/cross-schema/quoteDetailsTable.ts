import { IResolvers } from 'graphql-tools'

interface TableRow {
  title: string;
  subtitle: string | null;
  value: string;
}

interface TableSection {
  title: string;
  rows: TableRow[];
}

interface Table {
  title: string;
  sections: TableSection[];
}

export const crossSchemaExtensions = `
    type TableRow {
      title: String!
      subtitle: String
      value: String!
    }

    type TableSection {
      title: String!
      rows: [TableRow!]!
    }

    type Table {
      title: String!
      sections: [TableSection!]!
    }

    extend type CompleteQuote {
        detailsTable(locale: Locale!): Table!
    }
    
    extend type BundledQuote {
        detailsTable(locale: Locale!): Table!
    }
`

export default (quoteBaseType: string) => ({
    detailsTable: {
        fragment: `fragment QuoteDetailsCrossSchemaFragment on ${quoteBaseType} {
          typeOfContract
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
                numberOfBathrooms
                yearOfConstruction
                isSubleted
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
                norwegianHomeContentType: type
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
                danishHomeContentType: type
            }
            ... on DanishAccidentDetails {
                coInsured
            }
            ... on DanishTravelDetails {
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
            "swedishApartmentType": textKeyMap["DETAILS_TABLE_SWEDISH_APARTMENT_TYPE_LABEL"],
            "norwegianHomeContentType": textKeyMap["DETAILS_TABLE_NORWEGIAN_HOME_CONTENT_TYPE_LABEL"],
            "danishHomeContentType": textKeyMap["DETAILS_TABLE_DANISH_HOME_CONTENT_TYPE_LABEL"],
            "ancillarySpace": textKeyMap["DETAILS_TABLE_ANCILLARY_SPACE_LABEL"],
            "numberOfBathrooms": textKeyMap["DETAILS_TABLE_NUMBER_OF_BATHROOMS_LABEL"],
            "yearOfConstruction": textKeyMap["DETAILS_TABLE_YEAR_OF_CONSTRUCTION_LABEL"],
            "isSubleted": textKeyMap["DETAILS_TABLE_IS_SUBLETED_LABEL"]
          }

          const valueRenderer: Record<string, (value: any) => string> = {
            "coInsured": (coInsured) => 
                textKeyMap["DETAILS_TABLE_COINSURED_VALUE"].replace("{coInsured}", coInsured),
            "street": (street) => street,
            "zipCode": (zipCode) => zipCode,
            "householdSize": (householdSize) => 
                textKeyMap["DETAILS_TABLE_COINSURED_VALUE"].replace("{coInsured}", householdSize - 1),
            "city": (city) => city,
            "livingSpace": (livingSpace) => `${livingSpace} m2`,
            "ancillarySpace": (ancillarySpace) => `${ancillarySpace} m2`,
            "swedishApartmentType": (swedishApartmentType) => textKeyMap[`DETAILS_TABLE_SWEDISH_APARTMENT_TYPE_${swedishApartmentType}_VALUE`],
            "danishHomeContentType": (danishHomeContentType) => textKeyMap[`DETAILS_TABLE_DANISH_HOME_CONTENT_TYPE_${danishHomeContentType}_VALUE`],
            "norwegianHomeContentType": (norwegianHomeContentType) => textKeyMap[`DETAILS_TABLE_NORWEGIAN_HOME_CONTENT_TYPE_${norwegianHomeContentType}_VALUE`],
            "numberOfBathrooms": (numberOfBathrooms) => String(numberOfBathrooms),
            "yearOfConstruction": (yearOfConstruction) => String(yearOfConstruction),
            "isSubleted": (isSubleted) => isSubleted ? textKeyMap["DETAILS_TABLE_IS_SUBLETED_YES_VALUE"] : textKeyMap["DETAILS_TABLE_IS_SUBLETED_NO_VALUE"]
          }

          const sections: Record<string, () => TableSection> = {
            "details": () => ({
              title: textKeyMap["DETAILS_TABLE_DETAILS_SECTION_TITLE"],
              rows: Object.keys(quote.quoteDetails).map(key => {
                let labelMapValue = labelMap[key]
    
                if (!labelMapValue) {
                  return null
                }
    
                return ({
                  title: labelMapValue,
                  subtitle: null,
                  value: String(valueRenderer[key](quote.quoteDetails[key]))
                })
              }).filter(value => value) as TableRow[]
            }),
            "extraBuildings": () => ({
              title: textKeyMap["DETAILS_TABLE_EXTRA_BUILDING_SECTION_TITLE"],
              rows: (quote.quoteDetails.extraBuildings || []).map((extraBuilding: any) => ({
                title: extraBuilding.displayName ?? "",
                subtitle: extraBuilding.hasWaterConnected ? textKeyMap["DETAILS_TABLE_EXTRA_BUILDING_HAS_WATER_CONNECTED_SUBTITLE"] : null,
                value: `${extraBuilding.area} m2`
              }))
            })
          }

          return ({
            title: textKeyMap[`CONTRACT_DISPLAY_NAME_${quote.typeOfContract}`],
            sections: Object.keys(sections).map(key => sections[key]()).filter(section => section.rows.length > 0)
          }) as Table
        },
      },
} as IResolvers)