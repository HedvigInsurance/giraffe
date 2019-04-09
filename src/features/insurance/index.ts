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
  console.log(insuranceResponse)
  return {
    insuredAtOtherCompany: insuranceResponse.insuredAtOtherCompany,
    personsInHousehold: insuranceResponse.personsInHousehold,
    currentInsurerName: insuranceResponse.currentInsurerName,
    policyUrl: insuranceResponse.policyUrl,
    presaleInformationUrl: insuranceResponse.presaleInformationUrl,
    monthlyCost: insuranceResponse.currentTotalPrice,
    address: insuranceResponse.addressStreet,
    postalNumber: insuranceResponse.zipCode,
    certificateUrl: insuranceResponse.certificateUrl,
    status: insuranceResponse.status,
    type: insuranceResponse.insuranceType,
    activeFrom: insuranceResponse.activeFrom,
    perilCategories: insuranceResponse.categories,
    livingSpace: insuranceResponse.livingSpace,
    safetyIncreasers: user.safetyIncreasers,
  }
}

export { loadInsurance }
