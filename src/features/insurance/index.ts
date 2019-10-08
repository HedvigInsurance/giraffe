import { getInsurance, getUser } from '../../api'
import { ForwardHeaders } from '../../context'
import { Insurance } from '../../typings/generated-graphql-types'
import { PreviousInsurer } from './../../typings/generated-graphql-types'

const switchableInsuranceProviders = [
  'ICA',
  'FOLKSAM',
  'TRYGG_HANSA',
  'TRE_KRONOR',
]

const previousInsurerMap = new Map<String, String>([
  ['LANSFORSAKRINGAR', 'Länsförsäkringar'],
  ['IF', 'If'],
  ['FOLKSAM', 'Folksam'],
  ['TRYGG_HANSA', 'Trygg-Hansa'],
  ['MODERNA', 'Moderna Försäkringar'],
  ['ICA', 'ICA Försäkring'],
  ['GJENSIDIGE', 'Gjensidige'],
  ['VARDIA', 'Vardia'],
  ['TRE_KRONOR', 'Tre kronor'],
  ['OTHER', ''],
])

const loadInsurance = async (
  token: string,
  headers: ForwardHeaders,
): Promise<Insurance> => {
  const [insuranceResponse, user] = await Promise.all([
    getInsurance(token, headers),
    getUser(token, headers),
  ])

  const previousInsurer = insuranceResponse.insuredAtOtherCompany
    ? ({
        id: insuranceResponse.currentInsurerName,
        displayName: previousInsurerMap.get(
          insuranceResponse.currentInsurerName,
        ),
        switchable: switchableInsuranceProviders.includes(
          insuranceResponse.currentInsurerName,
        ),
      } as PreviousInsurer)
    : undefined

  const extraBuildings = insuranceResponse.extraBuildings ? insuranceResponse.extraBuildings.map(
    (extraBuilding) => {
      if (extraBuilding.type == 'GARAGE') {
        return {
          __typename: 'ExtraBuildingGarage',
          area: extraBuilding.area,
          hasWaterConnected: extraBuilding.hasWaterConnected,
        }
      }
      if (extraBuilding.type == 'CARPORT') {
        return {
          __typename: 'ExtraBuildingCarport',
          area: extraBuilding.area,
          hasWaterConnected: extraBuilding.hasWaterConnected,
        }
      }
      if (extraBuilding.type == 'SHED') {
        return {
          __typename: 'ExtraBuildingShed',
          area: extraBuilding.area,
          hasWaterConnected: extraBuilding.hasWaterConnected,
        }
      }
      if (extraBuilding.type == 'STOREHOUSE') {
        return {
          __typename: 'ExtraBuildingStorehouse',
          area: extraBuilding.area,
          hasWaterConnected: extraBuilding.hasWaterConnected,
        }
      }
      if (extraBuilding.type == 'FRIGGEBOD') {
        return {
          __typename: 'ExtraBuildingFriggebod',
          area: extraBuilding.area,
          hasWaterConnected: extraBuilding.hasWaterConnected,
        }
      }
      if (extraBuilding.type == 'ATTEFALL') {
        return {
          __typename: 'ExtraBuildingAttefall',
          area: extraBuilding.area,
          hasWaterConnected: extraBuilding.hasWaterConnected,
        }
      }

      if (extraBuilding.type == 'OUTHOUSE') {
        return {
          __typename: 'ExtraBuildingOuthouse',
          area: extraBuilding.area,
          hasWaterConnected: extraBuilding.hasWaterConnected,
        }
      }
      if (extraBuilding.type == 'GUESTHOUSE') {
        return {
          __typename: 'ExtraBuildingGuesthouse',
          area: extraBuilding.area,
          hasWaterConnected: extraBuilding.hasWaterConnected,
        }
      }
      if (extraBuilding.type == 'GAZEBO') {
        return {
          __typename: 'ExtraBuildingGazebo',
          area: extraBuilding.area,
          hasWaterConnected: extraBuilding.hasWaterConnected,
        }
      }
      if (extraBuilding.type == 'GREENHOUSE') {
        return {
          __typename: 'ExtraBuildingGreenhouse',
          area: extraBuilding.area,
          hasWaterConnected: extraBuilding.hasWaterConnected,
        }
      }
      if (extraBuilding.type == 'SAUNA') {
        return {
          __typename: 'ExtraBuildingSauna',
          area: extraBuilding.area,
          hasWaterConnected: extraBuilding.hasWaterConnected,
        }
      }
      if (extraBuilding.type == 'BARN') {
        return {
          __typename: 'ExtraBuildingBarn',
          area: extraBuilding.area,
          hasWaterConnected: extraBuilding.hasWaterConnected,
        }
      }
      if (extraBuilding.type == 'BOATHOUSE') {
        return {
          __typename: 'ExtraBuildingBoathouse',
          area: extraBuilding.area,
          hasWaterConnected: extraBuilding.hasWaterConnected,
        }
      }
      if (extraBuilding.type == 'OTHER') {
        return {
          __typename: 'ExtraBuildingOther',
          area: extraBuilding.area,
          hasWaterConnected: extraBuilding.hasWaterConnected,
        }
      }
      return {
        area: extraBuilding.area,
        hasWaterConnected: extraBuilding.hasWaterConnected,
      }
    },
  ) : null

  return {
    insuredAtOtherCompany: insuranceResponse.insuredAtOtherCompany,
    personsInHousehold: insuranceResponse.personsInHousehold,
    currentInsurerName: insuranceResponse.currentInsurerName,
    cost: insuranceResponse.cost,
    policyUrl: insuranceResponse.policyUrl,
    presaleInformationUrl: insuranceResponse.presaleInformationUrl,
    address: insuranceResponse.addressStreet,
    postalNumber: insuranceResponse.zipCode,
    certificateUrl: insuranceResponse.certificateUrl,
    status: insuranceResponse.status,
    type: insuranceResponse.insuranceType,
    activeFrom: insuranceResponse.activeFrom,
    perilCategories: insuranceResponse.categories,
    arrangedPerilCategories: {
      me: insuranceResponse.categories[0],
      home: insuranceResponse.categories[1],
      stuff: insuranceResponse.categories[2],
    },
    livingSpace: insuranceResponse.livingSpace,
    monthlyCost: insuranceResponse.currentTotalPrice,
    safetyIncreasers: user.safetyIncreasers,
    renewal: insuranceResponse.renewal,
    previousInsurer,
    ancillaryArea: insuranceResponse.ancillaryArea,
    yearOfConstruction: insuranceResponse.yearOfConstruction,
    numberOfBathrooms: insuranceResponse.numberOfBathrooms,
    extraBuildings,
    isSubleted: insuranceResponse.isSubleted,
  }
}

export { loadInsurance }
