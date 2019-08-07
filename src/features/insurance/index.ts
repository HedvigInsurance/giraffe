import { getInsurance, getUser } from '../../api'
import { ForwardHeaders } from '../../context'
import { Insurance } from '../../typings/generated-graphql-types'

const loadInsurance = async (
  token: string,
  headers: ForwardHeaders,
): Promise<Insurance> => {
  const [insuranceResponse, user] = await Promise.all([
    getInsurance(token, headers),
    getUser(token, headers),
  ])

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
  }
}

export { loadInsurance }
