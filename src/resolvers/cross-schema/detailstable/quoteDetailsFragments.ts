export const getQuoteDetailsFragment = (quoteType: String) => {
    return `fragment QuoteDetailsCrossSchemaFragment on ${quoteType} {
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
      }`
}