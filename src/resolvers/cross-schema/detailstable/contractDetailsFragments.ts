export const currentAgreementFragment = `fragment ContractCrossSchemaFragment on Contract {    
    displayName
    currentAgreement {
        ... on SwedishApartmentAgreement {
          address {
            street
            zipCode: postalCode
            city
          }
          squareMeters
          activeFrom
          coInsured: numberCoInsured
          swedishApartmentType: type
        }
        ... on SwedishHouseAgreement {
          address {
            street
            zipCode: postalCode
            city
          }
          squareMeters
          activeFrom
          coInsured: numberCoInsured
          ancillarySpace: ancillaryArea
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
        ... on NorwegianHomeContentAgreement {
          address {
            street
            zipCode: postalCode
            city
          }
          squareMeters
          coInsured: numberCoInsured
          activeFrom
          norwegianHomeContentType: type
        }
        ... on DanishHomeContentAgreement {
          address {
            street
            zipCode: postalCode
            city
          }
          squareMeters
          coInsured: numberCoInsured
          activeFrom
          danishHomeContentType: type
        }
      }  
  }`

export const upcomingAgreementChangeFragment = `fragment ContractCrossSchemaFragment on Contract {    
  status {
    ... on ActiveStatus {
      upcomingAgreementChange {
        newAgreement {
          ... on SwedishApartmentAgreement {
            address {
              street
              zipCode: postalCode
              city
            }
            squareMeters
            activeFrom
            coInsured: numberCoInsured
            swedishApartmentType: type
          }
          ... on SwedishHouseAgreement {
            address {
              street
              zipCode: postalCode
              city
            }
            squareMeters
            activeFrom
            coInsured: numberCoInsured
            ancillarySpace: ancillaryArea
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
          ... on NorwegianHomeContentAgreement {
            address {
              street
              zipCode: postalCode
              city
            }
            squareMeters
            coInsured: numberCoInsured
            activeFrom
            norwegianHomeContentType: type
          }
          ... on DanishHomeContentAgreement {
            address {
              street
              zipCode: postalCode
              city
            }
            squareMeters
            coInsured: numberCoInsured
            activeFrom
            danishHomeContentType: type
          }
        }
      }
    }
    ... on TerminatedInFutureStatus {
      upcomingAgreementChange {
        newAgreement {
          ... on SwedishApartmentAgreement {
            address {
              street
              zipCode: postalCode
              city
            }
            squareMeters
            activeFrom
            coInsured: numberCoInsured
            swedishApartmentType: type
          }
          ... on SwedishHouseAgreement {
            address {
              street
              zipCode: postalCode
              city
            }
            squareMeters
            activeFrom
            coInsured: numberCoInsured
            ancillarySpace: ancillaryArea
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
          ... on NorwegianHomeContentAgreement {
            address {
              street
              zipCode: postalCode
              city
            }
            squareMeters
            coInsured: numberCoInsured
            activeFrom
            norwegianHomeContentType: type
          }
          ... on DanishHomeContentAgreement {
            address {
              street
              zipCode: postalCode
              city
            }
            squareMeters
            coInsured: numberCoInsured
            activeFrom
            danishHomeContentType: type
          }
        }
      }
    }
    ... on TerminatedTodayStatus {
      upcomingAgreementChange {
        newAgreement {
          ... on SwedishApartmentAgreement {
            address {
              street
              zipCode: postalCode
              city
            }
            squareMeters
            activeFrom
            coInsured: numberCoInsured
            swedishApartmentType: type
          }
          ... on SwedishHouseAgreement {
            address {
              street
              zipCode: postalCode
              city
            }
            squareMeters
            activeFrom
            coInsured: numberCoInsured
            ancillarySpace: ancillaryArea
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
          ... on NorwegianHomeContentAgreement {
            address {
              street
              zipCode: postalCode
              city
            }
            squareMeters
            coInsured: numberCoInsured
            activeFrom
            norwegianHomeContentType: type
          }
          ... on DanishHomeContentAgreement {
            address {
              street
              zipCode: postalCode
              city
            }
            squareMeters
            coInsured: numberCoInsured
            activeFrom
            danishHomeContentType: type
          }
        }
      }
    }
  }
}`