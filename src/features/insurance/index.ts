import {getInsurance, getUser} from '../../api'
import {ForwardHeaders} from '../../context'
import {ExtraBuilding, ExtraBuildingType, Insurance, Maybe, PreviousInsurer} from '../../generated/graphql'

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

  const extraBuildings : Maybe<ExtraBuilding[]> = insuranceResponse.extraBuildings?.map(building => ({
    ...building,
    type: building.type as ExtraBuildingType,
    __typename: 'ExtraBuildingValue'
  }))

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

export {loadInsurance}
